<template>
  <div class="flex mb-4" :class="{'justify-end': props.message.isUser, 'justify-start': !props.message.isUser}">
    <div class="flex items-end gap-2" :class="{'flex-row-reverse': props.message.isUser}">
      <UAvatar :src="props.message.avatar" size="sm" />
      <div
        class="rounded-lg px-4 py-2 max-w-xs lg:max-w-md"
        :class="{
          'bg-blue-500 text-white': props.message.isUser,
          'bg-gray-200 text-gray-900': !props.message.isUser,
        }"
      >
        <p class="text-sm">{{ props.message.content }}</p>
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

<style>
/* No specific styles needed here as we are using Tailwind/UnoCSS classes */
</style>