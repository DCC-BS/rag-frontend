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

                <!-- Error State -->
                <div v-else-if="error"
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div class="flex items-center gap-3 mb-3">
                        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h3 class="font-semibold text-red-800 dark:text-red-200">{{ t('documents.errorTitle') }}</h3>
                    </div>
                    <p class="text-red-700 dark:text-red-300 mb-4">{{ error }}</p>
                    <button @click="fetchDocuments"
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
                        {{ t('documents.tryAgain') }}
                    </button>
                </div>

                <!-- Documents Content -->
                <div v-else-if="documents">
                    <!-- Search and Actions -->
                    <div class="flex items-center justify-between gap-4 mb-6">
                        <!-- Search Input -->
                        <div class="w-full sm:w-auto">
                            <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" size="lg"
                                :placeholder="t('documents.searchPlaceholder')" :trailing="false"
                                class="w-full sm:w-80">
                                <template #trailing>
                                    <UButton v-if="searchQuery" icon="i-heroicons-x-mark" color="neutral"
                                        variant="ghost" size="xs" @click="clearSearch" />
                                </template>
                            </UInput>
                        </div>

                        <!-- Document Count Stats -->
                        <div class="hidden lg:flex items-center gap-3">
                            <UIcon name="i-heroicons-document-duplicate"
                                class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                <template
                                    v-if="searchQuery && filteredDocuments.length !== documents.documents?.length">
                                    {{ t('documents.searchMatch_plural', {
                                        count: filteredDocuments.length, total:
                                            documents.total_count ?? 0
                                    }) }}
                                </template>
                                <template v-else>
                                    {{ t('documents.available', { count: documents.total_count ?? 0 }) }}
                                </template>
                            </span>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-2" v-if="filteredDocuments.length > 0">
                            <template v-if="selectedDocuments.length === 0">
                                <UButtonGroup size="md">
                                    <UButton
                                        :icon="allSelected ? 'i-heroicons-minus-circle' : 'i-heroicons-check-circle'"
                                        :label="allSelected ? t('documents.deselectAll') : t('documents.selectAll')"
                                        color="neutral" variant="outline" @click="toggleSelectAll(!allSelected)" />
                                    <UButton :label="t('documents.addDocument')" icon="i-heroicons-plus" color="primary"
                                        variant="solid" @click="showUploadModal = true" />
                                    <UButton :label="t('documents.refresh')" icon="i-heroicons-arrow-path"
                                        color="neutral" variant="outline" @click="refreshDocuments"
                                        :loading="loading" />
                                </UButtonGroup>
                            </template>
                            <template v-else>
                                <UButtonGroup size="md">
                                    <UButton :label="t('documents.selected', { count: selectedDocuments.length })"
                                        color="neutral" disabled />
                                    <UButton :label="t('documents.clearSelection')" color="neutral" variant="outline"
                                        @click="clearSelection" />
                                    <UButton :label="t('documents.deleteSelected', { count: selectedDocuments.length })"
                                        icon="i-heroicons-trash" color="error" variant="solid"
                                        :loading="isDeletingDocuments" @click="showBulkDeleteConfirmation" />
                                </UButtonGroup>
                            </template>
                        </div>
                    </div>

                    <!-- Deletion Error -->
                    <UAlert v-if="deletionError" color="error" variant="subtle" :title="deletionError"
                        icon="i-heroicons-exclamation-triangle" class="mb-6" />

                    <!-- Empty State -->
                    <div v-if="documents.documents && documents.documents.length === 0" class="text-center py-12">
                        <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {{ t('documents.noDocumentsTitle') }}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">
                            {{ t('documents.noDocumentsDescription') }}
                        </p>
                        <UButton color="primary" variant="solid" icon="i-heroicons-plus"
                            @click="showUploadModal = true">
                            {{ t('documents.uploadFirst') }}
                        </UButton>
                    </div>

                    <!-- No Search Results -->
                    <div v-else-if="searchQuery && filteredDocuments.length === 0" class="text-center py-12">
                        <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {{ t('documents.noResultsTitle') }}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">
                            {{ t('documents.noResultsDescription', { query: searchQuery }) }}
                        </p>
                        <UButton :label="t('documents.clearSearch')" color="primary" variant="solid"
                            @click="clearSearch" />
                    </div>

                    <!-- Documents Grid -->
                    <div v-else-if="filteredDocuments.length > 0"
                        class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <UserDocument v-for="document in filteredDocuments" :key="document.id" :document="document"
                            :isSelected="selectedDocuments.includes(document.id)"
                            :isDeletingDocument="deletingDocumentIds.includes(document.id)"
                            :isUpdatingDocument="updatingDocumentIds.includes(document.id)"
                            @update:selected="handleDocumentSelection" @delete="showSingleDeleteConfirmation"
                            @update="showUpdateModal" />
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
import type { UserDocument } from "~/models/message";
import DocumentUploadModal from "~/components/documents/document-upload-modal.vue";

const { t } = useI18n();
const { documents, loading, error, fetchDocuments, refreshDocuments } = useDocuments();
const { deleteDocument, deleteMultipleDocuments, loading: isDeletingDocuments, error: deletionError } = useDocumentDeletion();

// Toast notifications
const toast = useToast();

// Search functionality
const searchQuery = ref<string>('');

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
    documentName: '',
    currentAccessRole: '',
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
    title: '',
    message: '',
    documentIds: [],
});

/**
 * Computed property to filter documents based on search query
 * Uses case-insensitive partial matching on file names
 */
const filteredDocuments = computed<UserDocument[]>(() => {
    if (!documents.value?.documents || !searchQuery.value.trim()) {
        return documents.value?.documents || [];
    }

    const query = searchQuery.value.toLowerCase().trim();
    return documents.value.documents.filter((document: UserDocument) =>
        document.file_name.toLowerCase().includes(query)
    );
});

/**
 * Check if all documents are selected
 */
const allSelected = computed<boolean>(() => {
    return filteredDocuments.value.length > 0 &&
        filteredDocuments.value.every(doc => selectedDocuments.value.includes(doc.id));
});

/**
 * Check if some documents are selected
 */
const someSelected = computed<boolean>(() => {
    return selectedDocuments.value.length > 0;
});

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
    if (value === true) {
        // Select all filtered documents
        selectedDocuments.value = filteredDocuments.value.map(doc => doc.id);
    } else {
        // Deselect all
        selectedDocuments.value = [];
    }
}

/**
 * Clear all selections
 */
function clearSelection(): void {
    selectedDocuments.value = [];
}

/**
 * Clear the search query
 */
function clearSearch(): void {
    searchQuery.value = '';
}

/**
 * Show update modal for a document
 */
function showUpdateModal(documentId: number): void {
    const document = documents.value?.documents?.find(doc => doc.id === documentId);
    if (!document) return;

    updateModalData.value = {
        documentId: documentId,
        documentName: document.file_name,
        currentAccessRole: document.access_roles[0] || '', // Use first access role as current
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
        await refreshDocuments();

        // Remove from selection if it was selected
        selectedDocuments.value = selectedDocuments.value.filter(id => id !== documentId);
    } finally {
        // Remove from updating state
        updatingDocumentIds.value = updatingDocumentIds.value.filter(id => id !== documentId);
    }
}

/**
 * Handle document upload completion
 */
async function handleDocumentUploaded(): Promise<void> {
    try {
        // Refresh documents to get updated data including the new document
        await refreshDocuments();

        // Clear any selections since we have new data
        selectedDocuments.value = [];
    } catch (error) {
        console.error('Error refreshing documents after upload:', error);

        // Show error toast if refresh fails
        toast.add({
            title: t('documents.refreshErrorTitle'),
            description: t('documents.refreshErrorDescription'),
            icon: 'i-heroicons-exclamation-triangle',
            color: 'warning',
        });
    }
}

/**
 * Show single document delete confirmation
 */
function showSingleDeleteConfirmation(documentId: number): void {
    const document = documents.value?.documents?.find(doc => doc.id === documentId);
    if (!document) return;

    deleteModalData.value = {
        title: t('documents.deleteModalTitle', { count: 1 }),
        message: t('documents.deleteModalMessage', { fileName: document.file_name }),
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
        title: t('documents.deleteModalTitle', { count }),
        message: t('documents.deleteModalMessage_plural', { count }),
        documentIds: [...selectedDocuments.value],
    };
    showDeleteModal.value = true;
}

/**
 * Cancel delete operation
 */
function cancelDelete(): void {
    showDeleteModal.value = false;
    deleteModalData.value = { title: '', message: '', documentIds: [] };
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
            const document = documents.value?.documents?.find(doc => doc.id === documentIds[0]);
            const documentName = document?.file_name || 'Unknown document';

            const success = await deleteDocument(documentIds[0]);
            if (success) {
                // Show success toast
                toast.add({
                    title: t('documents.deleteSuccessTitle'),
                    description: t('documents.deleteSuccessDescription', { fileName: documentName }),
                    icon: 'i-heroicons-trash',
                    color: 'success',
                });

                // Remove from local state
                if (documents.value?.documents) {
                    documents.value.documents = documents.value.documents.filter(
                        doc => doc.id !== documentIds[0]
                    );
                    if (documents.value.total_count) {
                        documents.value.total_count--;
                    }
                }
                // Remove from selection
                selectedDocuments.value = selectedDocuments.value.filter(id => id !== documentIds[0]);
            } else {
                // Show error toast
                toast.add({
                    title: t('documents.deleteErrorTitle'),
                    description: deletionError.value || t('documents.deleteErrorDescription', { fileName: documentName }),
                    icon: 'i-heroicons-exclamation-triangle',
                    color: 'error',
                });
            }
        } else {
            // Bulk deletion
            const result = await deleteMultipleDocuments(documentIds);
            if (result.success > 0) {
                // Show success toast
                if (result.failed === 0) {
                    toast.add({
                        title: t('documents.deleteMultipleSuccessTitle'),
                        description: t('documents.deleteMultipleSuccessDescription', { count: result.success }),
                        icon: 'i-heroicons-trash',
                        color: 'success',
                    });
                } else {
                    toast.add({
                        title: t('documents.deleteMultiplePartialSuccessTitle'),
                        description: t('documents.deleteMultiplePartialSuccessDescription', { successCount: result.success, failedCount: result.failed }),
                        icon: 'i-heroicons-exclamation-triangle',
                        color: 'warning',
                    });
                }

                // Remove successfully deleted documents from local state
                if (documents.value?.documents) {
                    documents.value.documents = documents.value.documents.filter(
                        doc => !documentIds.includes(doc.id)
                    );
                    if (documents.value.total_count) {
                        documents.value.total_count -= result.success;
                    }
                }
                // Clear selection for successfully deleted documents
                selectedDocuments.value = selectedDocuments.value.filter(id => !documentIds.includes(id));
            } else {
                // Show error toast for complete failure
                toast.add({
                    title: t('documents.deleteMultipleErrorTitle'),
                    description: deletionError.value || t('documents.deleteMultipleErrorDescription', { count: documentIds.length }),
                    icon: 'i-heroicons-exclamation-triangle',
                    color: 'error',
                });
            }
        }
    } finally {
        // Remove from deleting state
        deletingDocumentIds.value = deletingDocumentIds.value.filter(
            id => !documentIds.includes(id)
        );
        // Close modal
        showDeleteModal.value = false;
        deleteModalData.value = { title: '', message: '', documentIds: [] };
    }
}

// Set page metadata
useHead({
    title: t('documents.title'),
    meta: [
        { name: 'description', content: t('documents.description') }
    ]
});

// Fetch documents on mount
onMounted(() => {
    fetchDocuments();
});
</script>

<style></style>