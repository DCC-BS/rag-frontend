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
            const type = data.type as string;
            const sender = data.sender as string;

            if (type === "interrupt") {
                result.push({
                    type: "status",
                    message: "Bla",
                });
            }

            if (type === "documents") {
                console.log("documents", data);
                const documents = data.documents as Document[];
                result.push({
                    type: "documents",
                    documents: documents,
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
                        message: message,
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
    } catch (error) {
        console.error("Failed to parse JSON from stream line:", line, error);
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
        message: message,
        thread_id: thread_id,
        document_ids: document_ids,
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
