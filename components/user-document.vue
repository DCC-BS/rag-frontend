<template>
    <div class="group relative">
        <div @click="handleDocumentClick"
            class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer"
            :class="{ 'opacity-75 pointer-events-none': isDownloading }">
            <div v-if="isDownloading"
                class="absolute inset-0 bg-white/50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center z-10">
                <div class="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 animate-bounce text-blue-600" />
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Downloading...</span>
                </div>
            </div>

            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <UIcon :name="getFileIcon()" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 class="font-semibold text-gray-900 dark:text-white text-lg">
                            {{ props.document.file_name }}
                        </h3>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                            {{ formatMimeType(props.document.mime_type) }}
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {{ formatDate(props.document.created_at) }}
                    </div>
                    <div class="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <UIcon name="i-heroicons-eye" class="w-3 h-3" />
                        <span>Click to view</span>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Document ID
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        #{{ props.document.id }}
                    </div>
                </div>
                <div>
                    <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pages
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        {{ props.document.num_pages }} {{ props.document.num_pages === 1 ? 'page' : 'pages' }}
                    </div>
                </div>
            </div>

            <!-- Access Roles -->
            <div class="mb-4">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Access Roles
                </div>
                <div class="flex flex-wrap gap-2">
                    <span v-for="role in props.document.access_roles" :key="role"
                        class="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        {{ role }}
                    </span>
                </div>
            </div>

            <!-- Document Path -->
            <div>
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Document Path
                </div>
                <div
                    class="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded border truncate">
                    {{ props.document.document_path }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { UserDocument } from "~/models/message";

const props = defineProps<{
    document: UserDocument;
}>();

// Document download functionality
const { downloadDocument, loading: isDownloading, error: downloadError } = useDocumentDownload();

/**
 * Handle document click to download/view document
 */
async function handleDocumentClick(): Promise<void> {
    try {
        await downloadDocument(props.document.id, props.document.file_name);
    } catch (error) {
        console.error('Failed to download document:', error);
        // Error is already handled by the composable
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