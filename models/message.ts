export interface Message {
    id: string | number;
    isUser: boolean;
    avatar: string;
    content: string;
    status?: string; // For streaming status updates
    documents?: unknown[]; // For holding documents, though not displayed yet
}

export interface ChatMessage {
    message: string;
    thread_id: string;
}

export interface ChatResult {
    message: string;
    thread_id: string;
}
