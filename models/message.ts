export interface Message {
    id: string | number;
    isUser: boolean;
    avatar: string;
    content: string;
    status?: string;
    documents?: Document[] | null;
}

export interface ChatMessage {
    message: string;
    thread_id: string;
}

export interface StreamChunk {
    type: "status" | "documents" | "answer" | "interrupt";
    message?: string;
    decision?: string | null;
    documents?: Document[] | null;
    answer?: string | null;
    metadata?: Record<string, string> | null;
}

export interface Document {
    page_content: string;
    metadata: Record<string, unknown>;
}
