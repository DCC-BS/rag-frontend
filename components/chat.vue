<script setup lang="ts">
import { sendMessage } from "@/composables/send_message";
import type { Message, StreamChunk } from "@/models/message";

const { t } = useI18n();
const { data: authData } = useAuth();
const { thread_id, resetThreadId } = useThread();

const userInput = ref("");
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const chatHistoryRef = ref<HTMLElement>();

// Computed property to determine if example questions should be shown
const showExampleQuestions = computed(() => {
    return messages.value.length === 0 && userInput.value.trim() === "";
});

const scrollToBottom = () => {
    if (import.meta.client && chatHistoryRef.value) {
        // Use setTimeout to ensure DOM is fully updated
        setTimeout(() => {
            const element = chatHistoryRef.value;
            if (element) {
                const { scrollHeight, clientHeight } = element;

                // Only scroll if there's actually scrollable content
                if (scrollHeight > clientHeight) {
                    element.scrollTop = scrollHeight;
                }
            }
        }, 10);
    }
};

watch(
    messages,
    () => {
        scrollToBottom();
    },
    { deep: true },
);

const sendChat = async () => {
    const userMessageContent = userInput.value.trim();
    if (!userMessageContent || isLoading.value) return;

    isLoading.value = true;
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
        status: "Thinking...",
    });

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
                isLoading.value = false;
            },
            (error: Error) => {
                console.error("Failed to initiate chat send:", error);
                const currentAiMessage = messages.value[aiMessageIndex];
                if (currentAiMessage) {
                    currentAiMessage.content = "Failed to send message.";
                    currentAiMessage.status = "Error";
                }
                isLoading.value = false;
            },
        );
    } catch (error) {
        console.error("Failed to initiate chat send:", error);
        const currentAiMessage = messages.value[aiMessageIndex];
        if (currentAiMessage) {
            currentAiMessage.content = "Failed to send message.";
            currentAiMessage.status = "Error";
        }
        isLoading.value = false;
    }
};

const startNewChat = () => {
    if (isLoading.value) return;
    resetThreadId();
    messages.value = [];
    userInput.value = "";
};

// Function to handle example question clicks
const handleExampleQuestionClick = (question: string): void => {
    userInput.value = question;
    sendChat();
};

// Handle keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendChat();
    }
};
</script>

<template>
    <div class="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <!-- Chat Area -->
        <div class="flex flex-col" style="height: calc(100vh - 200px);">
            <div 
                class="flex-1 overflow-y-auto px-4 py-6 pb-20" 
                ref="chatHistoryRef"
            >
                <div class="max-w-4xl mx-auto">
                    <!-- Show example questions when no messages and no input -->
                    <ExampleQuestions 
                        v-if="showExampleQuestions" 
                        @question-clicked="handleExampleQuestionClick"
                    />
                    
                    <!-- Show chat messages -->
                    <div v-for="message in messages" :key="message.id" class="mb-6">
                        <ChatMessage :message="message" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="flex-shrink-0 fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10">
            <div class="max-w-4xl mx-auto p-6">
                <!-- New Chat Button - positioned above input -->
                <div class="flex justify-center mb-4">
                    <UButton 
                        @click="startNewChat" 
                        variant="outline" 
                        size="sm"
                        :disabled="isLoading"
                        class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        <UIcon name="i-heroicons-plus" class="w-4 h-4 mr-2" />
                        {{ t('chat.newChat', 'New Chat') }}
                    </UButton>
                </div>
                
                <!-- Large Input Container -->
                <div class="relative">
                    <div class="relative bg-gray-50 dark:bg-gray-700 rounded-3xl border border-gray-200 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors duration-200">
                        <UTextarea 
                            v-model="userInput" 
                            :placeholder="t('chat.message')" 
                            class="resize-none bg-transparent border-0 focus:ring-0 text-base px-6 py-4 pr-16 w-full"
                            :rows="1"
                            :maxrows="8"
                            autoresize
                            @keydown="handleKeydown"
                            :disabled="isLoading"
                        />
                        
                        <!-- Send Button - Inside the textarea -->
                        <div class="absolute right-3 bottom-3">
                            <UButton 
                                @click="sendChat" 
                                size="sm"
                                :loading="isLoading"
                                :disabled="!userInput.trim() || isLoading"
                                class="rounded-full w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                :class="{ 
                                    'opacity-100': userInput.trim() && !isLoading,
                                    'opacity-50': !userInput.trim() || isLoading 
                                }"
                            >
                                <UIcon name="i-heroicons-paper-airplane" class="w-5 h-5" />
                            </UButton>
                        </div>
                        
                        <!-- Helper text -->
                        <div class="absolute right-16 bottom-4 text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                            {{ t("chat.pressEnterToSend") }}
                        </div>
                    </div>
                </div>
            </div>
            <DataBsFooter />
        </div>
    </div>
</template>