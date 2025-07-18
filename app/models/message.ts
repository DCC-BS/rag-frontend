export interface Message {
    id: string;
    isUser: boolean;
    avatar: string;
    content: string;
    status?: string;
    statusParts?: StatusPart[];
    streaming?: boolean;
    documents?: Document[] | null;
    timestamp?: Date;
}

export interface ChatMessage {
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
        documents: Document[];
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

export interface Document {
    page_content: string;
    metadata: Record<string, unknown>;
}

export interface StatusPart {
    text: string;
    highlight?: "error" | "warning" | "success" | null;
    sender?: string;
}
