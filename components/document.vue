<template>
  <UCard class="max-w-xs lg:max-w-md flex-shrink-0" style="min-width: 200px;">
    <template #header>
      <h3 class="text-sm font-semibold">[{{ props.index + 1 }}]</h3>
    </template>
    
    <p class="text-xs text-gray-700 dark:text-gray-300">
      {{ props.document.page_content }}
    </p>

    <template #footer>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ props.document.metadata.filename }}, {{ t("chat.page") }} {{ props.document.metadata.page_number }}
      </p>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import type { Document } from "~/models/message";

const { t } = useI18n();

const props = defineProps<{
    document: Document;
    index: number;
}>();
</script>

<style>

</style>