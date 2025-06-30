<template>
  <div class="group relative">
    <div
      class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {{ getDocumentTitle() }}
          </div>
        </div>
      </div>
      <!-- Content -->
      <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-3">
        {{ props.document.page_content || t('documents.noContent') }}
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
  if (metadata?.file_name && typeof metadata.file_name === "string")
    return metadata.file_name;

  return t("chat.document");
};

// Helper function to get page information
const getPageInfo = (): string => {
  const metadata = props.document.metadata;

  if (metadata?.page && metadata.num_pages && typeof metadata.page === "number" && typeof metadata.num_pages === "number") {
    return t("chat.page", { page: metadata.page, num_pages: metadata.num_pages });
  }

  return "";
};

const formatMetadata = (metadata: Record<string, unknown>): string => {
  const metadata_strings = []
  if (metadata?.mime_type && typeof metadata.mime_type === "string") {
    const mime_type = metadata.mime_type.split("/")[1]
    metadata_strings.push(`${t("chat.mime_type")}: ${mime_type}`);
  }
  if (metadata?.created_at && typeof metadata.created_at === "string") {
    metadata_strings.push(`${t("chat.created_at")}: ${new Date(metadata.created_at).toLocaleDateString()}`);
  }

  return metadata_strings.join(", ");
};
</script>

<style></style>