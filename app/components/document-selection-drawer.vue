<template>
    <UDrawer v-model:open="isOpen" direction="left" :title="t('chat.selectDocuments')"
        :description="t('chat.selectDocumentsDescription', { max: SELECTION_LIMITS.MAX_CHAT_SELECTION })">
        <!-- Trigger button -->
        <UButton color="neutral" variant="outline" icon="i-heroicons-document-text" :label="buttonLabel" size="sm" />

        <template #content>
            <div class="flex h-full min-w-96 max-w-md flex-col">
                <!-- Header with selected count -->
                <div class="border-gray-200 border-b p-4 dark:border-gray-700">
                    <div class="mb-3 flex items-center justify-between">
                        <div>
                            <h2 class="font-semibold text-gray-900 text-lg dark:text-gray-100">
                                {{ t('chat.selectDocuments') }}
                            </h2>
                            <p class="text-gray-600 text-sm dark:text-gray-400">
                                {{ t('chat.selectDocumentsDescription', { max: SELECTION_LIMITS.MAX_CHAT_SELECTION }) }}
                            </p>
                        </div>
                    </div>

                    <!-- Selection status -->
                    <div class="flex items-center justify-between">
                        <div class="text-gray-600 text-sm dark:text-gray-400">
                            {{ t('chat.documentsSelected', {
                                count: selectedDocuments.length,
                                max: SELECTION_LIMITS.MAX_CHAT_SELECTION
                            }) }}
                        </div>
                        <UButton v-if="selectedDocuments.length > 0" color="neutral" variant="outline" size="xs"
                            :label="t('chat.clearSelection')" @click="clearSelection" />
                    </div>

                    <!-- Selected documents chips -->
                    <div class="mt-3" v-if="selectedDocuments.length > 0">
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-for="doc in selectedDocuments" :key="doc.id" variant="soft" color="success"
                                class="flex items-center gap-1">
                                <span class="max-w-24 truncate">{{ doc.file_name }}</span>
                                <UButton icon="i-heroicons-x-mark" size="xs" color="neutral" variant="ghost"
                                    @click="deselectDocument(doc.id)" class="ml-1" />
                            </UBadge>
                        </div>
                    </div>
                </div>

                <!-- Search -->
                <div class="border-gray-200 border-b p-4 dark:border-gray-700">
                    <UInput ref="searchInputRef" v-model="searchQuery" icon="i-heroicons-magnifying-glass"
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
                    <div class="flex items-center justify-center py-12" v-if="loading && !documents">
                        <div class="text-center">
                            <UIcon class="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600"
                                name="i-heroicons-arrow-path" />
                            <p class="text-gray-600 dark:text-gray-400">{{ t('documents.loading') }}</p>
                        </div>
                    </div>

                    <!-- No documents -->
                    <div class="py-12 text-center" v-else-if="documents?.documents?.length === 0">
                        <UIcon class="mx-auto mb-4 h-16 w-16 text-gray-400" name="i-heroicons-document-text" />
                        <h3 class="mb-2 font-semibold text-gray-900 text-xl dark:text-white">
                            {{ searchQuery ? t('documents.noResultsTitle') : t('documents.noDocumentsTitle') }}
                        </h3>
                        <p class="mb-6 text-gray-600 dark:text-gray-400">
                            {{ searchQuery
                                ? t('documents.noResultsDescription', { query: searchQuery })
                                : t('documents.noDocumentsDescription')
                            }}
                        </p>
                        <UButton v-if="searchQuery" :label="t('documents.clearSearch')" color="primary" variant="solid"
                            @click="clearSearch" />
                    </div>

                    <!-- Documents count and pagination info -->
                    <div v-else-if="documents && documents.documents?.length > 0" class="space-y-4">
                        <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{{ t('documents.available', { count: totalDocuments }) }}</span>
                            <span v-if="totalPages > 1">{{ t('common.page') }} {{ currentPage }} of {{ totalPages
                                }}</span>
                        </div>

                        <!-- Documents grid -->
                        <div class="space-y-3">
                            <DocumentSelectionItem v-for="document in paginatedDocuments" :key="document.id"
                                :document="document" :is-selected="isDocumentSelected(document.id)"
                                :can-select="canSelectMore || isDocumentSelected(document.id)" @select="selectDocument"
                                @deselect="deselectDocument" />
                        </div>

                        <!-- Pagination -->
                        <div v-if="totalPages > 1" class="flex justify-center mt-4">
                            <UPagination v-model:page="currentPage" :total="totalDocuments"
                                :items-per-page="itemsPerPage" show-edges :sibling-count="1" size="sm" color="primary"
                                variant="outline" active-color="primary" active-variant="solid" />
                        </div>
                    </div>
                </div>

                <!-- Footer with action buttons -->
                <div class="border-gray-200 border-t p-4 dark:border-gray-700">
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
import {
    SEARCH_LIMITS,
    SELECTION_LIMITS,
    STORAGE_KEYS,
    TIMING,
} from "~/utils/constants";

const { t } = useI18n();
const toast = useToast();

// Document management
const { documents, loading, error, fetchDocuments, searchDocuments } =
    useDocuments();
const {
    selectedDocuments,
    selectedDocumentIds,
    selectDocument,
    deselectDocument,
    clearSelection,
    isDocumentSelected,
    canSelectMore,
} = useDocumentSelection();

// Chat document selection bridge
const {
    selectedDocumentsForChat,
    setDocumentsForChat,
    clearChatDocumentSelection,
    hasChatDocuments,
} = useChatDocumentSelection();

// Drawer state
const isOpen = ref<boolean>(false);

// Search functionality
const searchQuery = ref<string>("");
const searchLoading = ref<boolean>(false);
const searchPerformed = ref<boolean>(false);

// Pagination for drawer (10 docs per page)
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(SEARCH_LIMITS.DRAWER_ITEMS_PER_PAGE);

// Template ref for search input to auto-focus
const searchInputRef = ref();

/**
 * Button label based on selection state
 */
const buttonLabel = computed<string>(() => {
    if (selectedDocuments.value.length === 0) {
        return t("chat.selectDocuments");
    }
    return t("chat.documentsSelected", {
        count: selectedDocuments.value.length,
        max: SELECTION_LIMITS.MAX_CHAT_SELECTION,
    });
});

/**
 * Documents sorted with selected ones on top
 */
const sortedDocuments = computed(() => {
    if (!documents.value?.documents) return [];

    return [...documents.value.documents].sort((a, b) => {
        const aSelected = isDocumentSelected(a.id);
        const bSelected = isDocumentSelected(b.id);

        // Selected documents come first
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;

        // For documents with same selection status, maintain original order
        return 0;
    });
});

/**
 * Paginated documents (10 per page)
 */
const paginatedDocuments = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return sortedDocuments.value.slice(startIndex, endIndex);
});

/**
 * Total pages for pagination
 */
const totalPages = computed<number>(() => {
    return Math.ceil(sortedDocuments.value.length / itemsPerPage.value);
});

/**
 * Total documents count for display
 */
const totalDocuments = computed<number>(() => {
    return sortedDocuments.value.length;
});

/**
 * Perform search with current query
 */
async function performSearch(): Promise<void> {
    const query = searchQuery.value.trim();

    if (!query && !searchPerformed.value) {
        try {
            await fetchDocuments();
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
        return;
    }

    searchLoading.value = true;
    currentPage.value = 1; // Reset to first page when searching
    try {
        await searchDocuments(
            query,
            SEARCH_LIMITS.DRAWER_SEARCH_ITEMS_PER_PAGE,
        );
        searchPerformed.value = true;
    } catch (error) {
        console.error("Error searching documents:", error);
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
    currentPage.value = 1; // Reset to first page
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
        title: t("chat.documentSelectionUpdated"),
        description: t("chat.documentSelectionUpdatedDescription", {
            count: selectedDocuments.value.length,
        }),
        color: "success",
        icon: "i-heroicons-check-circle",
    });

    isOpen.value = false;
}

// Load documents when drawer opens
watch(isOpen, async (newValue) => {
    if (newValue) {
        if (!documents.value) {
            await fetchDocuments();
        }
        syncFromDocumentsPageSelection();

        // Auto-focus search input when drawer opens
        // Wait for next tick to ensure input is rendered
        await nextTick();

        // Additional delay to ensure drawer animation is complete
        setTimeout(() => {
            const inputElement =
                searchInputRef.value?.$el?.querySelector("input");
            if (inputElement) {
                inputElement.focus();
            }
        }, TIMING.DRAWER_ANIMATION_DELAY);
    }
});

// Load documents on mount
onMounted(async () => {
    await fetchDocuments();
    syncPreSelectedDocuments();
    syncFromDocumentsPageSelection();
});

/**
 * Sync pre-selected documents from documents page to chat selection
 */
function syncPreSelectedDocuments(): void {
    if (hasChatDocuments() && selectedDocumentsForChat.value.length > 0) {
        clearSelection();

        // Add pre-selected documents to chat selection
        selectedDocumentsForChat.value.forEach((doc) => {
            selectDocument(doc);
        });

        clearChatDocumentSelection();
    }
}

/**
 * Sync selections from documents page when manually navigating to chat
 * This handles the case where user navigates to chat without using "Chat with Selected" button
 */
function syncFromDocumentsPageSelection(): void {
    if (selectedDocuments.value.length > 0) {
        return;
    }

    // Check for documents page selections in localStorage
    if (typeof window !== "undefined") {
        try {
            const documentsPageSelections = localStorage.getItem(
                "documents-selection",
            );
            if (documentsPageSelections) {
                const documentIds = JSON.parse(documentsPageSelections);
                if (
                    Array.isArray(documentIds) &&
                    documentIds.length > 0 &&
                    documents.value?.documents
                ) {
                    // Convert document IDs to full document objects
                    const availableDocuments = documents.value.documents.filter(
                        (doc) => documentIds.includes(doc.id),
                    );

                    if (availableDocuments.length > 0) {
                        setDocumentsForChat(availableDocuments);
                    }
                }
            }
        } catch (error) {
            console.warn(
                "Failed to sync from documents page selection:",
                error,
            );
        }
    }
}

// Watch for changes in pre-selected documents from documents page
watch(
    selectedDocumentsForChat,
    () => {
        if (hasChatDocuments()) {
            syncPreSelectedDocuments();
        }
    },
    { deep: true },
);

// Watch for changes in drawer selections and persist to localStorage
// This ensures selections made in the drawer are preserved when navigating to documents page
watch(
    selectedDocumentIds,
    (newDocumentIds) => {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(
                    STORAGE_KEYS.DOCUMENTS_SELECTION,
                    JSON.stringify(newDocumentIds),
                );
            } catch (error) {
                console.warn(
                    "Failed to save drawer selections to localStorage:",
                    error,
                );
            }
        }
    },
    { deep: true },
);

// Reset to first page when total pages change and current page is out of bounds
watch(totalPages, (newTotalPages) => {
    if (currentPage.value > newTotalPages && newTotalPages > 0) {
        currentPage.value = 1;
    }
});

// Expose selected document IDs for parent components
defineExpose({
    selectedDocumentIds,
    selectedDocuments,
    clearSelection,
});
</script>
