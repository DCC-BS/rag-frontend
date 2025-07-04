<template>
  <div :class="['flex flex-col', 'mb-6', props.message.isUser ? 'items-end' : 'items-start']">
    <div :class="['flex', 'items-end', 'gap-3', 'max-w-[85%]', { 'flex-row-reverse': props.message.isUser }]">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <UAvatar :src="props.message.avatar" size="md" class="ring-2 ring-white dark:ring-gray-700 shadow-md" />
      </div>

      <!-- Message bubble -->
      <div class="relative group">
        <!-- Message content -->
        <div :class="[
          'rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg',
          props.message.isUser
            ? 'bg-blue-500 dark:bg-blue-800 text-white rounded-br-md'
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md'
        ]">
          <!-- Error state -->
          <div v-if="props.message.status === 'Error'" class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-500" />
            <span class="text-xs font-medium text-red-500">Error</span>
          </div>

          <!-- Message text -->
          <div class="prose prose-sm max-w-none" :class="props.message.isUser ? 'prose-invert' : 'dark:prose-invert'">
            <p>{{ props.message.content }}</p>
            <!-- TODO: Fix MDC rendering -->
            <!-- <MDC :key="props.message.id" :value="props.message.content" /> -->
          </div>

          <!-- Status indicator -->
          <div v-if="props.message.status && !props.message.isUser && props.message.status !== 'Error'"
            class="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div v-if="props.message.streaming" class="flex space-x-1">
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {{ props.message.status }}
            </span>
          </div>
        </div>

        <!-- Timestamp (shown on hover) -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
          <span class="text-xs text-gray-400 dark:text-gray-500">
            {{ props.message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Documents/Sources Section -->
    <div v-if="props.message.documents && props.message.documents.length > 0"
      :class="['mt-4 w-full max-w-[85%]', { 'self-end': props.message.isUser }]">
      <UAccordion :items="accordionItems" :default-open="false"
        class="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm">
        <template #default="{ item, index, open }">
          <UButton variant="ghost"
            class="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div class="text-left">
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ item.label }}</span>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('chat.sourcesCount', { count: props.message.documents.length }) }}
                </div>
              </div>
            </div>
          </UButton>
        </template>
        <template #item="{ item }">
          <div class="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-600">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Document v-for="(document, docIndex) in props.message.documents" :key="docIndex" :document="document"
                :index="docIndex" />
            </div>
          </div>
        </template>
      </UAccordion>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Message } from "@/models/message";

const props = defineProps<{
    message: Message;
}>();

const { t } = useI18n();

// Make accordionItems computed per component instance
const accordionItems = computed(() => [
    {
        label: t("chat.sources"),
        slot: "item",
    },
]);
</script>