<template>
  <div :class="['flex', 'mb-4', props.message.isUser ? 'justify-end' : 'justify-start']">
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
          class="text-xs mt-1"
          :class="[
            props.message.isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400',
          ]"
        >
          {{ props.message.status }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Message } from "@/models/message";

const props = defineProps<{
    message: Message;
}>();
</script>