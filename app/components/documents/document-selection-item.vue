<template>
    <UCard :class="{
        'ring-2 ring-primary-500 border-primary-500': isSelected,
        'opacity-60': !canSelect && !isSelected,
        'cursor-not-allowed': !canSelect && !isSelected
    }" class="group relative transition-all duration-200 hover:shadow-md cursor-pointer" @click="handleClick">
        <!-- Selection indicator -->
        <UBadge v-if="isSelected" color="primary" variant="solid" size="xs" class="absolute top-2 right-2 z-10"
            icon="i-heroicons-check" />

        <!-- Max selection indicator -->
        <UBadge v-if="!canSelect && !isSelected" color="warning" variant="soft" size="xs"
            class="absolute top-2 right-2 z-10" :label="t('chat.maxReached')" />

        <!-- Header with file type icon and name -->
        <div class="flex items-start gap-3 mb-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                <UIcon :name="getFileIcon()" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                    {{ document.file_name }}
                </h3>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatFileType(document.mime_type) }}
                    </span>
                    <span v-if="document.num_pages && document.num_pages > 0"
                        class="text-xs text-gray-500 dark:text-gray-400">
                        • {{ t('documents.pages', { count: document.num_pages }) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Document metadata -->
        <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                <span>{{ formatDate(document.created_at) }}</span>
            </div>
            <div v-if="document.access_roles?.length > 0" class="flex items-center gap-1">
                <UIcon name="i-heroicons-user-group" class="w-3 h-3" />
                <span>{{ document.access_roles?.[0] }}</span>
            </div>
        </div>

        <!-- Selection status -->
        <div v-if="!canSelect && !isSelected" class="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {{ t('chat.maxDocumentsSelected') }}
        </div>
    </UCard>
</template>

<script lang="ts" setup>
import type { UserDocument } from "~/models/message";

const { t } = useI18n();

const props = defineProps<{
    document: UserDocument;
    isSelected: boolean;
    canSelect: boolean;
}>();

const emit = defineEmits<{
    select: [document: UserDocument];
    deselect: [documentId: number];
}>();

/**
 * Handle click on document card
 */
function handleClick(): void {
    // Don't allow interaction if cannot select and not already selected
    if (!props.canSelect && !props.isSelected) {
        return;
    }

    if (props.isSelected) {
        emit("deselect", props.document.id);
    } else {
        emit("select", props.document);
    }
}

/**
 * Get appropriate file icon based on MIME type
 */
function getFileIcon(): string {
    const mimeType = props.document.mime_type?.toLowerCase() || "";

    if (mimeType.includes("pdf")) {
        return "i-heroicons-document-text";
    }
    if (mimeType.includes("image")) {
        return "i-heroicons-photo";
    }
    if (mimeType.includes("text")) {
        return "i-heroicons-document";
    }
    if (mimeType.includes("video")) {
        return "i-heroicons-film";
    }
    if (mimeType.includes("audio")) {
        return "i-heroicons-musical-note";
    }
    return "i-heroicons-document";
}

/**
 * Format file type from MIME type
 */
function formatFileType(mimeType: string): string {
    const type = mimeType.split("/")[1] || mimeType;
    return type.toUpperCase();
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return "Invalid date";
        }
        return date.toLocaleDateString();
    } catch (error) {
        console.warn("Error parsing date:", dateString);
        return "Invalid date";
    }
}
</script>