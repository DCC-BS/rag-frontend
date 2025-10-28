<template>
    <div>
        <ChatHistory />
        <UContainer class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
            <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
                {{ t('chat.introduction') }}
            </h1>
            <UChatPrompt v-model="input" variant="subtle" @submit="onSubmit" :status="status ? 'streaming' : 'ready'"
                :placeholder="t('chat.placeholder')">
                <UChatPromptSubmit color="neutral" />
                <template #footer>
                    <div class="flex items-center gap-3 mb-4">
                        <!-- Document Selection Drawer -->
                        <DocumentSelectionDrawer ref="documentSelectionDrawer" />

                        <!-- Selected documents indicator -->
                        <div v-if="documentSelectionDrawer?.selectedDocuments?.length > 0"
                            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                            <span>
                                {{ t('chat.chatWithDocuments', {
                                    count: documentSelectionDrawer.selectedDocuments.length
                                }) }}
                            </span>
                        </div>
                    </div>
                </template>
            </UChatPrompt>

            <div class="flex flex-wrap gap-2">
                <UButton v-for="quickChat in quickChats" :key="quickChat.label" :icon="quickChat.icon"
                    :label="quickChat.label" size="sm" color="neutral" variant="outline" class="rounded-full"
                    @click="sendChat(quickChat.label)" />
            </div>
        </UContainer>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ["auth"],
});

// Composables
const { t } = useI18n();

// Document selection functionality
const documentSelectionDrawer = ref();
const selectedDocumentIds = computed(
    () => documentSelectionDrawer.value?.selectedDocumentIds || [],
);

const { status, sendChatMessage } = useChatMessages(selectedDocumentIds);
const toast = useToast();

const input = ref("");

function onSubmit(): void {
    sendChat(input.value);
}

/**
 * Send a chat message and redirect immediately
 * The response will stream in the background on the chat page
 */
async function sendChat(inputText: string): Promise<void> {
    const content = inputText.trim();
    if (!content) return;
    try {
        // Create chat and add user message, then redirect immediately
        const thread_id = await sendChatMessage(content);
        // Clear input after successful setup
        input.value = "";
        // Redirect to chat page where streaming will be visible
        await navigateTo(`/chat/${thread_id}`);
    } catch (error) {
        toast.add({
            title: t("chat.error.title"),
            description: t("chat.error.sendMessage"),
            color: "error",
            icon: "i-heroicons-exclamation-triangle",
        });
        console.error("Error sending chat message:", error);
    }
}

const quickChats = [
    {
        label: t('chat.exampleQuestions.question1'),
        icon: "i-heroicons-question-mark-circle",
    },
    {
        label: t('chat.exampleQuestions.question2'),
        icon: "i-heroicons-question-mark-circle",
    },
    {
        label: t('chat.exampleQuestions.question3'),
        icon: "i-heroicons-question-mark-circle",
    },
];
</script>
