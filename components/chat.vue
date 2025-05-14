<script setup lang="ts">
import type { Message } from "@/models/message";

const { t } = useI18n();

const { data } = useAuth();

const message = ref("");

const sendChat = async () => {
    const userMessageContent = message.value.trim();
    if (!userMessageContent) return;

    // Add user message
    messages.value.push({
        id: messages.value.length + 1,
        isUser: true,
        avatar: data.value?.user?.image ?? "https://i.pravatar.cc/150?img=1",
        content: userMessageContent,
    });

    // Add a placeholder for AI response
    const aiMessageId = messages.value.length + 1;
    messages.value.push({
        id: aiMessageId,
        isUser: false,
        avatar: "https://i.pravatar.cc/150?img=2",
        content: "…",
    });

    message.value = "";

    try {
        const result = await sendMessage(userMessageContent);
        console.log(result);

        messages.value = messages.value.map((msg) => {
            if (msg.id === aiMessageId) {
                return { ...msg, content: result?.message ?? "No response" };
            }
            return msg;
        });
    } catch (error) {
        messages.value = messages.value.map((msg) => {
            if (msg.id === aiMessageId) {
                return { ...msg, content: `Error: ${error}` };
            }
            return msg;
        });
    }
};
const messages = ref<Message[]>([
    {
        id: 1,
        isUser: true,
        avatar: "https://i.pravatar.cc/150?img=1",
        content: "Hello, how are you?",
    },
    {
        id: 2,
        isUser: false,
        avatar: "https://i.pravatar.cc/150?img=2",
        content: "I'm fine, thank you!",
    },
]);
</script>

<template>
    <div class="flex flex-col p-4">
        <h1 class="text-2xl font-bold mb-4 text-center">{{ t("chat.title") }}</h1>
        <div class="flex-1 mb-4 border rounded-lg p-4 bg-gray-50">
            <ChatMessage
                v-for="message in messages"
                :key="message.id"
                :message="message"
            />
        </div>
        <div class="flex gap-2">
            <UInput v-model="message" :placeholder="t('chat.message')" class="flex-1" @keyup.enter="sendChat" />
            <UButton @click="sendChat">{{ t("chat.send") }}</UButton>
        </div>
    </div>
</template>