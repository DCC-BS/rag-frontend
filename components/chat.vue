<script setup lang="ts">
import type { Message } from "@/models/message";
import { sendMessage, type StreamChunk } from "@/composables/send_message";

const { t } = useI18n();
const { data: authData } = useAuth();

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
        status: "Connecting...",
    });

    await nextTick();

    const aiMessageIndex = messages.value.findIndex(
        (msg) => msg.id === aiMessageId,
    );
    if (aiMessageIndex === -1) return;

    try {
        await sendMessage(
            userMessageContent,
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
                    // Ignored for now as per requirements
                    // currentAiMessage.documents = chunk.documents;
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
</script>

<template>
    <div class="flex flex-col p-4 bg-gray-100 dark:bg-gray-900">
        <h1 class="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">{{ t("chat.title") }}</h1>
        <div class="flex-1 mb-4 border rounded-lg p-4 bg-white dark:bg-gray-800 overflow-y-auto" ref="chatHistoryRef">
            <div v-for="message in messages" :key="message.id" class="mb-3">
                <div :class="['flex', message.isUser ? 'justify-end' : 'justify-start']">
                    <img :src="message.avatar" alt="avatar" class="w-8 h-8 rounded-full mr-2 ml-2" :class="{'order-2': message.isUser}" />
                    <div 
                        :class="['max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-lg shadow', message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100']"
                    >
                        <p class="text-sm">{{ message.content }}</p>
                        <p v-if="message.status && !message.isUser" class="text-xs mt-1" :class="[message.isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400']">
                            {{ message.status }}
                        </p>
                    </div>
                </div>
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
        </div>
    </div>
</template>