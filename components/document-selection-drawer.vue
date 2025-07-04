<template>
    <UDrawer v-model:open="isOpen" direction="left" :title="t('chat.selectDocuments')"
        :description="t('chat.selectDocumentsDescription', { max: 5 })">
        <!-- Trigger button -->
        <UButton color="neutral" variant="outline" icon="i-heroicons-document-text" :label="buttonLabel" size="sm" />

        <template #content>
            <div class="flex flex-col h-full min-w-96 max-w-md">
                <!-- Header with selected count -->
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {{ t('chat.selectDocuments') }}
                            </h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                {{ t('chat.selectDocumentsDescription', { max: 5 }) }}
                            </p>
                        </div>
                    </div>

                    <!-- Selection status -->
                    <div class="flex items-center justify-between">
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            {{ t('chat.documentsSelected', {
                                count: selectedDocuments.length,
                                max: 5
                            }) }}
                        </div>
                        <UButton v-if="selectedDocuments.length > 0" color="neutral" variant="outline" size="xs"
                            :label="t('chat.clearSelection')" @click="clearSelection" />
                    </div>

                    <!-- Selected documents chips -->
                    <div v-if="selectedDocuments.length > 0" class="mt-3">
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-for="doc in selectedDocuments" :key="doc.id" variant="soft" color="success"
                                class="flex items-center gap-1">
                                <span class="truncate max-w-24">{{ doc.file_name }}</span>
                                <UButton icon="i-heroicons-x-mark" size="xs" color="neutral" variant="ghost"
                                    @click="deselectDocument(doc.id)" class="ml-1" />
                            </UBadge>
                        </div>
                    </div>
                </div>

                <!-- Search -->
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                    <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass"
                        :placeholder="t('documents.searchPlaceholder')" :loading="searchLoading"
                        @keyup.enter="performSearch" class="w-full">
                        <template v-if="searchQuery?.length" #trailing>
                            <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x"
                                aria-label="Clear input" @click="clearSearch" />
                        </template>
                    </UInput>
                </div>

                <!-- Documents list -->
                <div class="flex-1 overflow-y-auto p-4">
                    <!-- Loading state -->
                    <div v-if="loading && !documents" class="flex items-center justify-center py-12">
                        <div class="text-center">
                            <UIcon name="i-heroicons-arrow-path"
                                class="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                            <p class="text-gray-600 dark:text-gray-400">{{ t('documents.loading') }}</p>
                        </div>
                    </div>

                    <!-- No documents -->
                    <div v-else-if="documents && documents.documents.length === 0" class="text-center py-12">
                        <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {{ searchQuery ? t('documents.noResultsTitle') : t('documents.noDocumentsTitle') }}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">
                            {{ searchQuery
                                ? t('documents.noResultsDescription', { query: searchQuery })
                                : t('documents.noDocumentsDescription')
                            }}
                        </p>
                        <UButton v-if="searchQuery" :label="t('documents.clearSearch')" color="primary" variant="solid"
                            @click="clearSearch" />
                    </div>

                    <!-- Documents grid -->
                    <div v-else-if="documents && documents.documents.length > 0" class="space-y-3">
                        <DocumentSelectionItem v-for="document in documents.documents" :key="document.id"
                            :document="document" :is-selected="isDocumentSelected(document.id)"
                            :can-select="canSelectMore || isDocumentSelected(document.id)" @select="selectDocument"
                            @deselect="deselectDocument" />
                    </div>
                </div>

                <!-- Footer with action buttons -->
                <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex gap-2">
                        <UButton color="neutral" variant="outline" :label="t('common.close')" @click="isOpen = false"
                            class="flex-1" />
                        <UButton color="primary" variant="solid" :label="t('chat.chatWithSelected')"
                            :disabled="selectedDocuments.length === 0" @click="handleChatWithSelected" class="flex-1" />
                    </div>
                </div>
            </div>
        </template>
    </UDrawer>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const toast = useToast();

// Document management
const { documents, loading, error, fetchDocuments, searchDocuments } = useDocuments();
const {
    selectedDocuments,
    selectedDocumentIds,
    selectDocument,
    deselectDocument,
    clearSelection,
    isDocumentSelected,
    canSelectMore
} = useDocumentSelection();

// Drawer state
const isOpen = ref<boolean>(false);

// Search functionality
const searchQuery = ref<string>("");
const searchLoading = ref<boolean>(false);
const searchPerformed = ref<boolean>(false);

/**
 * Button label based on selection state
 */
const buttonLabel = computed<string>(() => {
    if (selectedDocuments.value.length === 0) {
        return t('chat.selectDocuments');
    }
    return t('chat.documentsSelected', {
        count: selectedDocuments.value.length,
        max: 5
    });
});

/**
 * Perform search with current query
 */
async function performSearch(): Promise<void> {
    if (!searchQuery.value.trim() && !searchPerformed.value) {
        await fetchDocuments();
        return;
    }

    searchLoading.value = true;
    try {
        await searchDocuments(searchQuery.value.trim(), 20);
        searchPerformed.value = true;
    } finally {
        searchLoading.value = false;
    }
}

/**
 * Clear search and fetch all documents
 */
async function clearSearch(): Promise<void> {
    searchQuery.value = "";
    searchPerformed.value = false;
    await fetchDocuments();
}

/**
 * Handle "Chat with Selected" button click
 */
function handleChatWithSelected(): void {
    if (selectedDocuments.value.length === 0) {
        return;
    }

    toast.add({
        title: t('chat.documentSelectionUpdated'),
        description: t('chat.documentSelectionUpdatedDescription', {
            count: selectedDocuments.value.length
        }),
        color: 'success',
        icon: 'i-heroicons-check-circle',
    });

    isOpen.value = false;
}

// Load documents when drawer opens
watch(isOpen, async (newValue) => {
    if (newValue && !documents.value) {
        await fetchDocuments();
    }
});

// Load documents on mount
onMounted(async () => {
    await fetchDocuments();
});

// Expose selected document IDs for parent components
defineExpose({
    selectedDocumentIds,
    selectedDocuments,
    clearSelection,
});
</script>