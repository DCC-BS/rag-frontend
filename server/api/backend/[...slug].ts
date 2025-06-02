import type { EventHandlerRequest, H3Event } from "h3";
import { sendStream } from "h3";
import { getServerSession, getToken } from "#auth";

interface ErrorWithStatusCode extends Error {
    statusCode?: number;
}

export default defineEventHandler(
    async (event: H3Event<EventHandlerRequest>) => {
        const session = await getServerSession(event);
        const token = await getToken({
            event,
        });
        const idToken = (token as { idToken?: string })?.idToken;
        const accessToken = (token as { accessToken?: string })?.accessToken;

        if (!session && !token) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: "You must be logged in to access this resource.",
            });
        }

        const config = useRuntimeConfig(event);
        const targetBaseUrl = config.fastapiUrl;

        const slug = event.context.params?.slug ?? "";
        const targetUrl = `${targetBaseUrl}/${slug}`;

        try {
            const body = ["POST", "PUT", "PATCH"].includes(event.method)
                ? await readBody(event)
                : undefined;

            const response = await fetch(targetUrl, {
                method: event.method,
                body: JSON.stringify(body),
                headers: {
                    Authorization: idToken || "",
                    "Content-Type":
                        getRequestHeader(event, "content-type") ||
                        "application/json",
                    Accept: getRequestHeader(event, "accept") || "*/*",
                    "X-Access-Token": accessToken || "",
                },
            });

            return new Response(response.body);
        } catch (error) {
            console.error(
                `[Nuxt Server Proxy] Error fetching ${targetUrl}:`,
                error,
            );
            const err = error as ErrorWithStatusCode;
            if (typeof err.statusCode === "number") {
                throw err;
            }
            throw createError({
                statusCode: 502,
                statusMessage: "Bad Gateway",
                message: `Failed to communicate with the backend service. ${err.message}`,
            });
        }
    },
);
