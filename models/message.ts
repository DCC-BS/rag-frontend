export interface Message {
    id: string;
    isUser: boolean;
    avatar: string;
    content: string;
    status?: string;
    documents?: Document[] | null;
    timestamp?: Date;
}

export interface ChatMessage {
    message: string;
    thread_id: string;
}

export interface StreamChunk {
    type: "status" | "documents" | "answer" | "interrupt" | "clear";
    sender?:
        | "RetrieveAction"
        | "GenerateAnswerAction"
        | "GradeAnswerAction"
        | "GradeHallucinationAction"
        | "RouteQuestionAction"
        | null;
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

// Document types for documents page
export interface UserDocument {
    id: number;
    file_name: string;
    document_path: string;
    mime_type: string;
    num_pages: number;
    created_at: string;
    access_roles: string[];
}

export interface DocumentsResponse {
    documents: UserDocument[];
    total_count: number;
}
