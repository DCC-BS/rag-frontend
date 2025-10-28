export interface ApiChatMessage {
    message: string;
    thread_id: string;
    document_ids: number[] | null;
}

// Base StreamChunk interface
export interface BaseStreamChunk {
    type: "status" | "documents" | "answer" | "decision";
    sender:
        | "retrieve_action"
        | "should_retrieve"
        | "answer_action"
        | "is_truthful"
        | "backoff"
        | "status";
}

// Status message chunk
export interface StatusStreamChunk extends BaseStreamChunk {
    type: "status";
    sender: "status";
    metadata: {
        translation_key: string;
    };
}

// Documents message chunk
export interface DocumentsStreamChunk extends BaseStreamChunk {
    type: "documents";
    sender: "retrieve_action";
    metadata: {
        documents: ApiDocument[];
    };
}

// Answer message chunk
export interface AnswerStreamChunk extends BaseStreamChunk {
    type: "answer";
    sender: "answer_action" | "backoff";
    metadata: {
        answer: string;
    };
}

// Decision message chunk
export interface DecisionStreamChunk extends BaseStreamChunk {
    type: "decision";
    sender: "should_retrieve" | "is_truthful";
    metadata: {
        decision: boolean;
        reason: string;
    };
}

// Union type for all stream chunks
export type StreamChunk =
    | StatusStreamChunk
    | DocumentsStreamChunk
    | AnswerStreamChunk
    | DecisionStreamChunk;

export interface ApiDocument {
    metadata: ApiMetadata;
}

interface ApiMetadata {
    id: number;
    file_name: string;
    document_path: string;
    mime_type: string;
    num_pages: number | null;
    page: number | null;
    created_at: string;
    access_roles: string[];
}
