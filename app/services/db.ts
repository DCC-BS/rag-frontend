import Dexie, { type EntityTable } from "dexie";

interface Document {
    id: string;
    messageId: string;
    file_name: string;
    document_path: string;
    mime_type: string;
    num_pages: number;
    access_roles: string[];
    user_document_id: number;
    page?: number;
    metadata: Record<string, string | number | string[] | null>;
    createdAt: Date;
}

interface Message {
    id: string;
    chatId: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
}

interface StatusPart {
    id: string;
    messageId: string;
    text: string;
    highlight?: "error" | "warning" | "success" | null;
    sender?: string;
    createdAt: Date;
}

interface Chat {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

const db = new Dexie("chat-storage") as Dexie & {
    chats: EntityTable<Chat, "id">;
    messages: EntityTable<Message, "id">;
    statusParts: EntityTable<StatusPart, "id">;
    documents: EntityTable<Document, "id">;
};

db.version(1).stores({
    chats: "id, createdAt, updatedAt",
    messages: "id, chatId, role, content, createdAt",
    statusParts: "id, messageId, text, highlight, sender, createdAt",
    documents:
        "id, messageId, file_name, document_path, mime_type, num_pages, access_roles, user_document_id, page, createdAt",
});

export type { Chat, Document, Message, StatusPart };
export { db };
