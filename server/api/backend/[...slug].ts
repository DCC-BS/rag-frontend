import type { H3Event, EventHandlerRequest } from "h3";
import { getServerSession, getToken } from "#auth";

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

        const slug = event.context.params?.slug || "";
        const targetUrl = `${targetBaseUrl}/${slug}`;

        try {
            const response = await $fetch.raw(targetUrl, {
                method: event.method,
                query: getQuery(event),
                body: ["POST", "PUT", "PATCH"].includes(event.method)
                    ? await readBody(event).catch(() => undefined)
                    : undefined,
                headers: {
                    Authorization: idToken || "",
                    "Content-Type":
                        getRequestHeader(event, "content-type") ||
                        "application/json",
                    Accept: getRequestHeader(event, "accept") || "*/*",
                    "X-Access-Token": accessToken || "",
                },
                ignoreResponseError: true,
            });

            // Forward status code, headers and body from FastAPI to frontend Client
            setResponseStatus(event, response.status);

            if (response.headers.has("content-type")) {
                setResponseHeader(
                    event,
                    "content-type",
                    response.headers.get("content-type") || "application/json",
                );
            }

            if (response.headers.has("content-length")) {
                setResponseHeader(
                    event,
                    "content-length",
                    Number.parseInt(
                        response.headers.get("content-length") || "0",
                    ),
                );
            }

            return response._data;
        } catch (error) {
            console.error(
                `[Nuxt Server Proxy] Error fetching ${targetUrl}:`,
                error,
            );
            const err = error as Error;
            throw createError({
                statusCode: 502,
                statusMessage: "Bad Gateway",
                message: `Failed to communicate with the backend service. ${err.message}`,
            });
        }
    },
);
