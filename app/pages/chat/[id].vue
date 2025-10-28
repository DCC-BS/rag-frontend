<script setup lang="ts">
// Apply auth middleware to protect this page
definePageMeta({
    middleware: ["auth"],
});

import { liveQuery } from "dexie";
import {
    type Document as ChatDocument,
    db,
    type Message,
    type StatusPart,
} from "~/services/db";

const toast = useToast();
const route = useRoute();
const { data } = useAuth();

const userImage = computed(() => {
    const base64 = data.value?.user?.image;
    return base64 ? base64 : "/LucideCircleUserRound.png";
});

// Initialize chat messages composable
const { status, sendChatMessage } = useChatMessages();

const input = ref("");

// Type for messages with their related data loaded
type MessageWithRelations = Message & {
    statusParts: StatusPart[];
    documents: ChatDocument[];
};

const messages = ref<MessageWithRelations[]>([]);

// Store the current subscription to allow cleanup when route changes
const messagesSubscription = ref<{ unsubscribe: () => void } | undefined>(
    undefined,
);

// Subscribe to live query for messages with their status parts and documents
// Recreate subscription whenever the chat id changes
watchEffect(() => {
    // Unsubscribe from previous subscription if it exists
    if (messagesSubscription.value) {
        messagesSubscription.value.unsubscribe();
        messagesSubscription.value = undefined;
    }

    const chatId =
        typeof route.params.id === "string" ? route.params.id : undefined;

    // Create new liveQuery subscription for the current chat id
    messagesSubscription.value = liveQuery(async () => {
        const msgs = await db.messages
            .where("chatId")
            .equals(chatId ?? "")
            .sortBy("createdAt");

        const messageIds = msgs.map((m) => m.id);
        if (messageIds.length === 0) {
            return [];
        }

        const [allStatusParts, allDocuments] = await Promise.all([
            db.statusParts.where("messageId").anyOf(messageIds).toArray(),
            db.documents.where("messageId").anyOf(messageIds).toArray(),
        ]);

        const statusPartsByMsgId = allStatusParts.reduce(
            (acc, part) => {
                const list = acc[part.messageId] ?? [];
                list.push(part);
                acc[part.messageId] = list;
                return acc;
            },
            {} as Record<string, StatusPart[]>,
        );

        const documentsByMsgId = allDocuments.reduce(
            (acc, doc) => {
                const list = acc[doc.messageId] ?? [];
                list.push(doc);
                acc[doc.messageId] = list;
                return acc;
            },
            {} as Record<string, ChatDocument[]>,
        );

        // Sort related items by creation date for stable UI rendering
        Object.values(statusPartsByMsgId).forEach((parts) => {
            parts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        });
        Object.values(documentsByMsgId).forEach((docs) => {
            docs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        });

        return msgs.map((msg) => ({
            ...msg,
            statusParts: statusPartsByMsgId[msg.id] ?? [],
            documents: documentsByMsgId[msg.id] ?? [],
        }));
    }).subscribe((result) => {
        messages.value = result;
    });
});

// Cleanup subscriptions on unmount
onUnmounted(() => {
    if (messagesSubscription.value) {
        messagesSubscription.value.unsubscribe();
    }
});

// Quick lookup maps for related content by message id
const statusPartsById = computed(() => {
    return new Map<string, StatusPart[]>(
        messages.value.map((m) => [m.id, m.statusParts || []]),
    );
});

const documentsById = computed(() => {
    return new Map<string, ChatDocument[]>(
        messages.value.map((m) => [m.id, m.documents || []]),
    );
});

/**
 * Safely extract plain text from a UI message using AI SDK v5 parts.
 * Falls back to empty string if no text part is present.
 */
function isTextPart(part: unknown): part is { type: "text"; text: string } {
    if (!part || typeof part !== "object") return false;
    const p = part as { type?: unknown; text?: unknown };
    return p.type === "text" && typeof p.text === "string";
}

function getMessageText(message: unknown): string {
    if (!message || typeof message !== "object") return "";
    const obj = message as { content?: unknown; parts?: unknown };
    if (typeof obj.content === "string" && obj.content.length > 0) {
        return obj.content;
    }
    if (Array.isArray(obj.parts) && obj.parts.length > 0) {
        const first = obj.parts[0];
        if (isTextPart(first)) return first.text;
    }
    return "";
}

// Minimal shape expected by Nuxt UI ChatMessages
const uiMessages = computed(() => {
    const lastMessage = messages.value[messages.value.length - 1];
    return messages.value.map((message) => {
        const isStreamingAssistant =
            message.role === "assistant" &&
            message.id === lastMessage?.id &&
            !message.content;

        return {
            id: message.id,
            role: message.role,
            parts: [
                {
                    type: "text" as const,
                    text: message.content || (isStreamingAssistant ? "…" : ""),
                    state: (isStreamingAssistant ? "streaming" : "done") as
                        | "done"
                        | "streaming",
                },
            ],
        };
    });
});

// ID of the assistant message currently streaming (only the last assistant when status is streaming)
const streamingAssistantMessageId = computed<string | undefined>(() => {
    if (status.value !== "streaming") {
        return undefined;
    }
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant") {
        return last.id;
    }
    return undefined;
});

// No helper extraction needed: use message.parts[0].text and lookup maps

/**
 * Handle chat message submission
 */
async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const content = input.value.trim();
    if (!content) return;

    try {
        // Pass the current chatId so message is added to existing chat
        await sendChatMessage(
            content,
            typeof route.params.id === "string" ? route.params.id : "",
        );
        input.value = "";
    } catch (error) {
        toast.add({
            title: "Error",
            description: "Failed to send message",
            color: "error",
            icon: "i-heroicons-exclamation-triangle",
        });
    }
}
</script>

<template>
    <div>
        <ChatHistory />
        <UContainer class="flex flex-col grow min-h-0 h-[calc(100dvh-12rem)] overflow-y-auto gap-4 sm:gap-6">
            <UChatMessages :user="{
                side: 'right',
                variant: 'soft',
                avatar: {
                    src: userImage
                }
            }" :assistant="{
                side: 'left',
                variant: 'soft',
                avatar: {
                    src: '/img/ai.png'
                }
            }" :messages="uiMessages" :status="status === 'streaming' ? 'streaming' : 'ready'"
                auto-scroll-icon="i-lucide-chevron-down" should-auto-scroll>
                <template #content="{ message }">
                    <div :key="message.id">
                        <div v-if="message.role === 'assistant'">
                            <MessageMarkdown :value="getMessageText(message)" :cache-key="message.id"
                                :documents="documentsById.get(message.id) ?? []" />
                            <ChatStatusParts :status-parts="statusPartsById.get(message.id) ?? []"
                                :is-streaming="streamingAssistantMessageId === message.id" />
                            <ChatDocuments :documents="documentsById.get(message.id) ?? []" />
                        </div>
                        <div v-else>
                            {{ getMessageText(message) }}
                        </div>
                    </div>
                </template>
            </UChatMessages>

            <!-- Chat Input Prompt -->
            <UChatPrompt v-model="input" variant="subtle" @submit="handleSubmit"
                :status="status === 'streaming' ? 'streaming' : 'ready'" class="sticky bottom-0 rounded-b-none z-10">
                <UChatPromptSubmit color="neutral" />
            </UChatPrompt>
        </UContainer>
    </div>
</template>