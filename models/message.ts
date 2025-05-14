export interface Message {
    id: string | number;
    isUser: boolean;
    avatar: string;
    content: string;
}

export interface ChatMessage {
    message: string;
    thread_id: string;
}

export interface ChatResult {
    message: string;
    thread_id: string;
}
