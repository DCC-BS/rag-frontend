<template>
    <UTooltip :delay-duration="0" :text="tooltipText">
        <span class="ref-tag" ref="slotEl">
            <slot />
        </span>
    </UTooltip>
</template>

<script setup lang="ts">
const { t } = useI18n();

import type { Document as ChatDocument } from "~/services/db";

// Inject documents provided by MessageMarkdown wrapper
const injectedDocuments = inject<Ref<ChatDocument[]>>("mdcDocuments", ref([]));

// Element containing the slot text (e.g., "1")
const slotEl = ref<HTMLElement | undefined>(undefined);
const referenceIndex = ref<number | undefined>(undefined);

function parseIndexFromSlot(): void {
    const textContent = slotEl.value?.textContent?.trim() ?? "";
    const parsed = Number.parseInt(textContent, 10);
    referenceIndex.value = Number.isFinite(parsed) ? parsed : undefined;
}

onMounted(() => {
    // Slot content is static after mount
    parseIndexFromSlot();
});

function getDocTitle(document: ChatDocument): string | undefined {
    const meta = document.metadata;
    if (typeof meta.file_name === "string" && meta.file_name.length > 0) {
        return meta.file_name;
    }
    return undefined;
}
// Resolve tooltip text by matching the numeric index to a document
const tooltipText = computed((): string => {
    const docs = injectedDocuments.value;
    const idx = referenceIndex.value;
    if (Array.isArray(docs) && typeof idx === "number" && idx > 0) {
        const doc = docs[idx - 1];
        if (doc) {
            const title = getDocTitle(doc);
            if (title) {
                const pageInfo =
                    typeof doc.page === "number"
                        ? ` (${t("common.page_abreviation")} ${doc.page})`
                        : "";
                return `${title}${pageInfo}`;
            }
        }
    }
    return t("common.reference");
});
</script>

<style scoped>
.ref-tag {
    display: inline;
    cursor: help;
    text-decoration: underline;
    text-decoration-style: dotted;
    color: #3b82f6;
    font-size: 0.75em;
    vertical-align: super;
    font-weight: 600;
}

/* Add brackets around ref content using pseudo-elements */
.ref-tag::before {
    content: "[";
}

.ref-tag::after {
    content: "]";
}
</style>
