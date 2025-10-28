<template>
    <UTooltip :delay-duration="0" :text="tooltipText">
        <span class="ref-tag" ref="slotEl" :title="tooltipText">
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
let mutationObserver: MutationObserver | undefined;

function parseIndexFromSlot(): void {
    const textContent = slotEl.value?.textContent?.trim() ?? "";
    const parsed = Number.parseInt(textContent, 10);
    referenceIndex.value = Number.isFinite(parsed) ? parsed : undefined;
}

onMounted(() => {
    // Compute initial index
    parseIndexFromSlot();
    // Observe text changes inside slot during streaming to keep index in sync
    if (slotEl.value) {
        mutationObserver = new MutationObserver(() => {
            parseIndexFromSlot();
        });
        mutationObserver.observe(slotEl.value, {
            subtree: true,
            characterData: true,
            childList: true,
        });
    }
});

onBeforeUnmount(() => {
    if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = undefined;
    }
});

onUpdated(() => {
    // Safeguard: recompute on updates in case observer missed something
    parseIndexFromSlot();
});

watch(
    () => injectedDocuments.value.length,
    () => {
        // Re-parse when related documents arrive/update during streaming
        parseIndexFromSlot();
    },
);

function getDocTitle(document: ChatDocument): string | undefined {
    // Prefer top-level file_name from Document
    if (
        typeof document.file_name === "string" &&
        document.file_name.length > 0
    ) {
        return document.file_name;
    }
    // Fallback to metadata.file_name
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
                        ? ` (${t("common.page_abbreviation")} ${doc.page})`
                        : "";
                return `${title}${pageInfo}`;
            }
        }
    }
    return t("common.reference");
});

// No debug/diagnostic computeds
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
