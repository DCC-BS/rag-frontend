import type { ChatMessage, Document, StreamChunk } from "~/models/message";

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
    } catch {
        return [];
    }
}

function parseStreamLine(line: string): StreamChunk[] {
    try {
        const jsonData = parseLine(line);
        const result: StreamChunk[] = [];
        for (const data of jsonData) {
            const type = data.type as string;
            const sender = data.sender as string;

            if (type === "interrupt") {
                result.push({
                    type: "status",
                    message: "Bla",
                });
            }

            if (type === "documents") {
                const documents = data.documents as Document[];
                result.push({
                    type: "documents",
                    documents,
                });
            }

            if (type === "status") {
                // Check if we need to clear text based on detector decisions
                if (
                    (sender === "GradeAnswerAction" ||
                        sender === "GradeHallucinationAction") &&
                    data.decision === "Yes"
                ) {
                    result.push({
                        type: "clear",
                        message: "Text cleared due to detector decision",
                    });
                } else {
                    let message = data.message;
                    if (data.decision) {
                        message += `: ${data.decision}`;
                    }
                    result.push({
                        type: "status",
                        message,
                    });
                }
            }

            if (type === "answer") {
                result.push({
                    type: "answer",
                    answer: data.answer,
                });
            }
        }
        return result;
    } catch {
        return [];
    }
}

export async function sendMessage(
    message: string,
    thread_id: string,
    document_ids: number[] | null,
    onChunk: (chunk: StreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
): Promise<void> {
    if (document_ids && document_ids.length === 0) {
        document_ids = null;
    }
    const body: ChatMessage = {
        message,
        thread_id,
        document_ids,
    };

    try {
        const response = (await $fetch("/api/backend/chat", {
            method: "POST",
            body,
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
        const { extractErrorMessage } = useErrorExtractor();
        const errorMessage = extractErrorMessage(
            e,
            "Failed to send message or process stream.",
        );
        // Ensure error passed to onError is an Error instance
        onError(new Error(errorMessage));
    }
}
