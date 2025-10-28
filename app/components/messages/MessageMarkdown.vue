<template>
    <!-- Provide message-specific documents to MDC subtree -->
    <MDC :value="value" />

</template>

<script setup lang="ts">
import { provide, toRef } from "vue";

import type { Document as ChatDocument } from "~/services/db";

interface MessageMarkdownProps {
    value: string;
    documents: ChatDocument[];
}

const props = defineProps<MessageMarkdownProps>();

// Provide a reactive reference so injections receive updates if documents change
const providedDocuments = toRef(props, "documents");
provide("mdcDocuments", providedDocuments);

// No debug DOM attributes; documents are provided via injection only
</script>