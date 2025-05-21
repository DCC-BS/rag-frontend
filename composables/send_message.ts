import type { ChatMessage } from "~/models/message";

export interface StreamChunk {
    type: "status" | "documents" | "answer" | "interrupt";
    message?: string;
    decision?: string | null;
    documents?: unknown[] | null;
    answer?: string | null;
    metadata?: Record<string, unknown> | null;
}

function parseLine(line: string): StreamChunk[] {
    try {
        const jsons = line.split("\0");
        const result: StreamChunk[] = [];
        for (const json of jsons) {
            if (json.length === 0) {
                continue;
            }
            const jsonData = JSON.parse(`${json}`);
            result.push(jsonData);
        }
        return result;
    } catch (error) {
        console.error("Failed to parse JSON from stream line:", line, error);
        return [];
    }
}

function parseStreamLine(line: string): StreamChunk[] {
    try {
        const jsonData = parseLine(line);
        const result: StreamChunk[] = [];
        for (const data of jsonData) {
            const type = data.type;

            if (type === "interrupt" || type === "documents") {
                result.push({
                    type: "status",
                    message: "Bla",
                });
            }

            if (type === "status") {
                result.push({
                    type: "status",
                    message: `${data.message}: ${data.decision ?? ""}`,
                });
            }

            if (type === "answer") {
                result.push({
                    type: "answer",
                    answer: data.answer,
                });
            }
        }
        return result;
    } catch (error) {
        console.error("Failed to parse JSON from stream line:", line, error);
        return [];
    }
}

export async function sendMessage(
    message: string,
    thread_id: string,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
): Promise<void> {
    const body: ChatMessage = {
        message: message,
        thread_id: thread_id,
    };

    try {
        const response = (await $fetch("/api/backend/chat", {
            method: "POST",
            body: body,
            responseType: "stream",
        })) as ReadableStream<Uint8Array>;

        const reader = response.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            for (const chunk of parseStreamLine(
                decoder.decode(value, { stream: true }),
            )) {
                onChunk(chunk);
            }
        }
        onComplete();
    } catch (e: unknown) {
        // Typed catch error
        console.error("Error in sendMessage:", e);
        let errorMessage = "Failed to send message or process stream.";
        if (e instanceof Error) {
            errorMessage = e.message;
        } else if (typeof e === "string") {
            errorMessage = e;
        } else if (
            typeof e === "object" &&
            e !== null &&
            "message" in e &&
            typeof (e as { message: unknown }).message === "string"
        ) {
            errorMessage = (e as { message: string }).message;
        }
        // Ensure error passed to onError is an Error instance
        onError(new Error(errorMessage));
    }
}

// Helper function to find the end of a JSON object (handles nested structures)
function findJsonEnd(str: string): number {
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === "\\") {
            escapeNext = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
        }

        if (inString) {
            continue;
        }

        if (char === "{") {
            braceCount++;
        } else if (char === "}") {
            braceCount--;
            if (braceCount === 0) {
                // Found the end of a top-level JSON object
                return i;
            }
        }
    }
    return -1; // End of JSON object not found (or malformed)
}
