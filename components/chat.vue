<script setup lang="ts">
import type { Message } from "@/models/message";

// Composables
const { t } = useI18n();
const { resetThreadId } = useThread();
const {
    messages,
    isLoading,
    showExampleQuestions,
    sendChatMessage,
    clearMessages,
} = useChatMessages();
const { chatHistoryRef, watchMessages } = useAutoScroll();
const { userInput, hasContent, createKeydownHandler, clearInput, setInput } =
    useChatInput();

// Auto-scroll when messages change
watchMessages(messages);

// Computed property to enhance showExampleQuestions with input state
const showExampleQuestionsEnhanced = computed(() => {
    return showExampleQuestions.value && !hasContent.value;
});

/**
 * Send a chat message
 */
async function sendChat(): Promise<void> {
    const content = userInput.value.trim();
    if (!content) return;

    clearInput();
    await sendChatMessage(content);
}

/**
 * Start a new chat session
 */
function startNewChat(): void {
    if (isLoading.value) return;

    resetThreadId();
    clearMessages();
    clearInput();
}

/**
 * Handle example question clicks
 */
function handleExampleQuestionClick(question: string): void {
    setInput(question);
    sendChat();
}

// Keyboard event handler
const handleKeydown = createKeydownHandler(sendChat);
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
                        v-if="showExampleQuestionsEnhanced" 
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
                                :disabled="!hasContent || isLoading"
                                class="rounded-full w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                :class="{ 
                                    'opacity-100': hasContent && !isLoading,
                                    'opacity-50': !hasContent || isLoading 
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