<template>
  <div class="group relative">
    <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ t("chat.source") }} {{ props.index + 1 }}
          </span>
        </div>
        <div class="text-xs text-gray-400 dark:text-gray-500">
          {{ t("chat.document") }}
        </div>
      </div>

      <!-- Title -->
      <h4 class="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
        {{ getDocumentTitle() }}
      </h4>

      <!-- Content -->
      <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-3">
        {{ props.document.page_content || 'No content available' }}
      </p>

      <!-- Footer -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- Metadata -->
          <div class="text-xs text-gray-400 dark:text-gray-500">
            {{ formatMetadata(props.document.metadata) }}
          </div>
        </div>

        <!-- Page info if available -->
        <div v-if="getPageInfo()" class="text-xs text-gray-400 dark:text-gray-500">
          {{ getPageInfo() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Document } from "@/models/message";
const { t } = useI18n();

const props = defineProps<{
    document: Document;
    index: number;
}>();

// Helper function to get document title from metadata
const getDocumentTitle = (): string => {
    const metadata = props.document.metadata;

    // Try various common title fields
    if (metadata?.title && typeof metadata.title === "string")
        return metadata.title;
    if (metadata?.filename && typeof metadata.filename === "string")
        return metadata.filename;
    if (metadata?.name && typeof metadata.name === "string")
        return metadata.name;

    return "Document";
};

// Helper function to format metadata
const formatMetadata = (metadata: Record<string, unknown>): string => {
    if (metadata?.source && typeof metadata.source === "string")
        return metadata.source;
    if (metadata?.type && typeof metadata.type === "string")
        return metadata.type;
    if (metadata?.filename && typeof metadata.filename === "string")
        return metadata.filename;

    return "Document";
};

// Helper function to get page information
const getPageInfo = (): string => {
    const metadata = props.document.metadata;

    if (metadata?.page_number) {
        return `Page ${metadata.page_number}`;
    }

    return "";
};
</script>

<style>

</style>