<template>
    <div v-if="statusParts && statusParts.length > 0"
        class="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
        <!-- Streaming indicator -->
        <div v-if="isStreaming" class="flex space-x-1">
            <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                :style="`animation-delay: ${ANIMATION.DOT_ANIMATION_DELAY_1}`" />
            <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                :style="`animation-delay: ${ANIMATION.DOT_ANIMATION_DELAY_2}`" />
        </div>

        <!-- Render structured status parts -->
        <div class="text-xs font-medium flex flex-wrap gap-1">
            <template v-for="(part, partIndex) in statusParts" :key="part.id">
                <span v-if="partIndex > 0" class="text-gray-400 dark:text-gray-500"> → </span>
                <span :class="getStatusPartClasses(part)">
                    {{ part.text }}
                </span>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { StatusPart } from "~/services/db";
import { ANIMATION } from "~/utils/constants";

const props = defineProps<{
    statusParts: StatusPart[];
    isStreaming?: boolean;
}>();

/**
 * Get CSS classes for status part based on highlight type
 */
function getStatusPartClasses(part: StatusPart): string {
    const baseClasses = "text-xs font-medium";

    switch (part.highlight) {
        case "error":
            return `${baseClasses} text-red-500 dark:text-red-400`;
        case "warning":
            return `${baseClasses} text-yellow-500 dark:text-yellow-400`;
        case "success":
            return `${baseClasses} text-green-500 dark:text-green-400`;
        default:
            return `${baseClasses} text-gray-500 dark:text-gray-400`;
    }
}
</script>
