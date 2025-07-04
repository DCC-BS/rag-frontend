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
                            <UButton :label="t('documents.tryAgain')" color="primary" variant="solid"
                                icon="i-heroicons-arrow-path" @click="() => fetchDocuments()" :loading="loading" />
                        </div>
                    </div>

                    <!-- Search and Actions -->
                    <div v-else-if="documents" class="space-y-6">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 items-center">
                            <!-- Search and Limit Controls -->
                            <div class="flex items-center gap-3 w-full lg:justify-start">
                                <UButtonGroup size="lg" orientation="horizontal">
                                    <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" size="lg"
                                        variant="outline" :placeholder="t('documents.searchPlaceholder')"
                                        :loading="searchLoading" @keyup.enter="performSearch" class="w-full sm:w-80">
                                        <template v-if="searchQuery?.length" #trailing>
                                            <UButton color="neutral" variant="link" size="sm" icon="i-lucide-circle-x"
                                                aria-label="Clear input" @click="searchQuery = ''" />
                                        </template>
                                    </UInput>

                                    <UInput v-model="searchLimit" type="number" size="lg" variant="outline" min="1"
                                        max="20" @keyup.enter="performSearch" placeholder="" :ui="{ base: 'peer' }"
                                        class="w-32" id="search-limit-input">
                                        <label for="search-limit-input"
                                            class="pointer-events-none absolute left-0 -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
                                            <span class="inline-flex bg-default px-1">{{
                                                t('documents.searchLimitPlaceholder') }}</span>
                                        </label>
                                    </UInput>

                                    <UButton :label="t('documents.search')" icon="i-heroicons-magnifying-glass"
                                        color="primary" variant="solid" size="lg" @click="performSearch"
                                        :loading="searchLoading" />
                                </UButtonGroup>
                            </div>

                            <!-- Document Count Stats - Centered -->
                            <div class="hidden lg:flex items-center justify-center gap-2">
                                <UIcon name="i-heroicons-document-duplicate"
                                    class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">
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
                            <div class="flex items-center gap-2 lg:justify-end"
                                v-if="documents.documents && documents.documents.length > 0">
                                <template v-if="selectedDocuments.length === 0">
                                    <UButtonGroup size="lg">
                                        <UButton
                                            :icon="allSelected ? 'i-heroicons-minus-circle' : 'i-heroicons-check-circle'"
                                            :label="allSelected ? t('documents.deselectAll') : t('documents.selectAll')"
                                            color="neutral" variant="outline" @click="toggleSelectAll(!allSelected)" />
                                        <UButton :label="t('documents.addDocument')" icon="i-heroicons-plus"
                                            color="primary" variant="solid" @click="showUploadModal = true" />
                                    </UButtonGroup>
                                </template>
                                <template v-else>
                                    <UButtonGroup size="lg">
                                        <UButton :label="t('documents.selected', { count: selectedDocuments.length })"
                                            color="neutral" disabled />
                                        <UButton :label="t('documents.clearSelection')" color="neutral"
                                            variant="outline" @click="clearSelection" />
                                        <UButton
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
                            <template v-else>
                                <UButton color="primary" variant="solid" icon="i-heroicons-plus"
                                    @click="showUploadModal = true">
                                    {{ t('documents.uploadFirst') }}
                                </UButton>
                            </template>
                        </div>

                        <!-- Documents Grid -->
                        <div v-else-if="documents.documents && documents.documents.length > 0" class="space-y-6">
                            <div class="documents-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                <UserDocument v-for="document in documents.documents" :key="document.id"
                                    :document="document" :isSelected="selectedDocuments.includes(document.id)"
                                    :isDeletingDocument="deletingDocumentIds.includes(document.id)"
                                    :isUpdatingDocument="updatingDocumentIds.includes(document.id)"
                                    @update:selected="handleDocumentSelection" @delete="showSingleDeleteConfirmation"
                                    @update="showUpdateModal" />
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
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {{ deleteModalData.message }}
                        </p>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <UButton color="neutral" variant="outline" @click="cancelDelete" :disabled="isDeletingDocuments">
                        {{ t('documents.cancel') }}
                    </UButton>
                    <UButton color="error" variant="solid" @click="confirmDelete" :disabled="isDeletingDocuments"
                        :loading="isDeletingDocuments">
                        <template #leading>
                            <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                        </template>
                        {{ t('documents.delete') }}
                    </UButton>
                </div>
            </template>
        </UModal>

        <!-- Document Update Modal -->
        <DocumentUpdateModal v-model:isOpen="showUpdateModalState" :documentId="updateModalData.documentId"
            :documentName="updateModalData.documentName" :currentAccessRole="updateModalData.currentAccessRole"
            @updated="handleDocumentUpdated" />

        <!-- Document Upload Modal -->
        <DocumentUploadModal v-model:isOpen="showUploadModal" @uploaded="handleDocumentUploaded" />
    </div>
</template>

<script lang="ts" setup>
import DocumentUploadModal from "~/components/documents/document-upload-modal.vue";
import type { UserDocument } from "~/models/message";

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

// Toast notifications
const toast = useToast();

// Search functionality
const searchQuery = ref<string>("");
const searchLimit = ref<number>(10);
const searchLoading = ref<boolean>(false);
const searchPerformed = ref<boolean>(false);

// Selection functionality
const selectedDocuments = ref<number[]>([]);
const deletingDocumentIds = ref<number[]>([]);

// Update functionality
const updatingDocumentIds = ref<number[]>([]);
const showUpdateModalState = ref<boolean>(false);
const updateModalData = ref<{
    documentId: number;
    documentName: string;
    currentAccessRole: string;
}>({
    documentId: 0,
    documentName: "",
    currentAccessRole: "",
});

// Upload functionality
const showUploadModal = ref<boolean>(false);

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
 */
const allSelected = computed<boolean>(() => {
    const visibleDocuments = documents.value?.documents || [];
    return (
        visibleDocuments.length > 0 &&
        visibleDocuments.every((doc) =>
            selectedDocuments.value.includes(doc.id),
        )
    );
});

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
            searchLimit.value > 0 ? Math.min(searchLimit.value, 20) : 10;
        await searchDocuments(searchQuery.value.trim(), limit);
        searchPerformed.value = true;
        // Clear selections after search
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
 */
function toggleSelectAll(value: boolean | "indeterminate"): void {
    const visibleDocuments = documents.value?.documents || [];

    if (value === true) {
        // Select all visible documents
        const visibleDocumentIds = visibleDocuments.map((doc) => doc.id);
        const uniqueIds = [
            ...new Set([...selectedDocuments.value, ...visibleDocumentIds]),
        ];
        selectedDocuments.value = uniqueIds;
    } else {
        // Deselect all visible documents
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
    searchLimit.value = 10;
    searchPerformed.value = false;
    selectedDocuments.value = [];
    await fetchDocuments();
}

/**
 * Show update modal for a document
 */
function showUpdateModal(documentId: number): void {
    const document = documents.value?.documents?.find(
        (doc) => doc.id === documentId,
    );
    if (!document) return;

    updateModalData.value = {
        documentId: documentId,
        documentName: document.file_name,
        currentAccessRole: document.access_roles[0] || "", // Use first access role as current
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
 * Confirm and execute delete operation
 */
async function confirmDelete(): Promise<void> {
    const documentIds = deleteModalData.value.documentIds;
    if (documentIds.length === 0) return;

    try {
        // Add documents to deleting state
        deletingDocumentIds.value.push(...documentIds);

        if (documentIds.length === 1) {
            // Single document deletion
            const document = documents.value?.documents?.find(
                (doc) => doc.id === documentIds[0],
            );
            const documentName = document?.file_name || "Unknown document";

            const success = await deleteDocument(documentIds[0]);
            if (success) {
                // Show success toast
                toast.add({
                    title: t("documents.deleteSuccessTitle"),
                    description: t("documents.deleteSuccessDescription", {
                        fileName: documentName,
                    }),
                    icon: "i-heroicons-trash",
                    color: "success",
                });

                // Refresh documents
                if (searchPerformed.value && searchQuery.value.trim()) {
                    await performSearch();
                } else {
                    await refreshDocuments();
                }

                // Remove from selection
                selectedDocuments.value = selectedDocuments.value.filter(
                    (id) => id !== documentIds[0],
                );
            } else {
                // Show error toast
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
        } else {
            // Bulk deletion
            const result = await deleteMultipleDocuments(documentIds);
            if (result.success > 0) {
                // Show success toast
                if (result.failed === 0) {
                    toast.add({
                        title: t("documents.deleteMultipleSuccessTitle"),
                        description: t(
                            "documents.deleteMultipleSuccessDescription",
                            { count: result.success },
                        ),
                        icon: "i-heroicons-trash",
                        color: "success",
                    });
                } else {
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
                }

                // Refresh documents
                if (searchPerformed.value && searchQuery.value.trim()) {
                    await performSearch();
                } else {
                    await refreshDocuments();
                }

                // Clear selection for successfully deleted documents
                selectedDocuments.value = selectedDocuments.value.filter(
                    (id) => !documentIds.includes(id),
                );
            } else {
                // Show error toast for complete failure
                toast.add({
                    title: t("documents.deleteMultipleErrorTitle"),
                    description:
                        deletionError.value ||
                        t("documents.deleteMultipleErrorDescription", {
                            count: documentIds.length,
                        }),
                    icon: "i-heroicons-exclamation-triangle",
                    color: "error",
                });
            }
        }
    } finally {
        // Remove from deleting state
        deletingDocumentIds.value = deletingDocumentIds.value.filter(
            (id) => !documentIds.includes(id),
        );
        // Close modal
        showDeleteModal.value = false;
        deleteModalData.value = { title: "", message: "", documentIds: [] };
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
    fetchDocuments();
});
</script>

<style></style>