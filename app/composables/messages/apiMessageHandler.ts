import type { ApiChatMessage, StreamChunk } from "~/models/api_message";

/**
 * Parse a line containing JSON data separated by null bytes
 */
function parseLine(line: string): unknown[] {
    try {
        const jsons = line.split("\0");
        const result: unknown[] = [];
        for (const json of jsons) {
            if (json.length === 0) {
                continue;
            }
            const jsonData = JSON.parse(json);
            result.push(jsonData);
        }
        return result;
    } catch {
        return [];
    }
}

/**
 * Parse a stream line and validate the chunks
 */
function parseStreamLine(line: string): StreamChunk[] {
    try {
        const jsonData = parseLine(line);
        const result: StreamChunk[] = [];
        for (const data of jsonData) {
            const chunk = validateStreamChunk(data);
            if (chunk) {
                result.push(chunk);
            }
        }
        return result;
    } catch {
        return [];
    }
}

/**
 * Validate and type-guard a data chunk to ensure it matches StreamChunk structure
 */
function validateStreamChunk(data: unknown): StreamChunk | null {
    if (!data || typeof data !== "object") {
        return null;
    }

    const obj = data as Record<string, unknown>;
    const { type, sender, metadata } = obj;

    // Validate basic structure
    if (!type || !sender || !metadata || typeof metadata !== "object") {
        return null;
    }

    const metaObj = metadata as Record<string, unknown>;

    // Validate each type has the required metadata structure
    switch (type) {
        case "status":
            if (
                sender === "status" &&
                typeof metaObj.translation_key === "string"
            ) {
                return obj as unknown as StreamChunk;
            }
            break;

        case "documents":
            if (
                sender === "retrieve_action" &&
                Array.isArray(metaObj.documents)
            ) {
                return obj as unknown as StreamChunk;
            }
            break;

        case "answer":
            if (
                (sender === "answer_action" || sender === "backoff") &&
                typeof metaObj.answer === "string"
            ) {
                return obj as unknown as StreamChunk;
            }
            break;

        case "decision":
            if (
                (sender === "should_retrieve" || sender === "is_truthful") &&
                typeof metaObj.decision === "boolean" &&
                typeof metaObj.reason === "string"
            ) {
                return obj as unknown as StreamChunk;
            }
            break;

        default:
            return null;
    }

    return null;
}

/**
 * Send a chat message and handle the streaming response
 */
export async function sendMessage(
    message: string,
    thread_id: string,
    document_ids: number[] | null,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
): Promise<void> {
    // Normalize empty array to null
    const normalizedDocumentIds =
        document_ids && document_ids.length === 0 ? null : document_ids;

    const body: ApiChatMessage = {
        message,
        thread_id,
        document_ids: normalizedDocumentIds,
    };

    try {
        const response = (await $fetch("/api/chat", {
            method: "POST",
            body,
            responseType: "stream",
            timeout: 30000, // 30 seconds
        })) as ReadableStream<Uint8Array>;
        const reader = response.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                const chunks = parseStreamLine(
                    decoder.decode(value, { stream: true }),
                );
                for (const chunk of chunks) {
                    onChunk(chunk);
                }
            }
        } finally {
            reader.releaseLock();
        }

        onComplete();
    } catch (e: unknown) {
        const { extractErrorMessage } = useApiError();
        const errorMessage = extractErrorMessage(
            e,
            "Failed to send message or process stream.",
        );
        onError(new Error(errorMessage));
    }
}
