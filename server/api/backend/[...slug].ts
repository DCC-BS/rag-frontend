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
    const isMultipart = body instanceof FormData;

    // Prepare headers
    const headers: Record<string, string> = {
        Authorization: idToken || "",
        Accept: getRequestHeader(event, "accept") || "*/*",
        "X-Access-Token": accessToken || "",
    };

    // For multipart/form-data with FormData, let fetch set the Content-Type header
    // as it needs to generate the boundary. For other requests, set it manually.
    if (!isMultipart) {
        const contentType = getRequestHeader(event, "content-type");
        headers["Content-Type"] = contentType || "application/json";
    }

    return await fetch(targetUrl, {
        method,
        // For multipart requests, pass FormData object directly
        // For others, JSON stringify
        body: body
            ? isMultipart
                ? (body as FormData)
                : JSON.stringify(body)
            : undefined,
        headers,
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

        // Handle different body types based on content type
        let body: unknown = undefined;
        if (["POST", "PUT", "PATCH"].includes(event.method)) {
            const contentType = getRequestHeader(event, "content-type");
            if (contentType?.includes("multipart/form-data")) {
                const multipartData = await readMultipartFormData(event);
                if (multipartData) {
                    const formData = new FormData();
                    for (const part of multipartData) {
                        if (part.name) {
                            if (part.filename) {
                                const blob = new Blob([part.data], {
                                    type: part.type,
                                });
                                formData.append(part.name, blob, part.filename);
                            } else {
                                formData.append(
                                    part.name,
                                    part.data.toString(),
                                );
                            }
                        }
                    }
                    body = formData;
                }
            } else {
                // For other content types, read as usual
                body = await readBody(event);
            }
        }

        try {
            // Make request with current tokens
            // Token refresh is handled automatically by the auth handler's JWT callback
            const response = await makeBackendRequest(
                targetUrl,
                event.method,
                body,
                idToken || "",
                accessToken || "",
                event,
            );

            // If we get a 401, the tokens are likely expired or invalid
            if (response.status === 401) {
                throw createError({
                    statusCode: 401,
                    statusMessage: "Unauthorized",
                    message:
                        "Authentication failed. Please refresh your session or sign in again.",
                });
            }

            // For non-successful responses, throw an error to preserve status code
            if (!response.ok) {
                const errorBody = await response.text();
                throw createError({
                    statusCode: response.status,
                    statusMessage: response.statusText,
                    data: errorBody ? JSON.parse(errorBody) : undefined,
                });
            }

            // Return successful response with proper status and headers
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            });
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
