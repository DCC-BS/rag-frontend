<template>
    <div>
        <UCard :class="{
            'ring-2 ring-primary-500 border-primary-500': isSelected,
            'opacity-75': isDownloading || isLoadingViewer || isDeletingDocument || isUpdatingDocument
        }" class="group relative transition-all duration-200 hover:shadow-md cursor-pointer"
            @click="handleDocumentClick">
            <!-- Loading overlay -->
            <div v-if="isDownloading || isLoadingViewer || isDeletingDocument || isUpdatingDocument"
                class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-center z-20">
                <UCard class="shadow-lg">
                    <div class="flex items-center gap-3 p-2">
                        <UIcon :name="getLoadingIcon()" class="w-5 h-5 animate-spin text-primary-600" />
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ getLoadingText() }}
                        </span>
                    </div>
                </UCard>
            </div>

            <!-- Header -->
            <template #header>
                <!-- Document info -->
                <div class="flex items-center gap-3 min-w-0 flex-1" @click.stop>
                    <div class="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg shrink-0">
                        <UIcon :name="getFileIcon()" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>

                    <div class="min-w-0 flex-1">
                        <UTooltip :text="props.document.file_name" :delay="100">
                            <h3 class="font-semibold text-gray-900 dark:text-white text-base break-all">
                                {{ props.document.file_name }}
                            </h3>
                        </UTooltip>
                        <div class="flex items-center gap-2 mt-1">
                            <UBadge color="neutral" variant="soft" size="xs">
                                {{ formatMimeType(props.document.mime_type) }}
                            </UBadge>
                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                {{ formatDate(props.document.created_at) }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Document details -->
            <div class="space-y-4">
                <!-- Stats row -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {{ t('documents.documentId') }}
                        </p>
                        <p class="text-sm text-gray-900 dark:text-white font-mono">
                            #{{ props.document.id }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {{ t('documents.pages') }}
                        </p>
                        <p class="text-sm text-gray-900 dark:text-white">
                            {{ props.document.num_pages }} {{ props.document.num_pages === 1 ? t('documents.page') :
                                t('documents.pages') }}
                        </p>
                    </div>
                </div>

                <!-- Access roles -->
                <div>
                    <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        {{ t('documents.accessRoles') }}
                    </p>
                    <div class="flex flex-wrap gap-1">
                        <UBadge v-for="role in props.document.access_roles" :key="role" color="success" variant="soft"
                            size="xs">
                            {{ role }}
                        </UBadge>
                    </div>
                </div>
            </div>

            <!-- Footer with selection and actions -->
            <template #footer>
                <div class="flex items-center justify-between" @click.stop>
                    <!-- Selection checkbox -->
                    <div class="flex items-center gap-2">
                        <UCheckbox :model-value="isSelected" @update:model-value="handleSelectionChange"
                            class="shrink-0" />
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                            {{ t('documents.selectForDeletion') }}
                        </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 shrink-0">
                        <UTooltip :text="isPdfFile() ? t('documents.clickToView') : t('documents.clickToDownload')">
                            <UButton :icon="isPdfFile() ? 'i-heroicons-eye' : 'i-heroicons-arrow-down-tray'"
                                color="neutral" variant="ghost" size="sm" @click="handleDocumentClick" />
                        </UTooltip>

                        <UTooltip :text="isUpdatingDocument ? t('documents.updating') : t('documents.updateDocument')">
                            <UButton :icon="isUpdatingDocument ? 'i-heroicons-arrow-path' : 'i-heroicons-pencil-square'"
                                :class="{ 'animate-spin': isUpdatingDocument }" color="warning" variant="ghost"
                                size="sm" :disabled="isUpdatingDocument" @click="handleUpdateClick" />
                        </UTooltip>

                        <UTooltip :text="isDeletingDocument ? t('documents.deleting') : t('documents.deleteDocument')">
                            <UButton :icon="isDeletingDocument ? 'i-heroicons-arrow-path' : 'i-heroicons-trash'"
                                :class="{ 'animate-spin': isDeletingDocument }" color="error" variant="ghost" size="sm"
                                :disabled="isDeletingDocument" @click="handleDeleteClick" />
                        </UTooltip>
                    </div>
                </div>
            </template>
        </UCard>

        <!-- Document Viewer Modal - Outside the card to prevent click conflicts -->
        <DocumentViewer v-model:isOpen="isViewerOpen" :file="documentFile" :fileName="documentFileName" />
    </div>
</template>

<script lang="ts" setup>
import type { UserDocument } from "~/models/message";
import DocumentViewer from "~/components/documents/document-viewer.vue";

const { t } = useI18n();

const props = defineProps<{
    document: UserDocument;
    isSelected?: boolean;
    isDeletingDocument?: boolean;
    isUpdatingDocument?: boolean;
}>();

const emit = defineEmits<{
    'update:selected': [documentId: number, selected: boolean];
    'delete': [documentId: number];
    'update': [documentId: number];
}>();

// Authentication and token refresh
const { handleTokenRefresh } = useTokenRefresh();

// User data
const { user, fetchUser, refreshUser } = useUser();

// Document download functionality
const { downloadDocument, loading: isDownloading, error: downloadError } = useDocumentDownload();

// Document viewer functionality
const { fetchDocument, loading: isLoadingViewer, error: viewerError } = useDocumentViewer();

// Toast notifications
const toast = useToast();

// Viewer state
const isViewerOpen = ref<boolean>(false);
const documentFile = ref<Blob | undefined>(undefined);
const documentFileName = ref<string>('');

// Initialize user data and authentication on component mount
onMounted(async () => {
    if (import.meta.client) {
        try {
            // Ensure token is fresh
            await handleTokenRefresh();

            // Fetch user data if not already available
            if (!user.value) {
                await fetchUser();
            }
        } catch (error) {
            console.error('Failed to initialize user authentication:', error);
        }
    }
});

/**
 * Handle selection change
 */
function handleSelectionChange(value: boolean | "indeterminate"): void {
    const checked = value === true;
    emit('update:selected', props.document.id, checked);
}

/**
 * Handle delete button click
 */
function handleDeleteClick(): void {
    emit('delete', props.document.id);
}

/**
 * Handle update button click
 */
async function handleUpdateClick(): Promise<void> {
    // Ensure user data is available before attempting update
    if (!user.value) {
        try {
            await handleTokenRefresh();
            await refreshUser();
        } catch (error) {
            console.error('Failed to refresh user data for update:', error);
            toast.add({
                title: t('documents.authError'),
                description: t('documents.authErrorDescription'),
                icon: 'i-heroicons-exclamation-triangle',
                color: 'error',
            });
            return;
        }
    }

    emit('update', props.document.id);
}

/**
 * Get loading icon based on current operation
 */
function getLoadingIcon(): string {
    if (isDownloading.value) return 'i-heroicons-arrow-down-tray';
    if (isLoadingViewer.value) return 'i-heroicons-eye';
    if (props.isDeletingDocument) return 'i-heroicons-trash';
    if (props.isUpdatingDocument) return 'i-heroicons-pencil-square';
    return 'i-heroicons-arrow-path';
}

/**
 * Get loading text based on current operation
 */
function getLoadingText(): string {
    if (isDownloading.value) return t('documents.downloading');
    if (isLoadingViewer.value) return t('documents.loadingDocument');
    if (props.isDeletingDocument) return t('documents.deleting');
    if (props.isUpdatingDocument) return t('documents.updating');
    return t('documents.processing');
}

/**
 * Check if document is a PDF file
 */
function isPdfFile(): boolean {
    return props.document.mime_type.toLowerCase().includes('pdf');
}

/**
 * Handle document click to view (for PDFs) or download (for other files)
 */
async function handleDocumentClick(): Promise<void> {
    // Prevent reopening if modal is already open
    if (isViewerOpen.value) {
        return;
    }

    try {
        if (isPdfFile()) {
            // For PDF files, fetch and show in viewer
            const result = await fetchDocument(props.document.id, props.document.file_name);
            if (result) {
                documentFile.value = result.blob;
                documentFileName.value = result.fileName;
                isViewerOpen.value = true;
            } else if (viewerError.value) {
                // Show error toast for viewer failure
                toast.add({
                    title: t('documents.failedToLoad'),
                    description: viewerError.value || t('documents.unableToLoad', { fileName: props.document.file_name }),
                    icon: 'i-heroicons-exclamation-triangle',
                    color: 'error',
                });
            }
        } else {
            // For other files, download directly
            await downloadDocument(props.document.id, props.document.file_name);

            // Show success toast for download
            if (!downloadError.value) {
                toast.add({
                    title: t('documents.downloadStarted'),
                    description: t('documents.downloadInitiated', { fileName: props.document.file_name }),
                    icon: 'i-heroicons-arrow-down-tray',
                    color: 'success',
                });
            } else {
                // Show error toast for download failure
                toast.add({
                    title: t('documents.downloadFailed'),
                    description: downloadError.value || t('documents.failedToDownload', { fileName: props.document.file_name }),
                    icon: 'i-heroicons-exclamation-triangle',
                    color: 'error',
                });
            }
        }
    } catch (error) {
        console.error('Failed to handle document:', error);

        // Show generic error toast if no specific error was captured
        if (!downloadError.value && !viewerError.value) {
            toast.add({
                title: t('documents.operationFailed'),
                description: t('documents.failedTo', { operation: isPdfFile() ? t('documents.load') : t('documents.download'), fileName: props.document.file_name }),
                icon: 'i-heroicons-exclamation-triangle',
                color: 'error',
            });
        }
    }
}

/**
 * Get appropriate icon based on file type
 */
function getFileIcon(): string {
    const mimeType = props.document.mime_type.toLowerCase();

    if (mimeType.includes('pdf')) {
        return 'i-heroicons-document-text';
    }
    if (mimeType.includes('image')) {
        return 'i-heroicons-photo';
    }
    if (mimeType.includes('video')) {
        return 'i-heroicons-film';
    }
    if (mimeType.includes('audio')) {
        return 'i-heroicons-musical-note';
    }
    if (mimeType.includes('text') || mimeType.includes('doc')) {
        return 'i-heroicons-document-text';
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
        return 'i-heroicons-table-cells';
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
        return 'i-heroicons-presentation-chart-bar';
    }
    return 'i-heroicons-document';
}

/**
 * Format mime type for display
 */
function formatMimeType(mimeType: string): string {
    const parts = mimeType.split('/');
    if (parts.length > 1) {
        return parts[1].toUpperCase();
    }
    return mimeType.toUpperCase();
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
</script>

<style></style>