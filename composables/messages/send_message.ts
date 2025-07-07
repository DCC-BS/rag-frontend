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
            const chunk = processDataChunk(data);
            if (chunk) {
                result.push(chunk);
            }
        }
        return result;
    } catch {
        return [];
    }
}

function processDataChunk(data: any): StreamChunk | null {
    const type = data.type as string;

    switch (type) {
        case "interrupt":
            return { type: "status", message: "Bla" };

        case "documents":
            return {
                type: "documents",
                documents: data.documents as Document[],
            };

        case "status":
            return processStatusChunk(data);

        case "answer":
            return { type: "answer", answer: data.answer };

        default:
            return null;
    }
}

function processStatusChunk(data: any): StreamChunk {
    const sender = data.sender as string;

    if (shouldClearText(sender, data.decision)) {
        return {
            type: "clear",
            message: "Text cleared due to detector decision",
        };
    }

    let message = data.message;
    if (data.decision) {
        message += `: ${data.decision}`;
    }

    return {
        type: "status",
        message,
        sender: sender as StreamChunk["sender"],
        decision: data.decision ?? undefined,
    };
}

function shouldClearText(sender: string, decision: string): boolean {
    const clearSenders = ["GradeAnswerAction", "GradeHallucinationAction"];
    return clearSenders.includes(sender) && decision === "Ja";
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
