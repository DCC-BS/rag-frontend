import type { EventHandlerRequest, H3Event } from "h3";
import { sendStream } from "h3";
import { getServerSession, getToken } from "#auth";

interface ErrorWithStatusCode extends Error {
    statusCode?: number;
}

/**
 * Check if the error indicates token expiration
 */
function isTokenExpiredError(error: unknown): boolean {
    if (error && typeof error === "object") {
        const err = error as { statusCode?: number; status?: number };
        return err.statusCode === 401 || err.status === 401;
    }
    return false;
}

/**
 * Refresh the session and get new tokens
 */
async function refreshSessionTokens(
    event: H3Event<EventHandlerRequest>,
): Promise<{
    idToken: string | undefined;
    accessToken: string | undefined;
}> {
    // Get a fresh token and session
    const refreshedToken = await getToken({
        event,
    });

    const session = await getServerSession(event);

    return {
        idToken: (refreshedToken as { idToken?: string })?.idToken,
        accessToken: (refreshedToken as { accessToken?: string })?.accessToken,
    };
}

/**
 * Make request to backend with given tokens
 */
async function makeBackendRequest(
    targetUrl: string,
    method: string,
    body: unknown,
    idToken: string,
    accessToken: string,
    event: H3Event<EventHandlerRequest>,
): Promise<Response> {
    return await fetch(targetUrl, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            Authorization: idToken || "",
            "Content-Type":
                getRequestHeader(event, "content-type") || "application/json",
            Accept: getRequestHeader(event, "accept") || "*/*",
            "X-Access-Token": accessToken || "",
        },
    });
}

export default defineEventHandler(
    async (event: H3Event<EventHandlerRequest>) => {
        const session = await getServerSession(event);
        const token = await getToken({
            event,
        });

        // Check for session error (token refresh failed)
        if (
            (session as { error?: string })?.error === "RefreshAccessTokenError"
        ) {
            throw createError({
                statusCode: 401,
                statusMessage: "Token Refresh Failed",
                message:
                    "Authentication tokens have expired and could not be refreshed. Please sign in again.",
            });
        }

        let idToken = (token as { idToken?: string })?.idToken;
        let accessToken = (token as { accessToken?: string })?.accessToken;

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

        const body = ["POST", "PUT", "PATCH"].includes(event.method)
            ? await readBody(event)
            : undefined;

        try {
            // First attempt with current tokens
            let response = await makeBackendRequest(
                targetUrl,
                event.method,
                body,
                idToken || "",
                accessToken || "",
                event,
            );

            // If we get a 401, try to refresh tokens and retry once
            if (response.status === 401) {
                console.log("Received 401, attempting to refresh tokens...");

                try {
                    const refreshedTokens = await refreshSessionTokens(event);
                    idToken = refreshedTokens.idToken;
                    accessToken = refreshedTokens.accessToken;

                    if (idToken || accessToken) {
                        // Retry with refreshed tokens
                        response = await makeBackendRequest(
                            targetUrl,
                            event.method,
                            body,
                            idToken || "",
                            accessToken || "",
                            event,
                        );
                    } else {
                        throw createError({
                            statusCode: 401,
                            statusMessage: "Token Refresh Failed",
                            message:
                                "Unable to refresh authentication tokens. Please sign in again.",
                        });
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    throw createError({
                        statusCode: 401,
                        statusMessage: "Authentication Failed",
                        message:
                            "Authentication tokens expired and refresh failed. Please sign in again.",
                    });
                }
            }

            // Check if the response is still unauthorized after refresh attempt
            if (response.status === 401) {
                throw createError({
                    statusCode: 401,
                    statusMessage: "Unauthorized",
                    message: "Authentication failed. Please sign in again.",
                });
            }

            return new Response(response.body);
        } catch (error) {
            console.error(
                `[Nuxt Server Proxy] Error fetching ${targetUrl}:`,
                error,
            );

            // If it's a token expiration error, provide specific guidance
            if (isTokenExpiredError(error)) {
                throw createError({
                    statusCode: 401,
                    statusMessage: "Token Expired",
                    message:
                        "Your authentication session has expired. Please sign in again.",
                });
            }

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
