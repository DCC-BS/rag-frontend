<template>
    <div class="flex flex-col h-screen">
        <header>
            <NavigationMenu />
        </header>
        <main class="flex-1 overflow-y-auto">
            <div class="container mx-auto px-4 py-8">
                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {{ t('documents.title') }}
                            </h1>
                            <p class="text-gray-600 dark:text-gray-400">
                                {{ t('documents.description') }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading && !documents" class="flex items-center justify-center py-12">
                    <div class="text-center">
                        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p class="text-gray-600 dark:text-gray-400">{{ t('documents.loading') }}</p>
                    </div>
                </div>

                <!-- Documents Content -->
                <div v-else-if="documents || error">
                    <!-- Show error message as toast and empty state when error occurs -->
                    <div v-if="error && !documents">
                        <div class="text-center py-12">
                            <UIcon name="i-heroicons-exclamation-triangle"
                                class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {{ t('documents.errorTitle') }}
                            </h3>
                            <UButton :label="t('common.tryAgain')" color="primary" variant="solid"
                                icon="i-heroicons-arrow-path" @click="() => fetchDocuments()" :loading="loading" />
                        </div>
                    </div>

                    <!-- Search and Actions -->
                    <div v-else-if="documents" class="space-y-6">
                        <div class="flex flex-wrap justify-between">
                            <!-- Search and Limit Controls -->
                            <div>
                                <UButtonGroup size="md" orientation="horizontal">
                                    <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" size="md"
                                        variant="outline" :placeholder="t('documents.searchPlaceholder')"
                                        :loading="searchLoading" @keyup.enter="performSearch">
                                        <template v-if="searchQuery?.length" #trailing>
                                            <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x"
                                                aria-label="Clear input" @click="clearSearch()" />
                                        </template>
                                    </UInput>
                                    <UButton :label="t('common.search')" icon="i-heroicons-magnifying-glass"
                                        color="primary" variant="solid" size="md" @click="performSearch"
                                        :loading="searchLoading" />
                                </UButtonGroup>
                            </div>

                            <!-- Document Count Stats -->
                            <div>
                                <UIcon name="i-heroicons-document-duplicate"
                                    class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                                    <template v-if="searchQuery && searchPerformed">
                                        {{ t('documents.searchResultsCount', {
                                            count: documents.documents?.length ?? 0
                                        }) }}
                                        <template v-if="documents.documents?.length === searchLimit">
                                            ({{ t('documents.searchResultsCountWithLimit', {
                                                count:
                                                    documents.documents.length
                                            }) }})
                                        </template>
                                    </template>
                                    <template v-else>
                                        {{ t('documents.available', { count: documents.total_count ?? 0 }) }}
                                    </template>
                                </span>
                            </div>

                            <!-- Actions -->
                            <div v-if="documents.documents && documents.documents.length > 0">
                                <template v-if="selectedDocuments.length === 0">
                                    <UButtonGroup size="md">
                                        <!-- View Mode Toggle -->
                                        <UButton
                                            :icon="viewMode === 'tree' ? 'i-heroicons-list-bullet' : 'i-heroicons-squares-2x2'"
                                            :label="viewMode === 'tree' ? t('documents.gridView') : t('documents.treeView')"
                                            color="neutral" variant="outline"
                                            @click="viewMode = viewMode === 'tree' ? 'grid' : 'tree'" />
                                        <!-- Selection buttons - only show for Writer role -->
                                        <UButton v-if="hasWriterRole"
                                            :icon="allSelected ? 'i-heroicons-minus-circle' : 'i-heroicons-check-circle'"
                                            :label="allSelected ? t('documents.deselectAll') : t('documents.selectAll')"
                                            color="neutral" variant="outline" @click="toggleSelectAll(!allSelected)" />
                                        <!-- Add Document button - only show for Writer role -->
                                        <UButton v-if="hasWriterRole" :label="t('documents.addDocument')"
                                            icon="i-heroicons-plus" color="primary" variant="solid"
                                            @click="() => { showUploadModal = true; }" />
                                    </UButtonGroup>
                                </template>
                                <!-- Bulk actions when documents are selected -->
                                <template v-else>
                                    <UButtonGroup size="md">
                                        <UButton :label="t('common.clearSelection')" color="neutral" variant="outline"
                                            @click="clearSelection" />
                                        <!-- Chat with Selected - available for all users -->
                                        <UButton
                                            :label="t('documents.chatWithSelected', { count: selectedDocuments.length })"
                                            icon="i-heroicons-chat-bubble-left" color="primary" variant="solid"
                                            @click="chatWithSelectedDocuments"
                                            :disabled="selectedDocuments.length === 0 || selectedDocuments.length > 5" />
                                        <!-- Delete Selected - only show for Writer role -->
                                        <UButton v-if="hasWriterRole"
                                            :label="t('documents.deleteSelected', { count: selectedDocuments.length })"
                                            icon="i-heroicons-trash" color="error" variant="solid"
                                            :loading="isDeletingDocuments" @click="showBulkDeleteConfirmation" />
                                    </UButtonGroup>
                                </template>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div v-if="documents.documents && documents.documents.length === 0" class="text-center py-12">
                            <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                <template v-if="searchQuery && searchPerformed">
                                    {{ t('documents.noResultsTitle') }}
                                </template>
                                <template v-else>
                                    {{ t('documents.noDocumentsTitle') }}
                                </template>
                            </h3>
                            <p class="text-gray-600 dark:text-gray-400 mb-6">
                                <template v-if="searchQuery && searchPerformed">
                                    {{ t('documents.noResultsDescription', { query: searchQuery }) }}
                                </template>
                                <template v-else>
                                    {{ t('documents.noDocumentsDescription') }}
                                </template>
                            </p>
                            <template v-if="searchQuery && searchPerformed">
                                <UButton :label="t('documents.clearSearch')" color="primary" variant="solid"
                                    @click="clearSearch" />
                            </template>
                            <!-- Upload First button - only show for Writer role -->
                            <template v-else-if="hasWriterRole">
                                <UButton color="primary" variant="solid" icon="i-heroicons-plus"
                                    @click="() => { showUploadModal = true; }">
                                    {{ t('documents.uploadFirst') }}
                                </UButton>
                            </template>
                        </div>

                        <!-- Documents Display -->
                        <div v-else-if="documents.documents && documents.documents.length > 0" class="space-y-6">
                            <!-- Tree View -->
                            <div v-if="viewMode === 'tree'">
                                <DocumentTree :documents="documents.documents" :selectedDocuments="selectedDocuments"
                                    :deletingDocumentIds="deletingDocumentIds"
                                    :updatingDocumentIds="updatingDocumentIds" :hasWriterRole="hasWriterRole"
                                    @update:selected="handleDocumentSelection" @delete="showSingleDeleteConfirmation"
                                    @update="showUpdateModal" />
                            </div>

                            <!-- Grid View -->
                            <div v-else class="space-y-6">
                                <div class="documents-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <UserDocument v-for="document in paginatedDocuments" :key="document.id"
                                        :document="document" :isSelected="selectedDocuments.includes(document.id)"
                                        :isDeletingDocument="deletingDocumentIds.includes(document.id)"
                                        :isUpdatingDocument="updatingDocumentIds.includes(document.id)"
                                        :hasWriterRole="hasWriterRole" @update:selected="handleDocumentSelection"
                                        @delete="showSingleDeleteConfirmation" @update="showUpdateModal" />
                                </div>

                                <!-- Pagination for Grid View - only show if not searching -->
                                <div v-if="!searchPerformed && totalPages > 1" class="flex justify-center mt-8">
                                    <UPagination v-model:page="currentPage" :total="documents.documents?.length || 0"
                                        :items-per-page="itemsPerPage" show-edges :sibling-count="1" size="md"
                                        color="primary" variant="outline" active-color="primary"
                                        active-variant="solid" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <footer>
            <Footer />
        </footer>

        <!-- Delete Confirmation Modal -->
        <UModal v-model:open="showDeleteModal" :title="deleteModalData.title" :description="deleteModalData.message">
            <template #header>
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                            {{ deleteModalData.title }}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">
                            {{ deleteModalData.message }}
                        </p>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <UButton color="neutral" variant="outline" @click="cancelDelete" :disabled="isDeletingDocuments">
                        {{ t('common.cancel') }}
                    </UButton>
                    <UButton color="error" variant="solid" @click="confirmDelete" :disabled="isDeletingDocuments"
                        :loading="isDeletingDocuments">
                        <template #leading>
                            <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                        </template>
                        {{ t('common.delete') }}
                    </UButton>
                </div>
            </template>
        </UModal>

        <!-- Document Update Modal -->
        <DocumentUpdateModal v-model:isOpen="showUpdateModalState" :documentId="updateModalData.documentId"
            :documentName="updateModalData.documentName" :currentAccessRole="updateModalData.currentAccessRole"
            :documentPath="updateModalData.documentPath" @updated="handleDocumentUpdated" />

        <!-- Document Upload Modal - only show for Writer role -->
        <DocumentUploadModal v-if="hasWriterRole" v-model:isOpen="showUploadModal" @uploaded="handleDocumentUploaded" />
    </div>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const {
    documents,
    loading,
    error,
    fetchDocuments,
    refreshDocuments,
    searchDocuments,
} = useDocuments();
const {
    deleteDocument,
    deleteMultipleDocuments,
    loading: isDeletingDocuments,
    error: deletionError,
} = useDocumentDeletion();
const { setDocumentsForChat } = useChatDocumentSelection();

// Authentication and role checking
const { data: session } = useAuth();

// Computed property to check if user has Writer role
const hasWriterRole = computed<boolean>(() => {
    const userRoles =
        (session.value?.user as { roles?: string[] })?.roles ?? [];
    return userRoles.includes("Writer");
});

// Toast notifications
const toast = useToast();

// Search functionality
const searchQuery = ref<string>("");
const searchLimit = ref<number>(SEARCH_LIMITS.DEFAULT_SEARCH_LIMIT);
const searchLoading = ref<boolean>(false);
const searchPerformed = ref<boolean>(false);

// Selection functionality - persistent across page reloads
const selectedDocuments = ref<number[]>([]);

// Initialize from localStorage on mount
function initializeSelections(): void {
    if (typeof window !== "undefined") {
        try {
            const stored = localStorage.getItem(
                STORAGE_KEYS.DOCUMENTS_SELECTION,
            );
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    // Only restore the stored IDs without validation
                    // Validation will happen when documents are loaded via watcher
                    selectedDocuments.value = parsed.filter(
                        (id) =>
                            typeof id === "number" &&
                            Number.isInteger(id) &&
                            id > 0,
                    );
                }
            }
        } catch (error) {
            console.warn("Failed to restore document selections:", error);
            // Clear corrupted data
            localStorage.removeItem(STORAGE_KEYS.DOCUMENTS_SELECTION);
        }
    }
}

// Import constants
import {
    SELECTION_LIMITS,
    STORAGE_KEYS,
    STORAGE_LIMITS,
} from "~/utils/constants";

// Flag to prevent infinite loops when updating selectedDocuments
const isUpdatingSelection = ref<boolean>(false);

// Save to localStorage whenever selections change
watch(
    selectedDocuments,
    (newSelection) => {
        if (!isUpdatingSelection.value) {
            saveSelectedDocumentsToStorage(newSelection);
        }
    },
    { deep: true },
);

/**
 * Handle selection truncation and show notification
 */
function handleSelectionTruncation(
    originalLength: number,
    truncatedSelection: number[],
): void {
    toast.add({
        title: t("documents.selectionLimitTitle"),
        description: t(
            "documents.selectionLimitDescription",
            {
                limit: SELECTION_LIMITS.MAX_SELECTION_COUNT,
                original: originalLength,
            },
        ),
        color: "warning",
        icon: "i-heroicons-exclamation-triangle",
    });

    // Update the reactive value safely without triggering the watcher
    isUpdatingSelection.value = true;
    selectedDocuments.value = truncatedSelection;
    nextTick(() => {
        isUpdatingSelection.value = false;
    });
}

/**
 * Show storage size limit notification
 */
function showStorageSizeError(): void {
    toast.add({
        title: t("documents.storageSizeTitle", "Selection Too Large"),
        description: t(
            "documents.storageSizeDescription",
            "Selection too large for storage. Please select fewer documents.",
        ),
        color: "warning",
        icon: "i-heroicons-exclamation-triangle",
    });
}

/**
 * Save selected documents to localStorage with size limits and error handling
 */
function saveSelectedDocumentsToStorage(selection: number[]): void {
    if (typeof window !== "undefined") {
        try {
            // Check if selection exceeds count limit
            if (selection.length > SELECTION_LIMITS.MAX_SELECTION_COUNT) {
                const truncatedSelection = selection.slice(
                    0,
                    SELECTION_LIMITS.MAX_SELECTION_COUNT,
                );
                // Save truncated selection first
                localStorage.setItem(
                    STORAGE_KEYS.DOCUMENTS_SELECTION,
                    JSON.stringify(truncatedSelection),
                );
                // Handle truncation notification outside the watcher
                handleSelectionTruncation(selection.length, truncatedSelection);
                return;
            }

            const jsonString = JSON.stringify(selection);

            // Check if JSON string exceeds size limit
            if (jsonString.length > STORAGE_LIMITS.MAX_STORAGE_SIZE) {
                showStorageSizeError();
                return;
            }

            localStorage.setItem(STORAGE_KEYS.DOCUMENTS_SELECTION, jsonString);
        } catch (error) {
            console.warn("Failed to save document selections:", error);

            if (error instanceof Error && error.name === "QuotaExceededError") {
                toast.add({
                    title: t(
                        "documents.storageSizeTitle",
                        "Selection Too Large",
                    ),
                    description: t(
                        "documents.storageSizeDescription",
                        "Selection too large for storage. Please select fewer documents.",
                    ),
                    color: "error",
                    icon: "i-heroicons-exclamation-triangle",
                });
            } else {
                // Other storage errors are also actual error conditions
                const { handleApiError } = useApiError();
                handleApiError(error, "Failed to save document selections");
            }
        }
    }
}

/**
 * Validate stored document IDs against current document list
 * Filters out any IDs that don't exist in the current documents
 */
function validateStoredDocumentIds(storedIds: number[]): number[] {
    if (!documents.value?.documents || storedIds.length === 0) {
        return [];
    }

    const currentDocumentIds = new Set(
        documents.value.documents.map((doc) => doc.id),
    );

    return storedIds.filter((id) => {
        if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
            return false; // Invalid ID format
        }
        return currentDocumentIds.has(id);
    });
}
const deletingDocumentIds = ref<number[]>([]);

// Update functionality
const updatingDocumentIds = ref<number[]>([]);
const showUpdateModalState = ref<boolean>(false);
const updateModalData = ref<{
    documentId: number;
    documentName: string;
    currentAccessRole: string;
    documentPath: string;
}>({
    documentId: 0,
    documentName: "",
    currentAccessRole: "",
    documentPath: "",
});

// Upload functionality
const showUploadModal = ref<boolean>(false);

// View mode functionality
const viewMode = ref<"tree" | "grid">("tree");

// Client-side pagination for grid view
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(SEARCH_LIMITS.GRID_ITEMS_PER_PAGE);

// Client-side pagination: slice documents array for current page
const paginatedDocuments = computed(() => {
    if (viewMode.value !== "grid" || !documents.value?.documents) {
        return documents.value?.documents || [];
    }

    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return documents.value.documents.slice(startIndex, endIndex);
});

const totalPages = computed<number>(() => {
    if (!documents.value?.documents || viewMode.value !== "grid") return 1;
    return Math.ceil(documents.value.documents.length / itemsPerPage.value);
});

// Watch for view mode changes and reset to first page
watch(viewMode, (newMode, oldMode) => {
    if (newMode !== oldMode) {
        currentPage.value = 1;
    }
});

// Watch for data changes and reset to first page if current page is out of bounds
watch(totalPages, (newTotalPages) => {
    if (currentPage.value > newTotalPages && newTotalPages > 0) {
        currentPage.value = 1;
    }
});

// Watch for changes in documents list and clean up stale selections
watch(
    () => documents.value?.documents,
    (newDocuments, oldDocuments) => {
        // Validate selections when documents first load
        if (newDocuments && !oldDocuments) {
            validateAndCleanupSelections();
        }
        // Also clean up if documents actually changed (not just loading state)
        else if (
            newDocuments &&
            oldDocuments &&
            newDocuments !== oldDocuments
        ) {
            cleanupStaleSelections();
        }
    },
    { deep: true },
);

// Delete confirmation modal
const showDeleteModal = ref<boolean>(false);
const deleteModalData = ref<{
    title: string;
    message: string;
    documentIds: number[];
}>({
    title: "",
    message: "",
    documentIds: [],
});

/**
 * Check if all visible documents are selected
 * In grid view, this checks only documents on the current page
 */
const allSelected = computed<boolean>(() => {
    const visibleDocuments =
        viewMode.value === "grid"
            ? paginatedDocuments.value
            : documents.value?.documents || [];
    return (
        visibleDocuments.length > 0 &&
        visibleDocuments.every((doc) =>
            selectedDocuments.value.includes(doc.id),
        )
    );
});

/**
 * Handle "Chat with Selected" button click
 */
async function chatWithSelectedDocuments(): Promise<void> {
    if (selectedDocuments.value.length === 0) {
        toast.add({
            title: t("documents.chatWithSelectedError"),
            description: t("documents.noDocumentsSelectedForChat"),
            color: "warning",
            icon: "i-heroicons-exclamation-triangle",
        });
        return;
    }

    if (selectedDocuments.value.length > 5) {
        toast.add({
            title: t("documents.chatWithSelectedError"),
            description: t("documents.tooManyDocumentsSelectedForChat"),
            color: "warning",
            icon: "i-heroicons-exclamation-triangle",
        });
        return;
    }

    try {
        // Convert selected document IDs to full UserDocument objects
        const selectedDocumentObjects =
            documents.value?.documents?.filter((doc) =>
                selectedDocuments.value.includes(doc.id),
            ) || [];

        if (selectedDocumentObjects.length === 0) {
            throw new Error("No documents found for selected IDs");
        }

        setDocumentsForChat(selectedDocumentObjects);

        toast.add({
            title: t("documents.chatWithSelectedSuccess"),
            description: t("documents.chatWithSelectedSuccessDescription", {
                count: selectedDocumentObjects.length,
            }),
            color: "success",
            icon: "i-heroicons-chat-bubble-left",
        });

        await navigateTo("/");
    } catch (error) {
        console.error("Error setting documents for chat:", error);
        toast.add({
            title: t("documents.chatWithSelectedError"),
            description: t("documents.chatWithSelectedErrorDescription"),
            color: "error",
            icon: "i-heroicons-exclamation-triangle",
        });
    }
}

/**
 * Validate and clean up selections when documents first load
 * This handles the initial validation that was deferred from initializeSelections
 */
function validateAndCleanupSelections(): void {
    if (selectedDocuments.value.length === 0) return;

    const validIds = validateStoredDocumentIds(selectedDocuments.value);

    if (validIds.length !== selectedDocuments.value.length) {
        const removedCount = selectedDocuments.value.length - validIds.length;
        console.info(
            `Validated document selections: ${validIds.length} valid, ${removedCount} stale IDs removed`,
        );
        selectedDocuments.value = validIds;
        // Update localStorage with validated data
        saveSelectedDocumentsToStorage(validIds);
    }
}

/**
 * Clean up selections when document list changes
 * Removes any selected document IDs that no longer exist
 */
function cleanupStaleSelections(): void {
    if (selectedDocuments.value.length === 0) return;

    const validIds = validateStoredDocumentIds(selectedDocuments.value);

    if (validIds.length !== selectedDocuments.value.length) {
        const removedCount = selectedDocuments.value.length - validIds.length;
        console.info(`Cleaned up ${removedCount} stale document selections`);
        selectedDocuments.value = validIds;
    }
}

/**
 * Perform search with current query and limit
 */
async function performSearch(): Promise<void> {
    if (!searchQuery.value.trim() && !searchPerformed.value) {
        // If no query and haven't searched before, just fetch all
        await fetchDocuments();
        return;
    }

    searchLoading.value = true;
    try {
        const limit =
            searchLimit.value > 0
                ? Math.min(searchLimit.value, SEARCH_LIMITS.MAX_SEARCH_LIMIT)
                : SEARCH_LIMITS.DEFAULT_SEARCH_LIMIT;
        await searchDocuments(searchQuery.value.trim(), limit);
        searchPerformed.value = true;
        // Clear selections after search to avoid stale selections
        selectedDocuments.value = [];
    } finally {
        searchLoading.value = false;
    }
}

/**
 * Handle individual document selection
 */
function handleDocumentSelection(documentId: number, selected: boolean): void {
    if (selected) {
        if (!selectedDocuments.value.includes(documentId)) {
            selectedDocuments.value.push(documentId);
        }
    } else {
        const index = selectedDocuments.value.indexOf(documentId);
        if (index > -1) {
            selectedDocuments.value.splice(index, 1);
        }
    }
}

/**
 * Toggle select all documents
 * In grid view, this only affects documents on the current page
 */
function toggleSelectAll(value: boolean | "indeterminate"): void {
    // Only allow selection if user has Writer role
    if (!hasWriterRole.value) return;

    const visibleDocuments =
        viewMode.value === "grid"
            ? paginatedDocuments.value
            : documents.value?.documents || [];

    if (value === true) {
        // Select all visible documents (current page in grid view)
        const visibleDocumentIds = visibleDocuments.map((doc) => doc.id);
        const uniqueIds = [
            ...new Set([...selectedDocuments.value, ...visibleDocumentIds]),
        ];
        selectedDocuments.value = uniqueIds;
    } else {
        // Deselect all visible documents (current page in grid view)
        const visibleDocumentIds = visibleDocuments.map((doc) => doc.id);
        selectedDocuments.value = selectedDocuments.value.filter(
            (id) => !visibleDocumentIds.includes(id),
        );
    }
}

/**
 * Clear all selections
 */
function clearSelection(): void {
    selectedDocuments.value = [];
}

/**
 * Clear the search query and fetch all documents
 */
async function clearSearch(): Promise<void> {
    searchQuery.value = "";
    searchLimit.value = SEARCH_LIMITS.DEFAULT_SEARCH_LIMIT;
    searchPerformed.value = false;
    selectedDocuments.value = [];
    currentPage.value = 1; // Reset to first page
    await fetchDocuments();
}

/**
 * Show update modal for a document
 */
function showUpdateModal(documentId: number): void {
    // Only allow update if user has Writer role
    if (!hasWriterRole.value) return;

    const document = documents.value?.documents?.find(
        (doc) => doc.id === documentId,
    );
    if (!document) return;

    updateModalData.value = {
        documentId: documentId,
        documentName: document.file_name,
        currentAccessRole: document.access_roles[0] || "", // Use first access role as current
        documentPath: document.document_path,
    };
    showUpdateModalState.value = true;
}

/**
 * Handle document update completion
 */
async function handleDocumentUpdated(documentId: number): Promise<void> {
    // Add to updating state
    updatingDocumentIds.value.push(documentId);

    try {
        // Refresh documents to get updated data
        if (searchPerformed.value && searchQuery.value.trim()) {
            await performSearch();
        } else {
            await refreshDocuments();
        }

        // Remove from selection if it was selected
        selectedDocuments.value = selectedDocuments.value.filter(
            (id) => id !== documentId,
        );
    } finally {
        // Remove from updating state
        updatingDocumentIds.value = updatingDocumentIds.value.filter(
            (id) => id !== documentId,
        );
    }
}

/**
 * Handle document upload completion
 */
async function handleDocumentUploaded(): Promise<void> {
    try {
        // Refresh documents to get updated data including the new document
        if (searchPerformed.value && searchQuery.value.trim()) {
            await performSearch();
        } else {
            await refreshDocuments();
        }

        // Clear any selections since we have new data
        selectedDocuments.value = [];
        // Reset to first page to show new documents
        currentPage.value = 1;
    } catch (error) {
        console.error("Error refreshing documents after upload:", error);

        // Show error toast if refresh fails
        toast.add({
            title: t("documents.refreshErrorTitle"),
            description: t("documents.refreshErrorDescription"),
            icon: "i-heroicons-exclamation-triangle",
            color: "warning",
        });
    }
}

/**
 * Show single document delete confirmation
 */
function showSingleDeleteConfirmation(documentId: number): void {
    // Only allow delete if user has Writer role
    if (!hasWriterRole.value) return;

    const document = documents.value?.documents?.find(
        (doc) => doc.id === documentId,
    );
    if (!document) return;

    deleteModalData.value = {
        title: t("documents.deleteModalTitle", { count: 1 }),
        message: t("documents.deleteModalMessage", {
            fileName: document.file_name,
        }),
        documentIds: [documentId],
    };
    showDeleteModal.value = true;
}

/**
 * Show bulk delete confirmation
 */
function showBulkDeleteConfirmation(): void {
    // Only allow delete if user has Writer role
    if (!hasWriterRole.value) return;

    const count = selectedDocuments.value.length;
    deleteModalData.value = {
        title: t("documents.deleteModalTitle", { count }),
        message: t("documents.deleteModalMessage_plural", { count }),
        documentIds: [...selectedDocuments.value],
    };
    showDeleteModal.value = true;
}

/**
 * Cancel delete operation
 */
function cancelDelete(): void {
    showDeleteModal.value = false;
    deleteModalData.value = { title: "", message: "", documentIds: [] };
}

/**
 * Show success toast notification for document deletion
 */
function showDeleteSuccessToast(documentName: string): void {
    toast.add({
        title: t("documents.deleteSuccessTitle"),
        description: t("documents.deleteSuccessDescription", {
            fileName: documentName,
        }),
        icon: "i-heroicons-trash",
        color: "success",
    });
}

/**
 * Show error toast notification for document deletion
 */
function showDeleteErrorToast(documentName: string): void {
    toast.add({
        title: t("documents.deleteErrorTitle"),
        description:
            deletionError.value ||
            t("documents.deleteErrorDescription", {
                fileName: documentName,
            }),
        icon: "i-heroicons-exclamation-triangle",
        color: "error",
    });
}

/**
 * Show toast notifications for bulk deletion results
 */
function showBulkDeleteToast(result: {
    success: number;
    failed: number;
}): void {
    if (result.failed === 0) {
        // Complete success
        toast.add({
            title: t("documents.deleteMultipleSuccessTitle"),
            description: t("documents.deleteMultipleSuccessDescription", {
                count: result.success,
            }),
            icon: "i-heroicons-trash",
            color: "success",
        });
    } else if (result.success > 0) {
        // Partial success
        toast.add({
            title: t("documents.deleteMultiplePartialSuccessTitle"),
            description: t(
                "documents.deleteMultiplePartialSuccessDescription",
                {
                    successCount: result.success,
                    failedCount: result.failed,
                },
            ),
            icon: "i-heroicons-exclamation-triangle",
            color: "warning",
        });
    } else {
        // Complete failure
        toast.add({
            title: t("documents.deleteMultipleErrorTitle"),
            description:
                deletionError.value ||
                t("documents.deleteMultipleErrorDescription", {
                    count: result.success + result.failed,
                }),
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
    }
}

/**
 * Refresh documents list after deletion
 */
async function refreshDocumentsAfterDelete(): Promise<void> {
    if (searchPerformed.value && searchQuery.value.trim()) {
        await performSearch();
    } else {
        await refreshDocuments();
    }

    // Clean up stale selections after refresh
    nextTick(() => {
        cleanupStaleSelections();
    });
}

/**
 * Clean up selections after successful deletion
 */
function cleanupSelectionsAfterDelete(deletedDocumentIds: number[]): void {
    selectedDocuments.value = selectedDocuments.value.filter(
        (id) => !deletedDocumentIds.includes(id),
    );
}

/**
 * Clean up modal state after deletion operation
 */
function cleanupModalState(): void {
    showDeleteModal.value = false;
    deleteModalData.value = { title: "", message: "", documentIds: [] };
}

/**
 * Handle single document deletion
 */
async function handleSingleDocumentDelete(
    documentId: number,
): Promise<boolean> {
    const document = documents.value?.documents?.find(
        (doc) => doc.id === documentId,
    );
    const documentName = document?.file_name || "Unknown document";

    const success = await deleteDocument(documentId);

    if (success) {
        showDeleteSuccessToast(documentName);
        await refreshDocumentsAfterDelete();
        cleanupSelectionsAfterDelete([documentId]);
        return true;
    }
    showDeleteErrorToast(documentName);
    return false;
}

/**
 * Handle bulk document deletion
 */
async function handleBulkDocumentDelete(
    documentIds: number[],
): Promise<boolean> {
    const result = await deleteMultipleDocuments(documentIds);

    if (result.success > 0) {
        showBulkDeleteToast(result);
        await refreshDocumentsAfterDelete();
        cleanupSelectionsAfterDelete(documentIds);
        return true;
    }
    showBulkDeleteToast(result);
    return false;
}

/**
 * Confirm and execute delete operation
 */
async function confirmDelete(): Promise<void> {
    const documentIds = deleteModalData.value.documentIds;
    if (documentIds.length === 0) return;

    try {
        // Add documents to deleting state
        deletingDocumentIds.value.push(...documentIds);

        if (documentIds.length === 1) {
            const documentId = documentIds[0];
            if (documentId !== undefined) {
                await handleSingleDocumentDelete(documentId);
            }
        } else {
            await handleBulkDocumentDelete(documentIds);
        }
    } finally {
        // Remove from deleting state
        deletingDocumentIds.value = deletingDocumentIds.value.filter(
            (id) => !documentIds.includes(id),
        );
        // Clean up modal state
        cleanupModalState();
    }
}

// Set page metadata
useHead({
    title: t("documents.title"),
    meta: [{ name: "description", content: t("documents.description") }],
});

// Watch for errors and show toast notifications
watch(error, (newError) => {
    if (newError) {
        toast.add({
            title: t("documents.errorTitle"),
            description: newError,
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
            actions: [
                {
                    label: t("documents.tryAgain"),
                    icon: "i-heroicons-arrow-path",
                    color: "primary",
                    variant: "outline",
                    onClick: () => {
                        if (searchPerformed.value && searchQuery.value.trim()) {
                            performSearch();
                        } else {
                            fetchDocuments();
                        }
                    },
                },
            ],
        });
    }
});

// Watch for deletion errors and show toast notifications
watch(deletionError, (newError) => {
    if (newError) {
        toast.add({
            title: t("documents.deleteErrorTitle"),
            description: newError,
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
    }
});

// Fetch documents on mount
onMounted(() => {
    initializeSelections(); // Restore persistent selections first
    fetchDocuments();
});
</script>

<style></style>