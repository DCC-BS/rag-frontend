import { getHeader, readBody, readFormData } from "h3";

type Method = "POST" | "GET" | "PUT" | "DELETE";

/**
 * Custom fetcher for file uploads that handles FormData properly
 */
async function formDataFetcher<T>(
    url: string,
    method: Method,
    body: unknown,
    headers: Record<string, string>,
): Promise<T> {
    // Handle FormData separately - don't stringify and don't set Content-Type
    if (body instanceof FormData) {
        // Remove Content-Type header to let the browser set it with proper boundary
        const { "Content-Type": _, ...headersWithoutContentType } = headers;
        return await $fetch(url, {
            method,
            body,
            headers: headersWithoutContentType,
        });
    }

    // For all other body types, stringify and use provided headers
    return await $fetch(url, {
        method,
        body: JSON.stringify(body),
        headers,
    });
}

/**
 * Custom body provider that preserves FormData instead of parsing it
 */
async function preserveFormData(event: any): Promise<FormData | unknown> {
    const contentType = getHeader(event, "content-type");

    // If it's multipart/form-data, read as FormData
    if (contentType && contentType.includes("multipart/form-data")) {
        return await readFormData(event);
    }

    // Otherwise, use the default body reading
    return await readBody(event);
}

export default defineEventHandler(async (event) => {
    const handler = defineBackendHandler({
        url: "/documents",
        method: "POST",
        bodyProvider: preserveFormData,
        fetcher: formDataFetcher,
    });
    return await handler(event);
});
