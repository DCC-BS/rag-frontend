<script setup lang="ts">
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
const toast = useToast();

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

    try {
        await sendChatMessage(content);
    } catch (error) {
        toast.add({
            title: t('chat.error.title'),
            description: t('chat.error.sendMessage'),
            color: 'error',
            icon: 'i-heroicons-exclamation-triangle',
        });

        // Restore the input content so user can try again
        setInput(content);

        console.error('Error sending chat message:', error);
    }
}

/**
 * Start a new chat session
 */
function startNewChat(): void {
    if (isLoading.value) return;

    try {
        resetThreadId();
        clearMessages();
        clearInput();

        // Show success toast
        toast.add({
            title: t('chat.newChat.success'),
            description: t('chat.newChat.description'),
            color: 'success',
            icon: 'i-heroicons-chat-bubble-left-right',
        });
    } catch (error) {
        // Display error toast
        toast.add({
            title: t('chat.error.title'),
            description: t('chat.error.newChat'),
            color: 'error',
            icon: 'i-heroicons-exclamation-triangle',
        });

        console.error('Error starting new chat:', error);
    }
}

/**
 * Handle example question clicks
 */
async function handleExampleQuestionClick(question: string): Promise<void> {
    try {
        setInput(question);
        await sendChat();
    } catch (error) {
        // Display error toast
        toast.add({
            title: t('chat.error.title'),
            description: t('chat.error.exampleQuestion'),
            color: 'error',
            icon: 'i-heroicons-exclamation-triangle',
        });

        console.error('Error handling example question click:', error);
    }
}

// Keyboard event handler
const handleKeydown = createKeydownHandler(sendChat);
</script>

<template>
    <div
        class="flex flex-col h-full overscroll-contain bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <!-- Chat History -->
        <div class="flex-1 overflow-y-auto px-4 py-6" ref="chatHistoryRef">
            <div class="max-w-4xl mx-auto">
                <!-- Show example questions when no messages and no input -->
                <ExampleQuestions v-if="showExampleQuestionsEnhanced" @question-clicked="handleExampleQuestionClick" />

                <!-- Show chat messages -->
                <div v-for="message in messages" :key="message.id" class="mb-6">
                    <ChatMessage :message="message" />
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div class="max-w-4xl mx-auto p-6">
                <!-- Input Container with New Chat Button inline -->
                <div class="flex justify-stretch items-center gap-3">
                    <!-- Large Input Container -->
                    <UTextarea v-model="userInput" :placeholder="t('chat.message')"
                        class="resize-none bg-transparent focus:ring-0 text-base w-full" autoresize :rows="1"
                        :maxrows="8" @keydown="handleKeydown" :disabled="isLoading" :ui="{ base: 'resize-none' }" />

                    <!-- Send Button - Inside the textarea -->
                    <UTooltip :text="t('chat.pressEnterToSend')" :content="{
                        side: 'top'
                    }">
                        <UButton @click="sendChat" size="sm" :loading="isLoading" :disabled="!hasContent || isLoading"
                            class="rounded-full w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            :class="{
                                'opacity-100': hasContent && !isLoading,
                                'opacity-50': !hasContent || isLoading
                            }">
                            <UIcon name="i-heroicons-paper-airplane" class="w-5 h-5" />
                        </UButton>
                    </UTooltip>
                    <!-- New Chat Button -->
                    <UTooltip :text="t('chat.new')" :content="{
                        side: 'top'
                    }">
                        <UButton @click="startNewChat" variant="soft" size="lg" :disabled="isLoading"
                            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-700 dark:hover:bg-gray-700 h-12 w-12 rounded-2xl transition-all duration-200">
                            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
                        </UButton>
                    </UTooltip>
                </div>
            </div>
        </div>
    </div>
</template>