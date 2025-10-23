<script setup lang="ts">
// Apply auth middleware to protect this page
definePageMeta({
    middleware: ["auth"],
});

import { liveQuery } from "dexie";
import {
    type Chat,
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

const actions = ref([
    {
        label: "Copy to clipboard",
        icon: "i-lucide-copy",
    },
]);

// Initialize chat messages composable
const { status, sendChatMessage } = useChatMessages();

const input = ref("");
const messages = ref<Message[]>([]);


// Subscribe to live query for messages with their status parts and documents
const messagesSubscription = liveQuery(async () => {
    const msgs = await db.messages
        .where("chatId")
        .equals(route.params.id as string)
        .toArray();

    // Sort messages by createdAt (oldest first)
    msgs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Load status parts and documents for each message
    const messagesWithParts = await Promise.all(
        msgs.map(async (msg) => {
            const statusParts = await db.statusParts
                .where("messageId")
                .equals(msg.id)
                .toArray();

            // Sort status parts by createdAt (oldest first)
            statusParts.sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
            );

            const documents = await db.documents
                .where("messageId")
                .equals(msg.id)
                .toArray();

            return { ...msg, statusParts, documents };
        }),
    );

    return messagesWithParts;
}).subscribe((result) => {
    messages.value = result;
});

// Cleanup subscriptions on unmount
onUnmounted(() => {
    messagesSubscription.unsubscribe();
});

/**
 * Convert messages to Nuxt UI ChatMessages format (text only)
 */
const formattedMessages = computed(() => {
    return messages.value.map((message, index) => {
        // Determine state based on streaming status and content
        const messageState =
            message.role === "assistant" &&
                !message.content &&
                status.value === "streaming"
                ? "streaming"
                : "done";

        const formatted = {
            id: message.id,
            role: message.role,
            parts: [
                {
                    type: "text" as const,
                    text:
                        message.content ||
                        (messageState === "streaming" ? "Thinking..." : ""),
                    state: messageState as "done" | "streaming",
                },
            ],
            actions: actions.value,
            // Keep references for custom components
            statusParts: message.statusParts || [],
            documents: message.documents || [],
        };
        return formatted;
    });
});

/**
 * Safely extract custom extras from the message object passed by UChatMessages slot.
 * Nuxt UI types the slot as `UIMessage`, which doesn't include our custom fields,
 * but the runtime object still carries them through. This function narrows safely.
 */
function getMessageExtras(message: unknown): {
    documents: ChatDocument[];
    statusParts: StatusPart[];
} {
    const obj = (message as Record<string, unknown>) || {};
    const docs = Array.isArray(obj.documents)
        ? (obj.documents as ChatDocument[])
        : [];
    const parts = Array.isArray(obj.statusParts)
        ? (obj.statusParts as StatusPart[])
        : [];

    return { documents: docs, statusParts: parts };
}

/**
 * Extract the current text content from a UIMessage-like object.
 */
function extractMessageText(message: unknown): string {
    if (!message || typeof message !== "object") return "";
    const obj = message as {
        parts?: Array<{ text?: string }>;
        content?: string;
    };
    let text = "";
    if (typeof obj.content === "string" && obj.content.length > 0) {
        text = obj.content;
    } else if (
        Array.isArray(obj.parts) &&
        typeof obj.parts[0]?.text === "string"
    ) {
        text = obj.parts[0]?.text as string;
    }

    return text;
}

/**
 * Handle chat message submission
 */
async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const content = input.value.trim();
    if (!content) return;

    try {
        // Pass the current chatId so message is added to existing chat
        await sendChatMessage(content, route.params.id as string);
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
    <UDashboardPanel id="chat" class="relative" :ui="{ body: 'p-0 sm:p-0' }">
        <UContainer class="flex-1 flex flex-col">
            <!-- Chat Messages with custom content -->
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
            }" :messages="formattedMessages" auto-scroll-icon="i-lucide-chevron-down" :should-scroll-to-bottom="false">
                <template #content="{ message }">
                    <div v-if="message.role === 'assistant'">
                        <!-- Render AI response as Markdown -->
                        <MDC :value="extractMessageText(message) || (status === 'streaming' ? '…' : '')" tag="div" />
                        <!-- Status parts should appear below the message content -->
                        <ChatStatusParts :status-parts="getMessageExtras(message).statusParts"
                            :is-streaming="status === 'streaming' && !extractMessageText(message)" />
                        <!-- Documents list -->
                        <ChatDocuments :documents="getMessageExtras(message).documents" />
                    </div>
                    <div v-else>
                        <!-- User message - render as plain text -->
                        {{ extractMessageText(message) }}
                    </div>
                </template>
            </UChatMessages>

            <!-- Chat Input Prompt -->
            <UChatPrompt v-model="input" variant="subtle" @submit="handleSubmit"
                :status="status === 'streaming' ? 'streaming' : 'ready'">
                <UChatPromptSubmit color="neutral" />
            </UChatPrompt>
        </UContainer>
    </UDashboardPanel>
</template>