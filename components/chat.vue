<script setup lang="ts">
import { sendMessage } from "@/composables/send_message";
import type { Message, StreamChunk } from "@/models/message";

const { t } = useI18n();
const { data: authData } = useAuth();
const { thread_id, resetThreadId } = useThread();

const userInput = ref("");
const messages = ref<Message[]>([]);

const sendChat = async () => {
    const userMessageContent = userInput.value.trim();
    if (!userMessageContent) return;

    const userAvatar =
        authData.value?.user?.image ?? "https://i.pravatar.cc/150?img=1";
    const aiAvatar = "/img/ai.png";

    messages.value.push({
        id: `user-${Date.now()}`,
        isUser: true,
        avatar: userAvatar,
        content: userMessageContent,
    });

    userInput.value = "";

    const aiMessageId = `ai-${Date.now()}`;
    messages.value.push({
        id: aiMessageId,
        isUser: false,
        avatar: aiAvatar,
        content: "",
        status: "...",
    });

    await nextTick();

    const aiMessageIndex = messages.value.findIndex(
        (msg) => msg.id === aiMessageId,
    );
    if (aiMessageIndex === -1) return;

    try {
        await sendMessage(
            userMessageContent,
            thread_id.value,
            (chunk: StreamChunk) => {
                const currentAiMessage = messages.value[aiMessageIndex];
                if (!currentAiMessage) return;

                if (chunk.type === "status") {
                    let statusText = chunk.message || "";
                    if (chunk.decision) {
                        statusText += ` (Decision: ${chunk.decision})`;
                    }
                    currentAiMessage.status = statusText;
                    if (currentAiMessage.content === "") {
                        currentAiMessage.content = "…";
                    }
                } else if (chunk.type === "answer") {
                    if (
                        currentAiMessage.content === "…" ||
                        currentAiMessage.content === ""
                    ) {
                        currentAiMessage.content = chunk.answer || "";
                    } else {
                        currentAiMessage.content += chunk.answer || "";
                    }
                } else if (chunk.type === "documents") {
                    currentAiMessage.documents = chunk.documents;
                }
            },
            () => {
                const currentAiMessage = messages.value[aiMessageIndex];
                if (currentAiMessage) {
                    currentAiMessage.status = undefined;
                    if (
                        currentAiMessage.content === "…" ||
                        currentAiMessage.content === ""
                    ) {
                        currentAiMessage.content =
                            "No response or stream ended.";
                    }
                }
            },
            (error: Error) => {
                console.error("Failed to initiate chat send:", error);
                const currentAiMessage = messages.value[aiMessageIndex];
                if (currentAiMessage) {
                    currentAiMessage.content = "Failed to send message.";
                    currentAiMessage.status = "Error";
                }
            },
        );
    } catch (error) {
        console.error("Failed to initiate chat send:", error);
        const currentAiMessage = messages.value[aiMessageIndex];
        if (currentAiMessage) {
            currentAiMessage.content = "Failed to send message.";
            currentAiMessage.status = "Error";
        }
    }
};

const startNewChat = () => {
    resetThreadId();
    messages.value = [];
    userInput.value = "";
};
</script>

<template>
    <div class="flex flex-col p-4">
        <h1 class="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">{{ t("chat.title") }}</h1>
        <div class="flex-1 mb-4 border rounded-lg p-4 bg-white dark:bg-gray-800 overflow-y-auto" ref="chatHistoryRef">
            <div v-for="message in messages" :key="message.id" class="mb-3">
                <ChatMessage :message="message" />
            </div>
        </div>
        <div class="flex gap-2 p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <UInput 
                v-model="userInput" 
                :placeholder="t('chat.message')" 
                class="flex-1" 
                @keyup.enter="sendChat"
                size="lg"
            />
            <UButton @click="sendChat" size="lg">{{ t("chat.send") }}</UButton>
            <UButton @click="startNewChat" size="lg">{{ t("chat.new") }}</UButton>
        </div>
    </div>
</template>