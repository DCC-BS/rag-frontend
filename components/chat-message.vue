<template>
  <div :class="['flex flex-col', 'mb-4', props.message.isUser ? 'items-end' : 'items-start']">
    <div :class="['flex', 'items-end', 'gap-2', { 'flex-row-reverse': props.message.isUser }]">
      <UAvatar :src="props.message.avatar" size="sm" />
      <div
        class="rounded-lg px-4 py-2 max-w-xs lg:max-w-md"
        :class="{
          'bg-blue-500 text-white': props.message.isUser,
          'bg-gray-200 text-gray-900': !props.message.isUser,
        }"
      >
        <p class="text-sm">{{ props.message.content }}</p>
        <p
          v-if="props.message.status && !props.message.isUser"
          class="text-xs mt-1 text-gray-500 dark:text-gray-400"
        >
          {{ props.message.status }}
        </p>
      </div>
    </div>

    <UAccordion
      v-if="props.message.documents && props.message.documents.length > 0"
      :items="accordionItems"
      :default-open="false"
      class="mt-2 w-full max-w-full"
    >
      <template #default="{ item, index, open }">
        <UButton
            variant="ghost"
            class="border-b border-gray-200 dark:border-gray-700 w-full flex justify-between items-center p-3" 
          >
            <div class="flex items-center">
              <UIcon
                name="i-heroicons-information-circle"
                class="w-5 h-5 mr-2"
              />
              <span class="truncate">{{ item.label }} ({{ props.message.documents.length }})</span>
            </div>
            <UIcon
              name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 transform transition-transform duration-200"
              :class="[open && 'rotate-90']"
            />
          </UButton>
      </template>
      <template #item="{ item }">
        <div class="mt-2 flex flex-row flex-wrap gap-2 p-2">
          <Document
            v-for="(document, docIndex) in props.message.documents"
            :key="docIndex"
            :document="document"
            :index="docIndex"
          />
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script lang="ts" setup>
import type { Message } from "@/models/message";
import Document from "./document.vue";
import { ref } from "vue";

const { t } = useI18n();
const props = defineProps<{
    message: Message;
}>();

const accordionItems = ref([
    {
        label: t("chat.sources"),
        slot: "item",
    },
]);
</script>