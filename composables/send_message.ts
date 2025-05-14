import type { ChatMessage, ChatResult } from "~/models/message";

export function sendMessage(message: string): Promise<ChatResult> {
    const body = {
        message: message,
        thread_id: "none",
    } as ChatMessage;

    return $fetch<ChatResult>("api/backend/chat", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
}
