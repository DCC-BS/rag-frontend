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
                        ? 'bg-blue-200 dark:bg-blue-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-md'
                ]">
                    <!-- Error state -->
                    <div v-if="hasErrorStatus" class="flex items-center gap-2 mb-2">
                        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-500" />
                        <span class="text-xs font-medium text-red-500">Error</span>
                    </div>

                    <!-- Message text -->
                    <div class="prose prose-sm max-w-none"
                        :class="props.message.isUser ? 'prose-invert' : 'dark:prose-invert'"
                        @click="handleContentClick">
                        <MDCRenderer v-if="body" :body="body.body" />
                    </div>

                    <!-- Status indicator -->
                    <div v-if="(props.message.statusParts && props.message.statusParts.length > 0) && !props.message.isUser"
                        class="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div v-if="props.message.streaming" class="flex space-x-1">
                            <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                                style="animation-delay: 0.2s" />
                            <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
                                style="animation-delay: 0.4s" />
                        </div>

                        <!-- Render structured status parts -->
                        <div class="text-xs font-medium flex flex-wrap gap-1">
                            <template v-for="(part, partIndex) in props.message.statusParts" :key="partIndex">
                                <span v-if="partIndex > 0" class="text-gray-400 dark:text-gray-500"> → </span>
                                <span :class="getStatusPartClasses(part)">
                                    {{ part.text }}
                                </span>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Timestamp (shown on hover) -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
                    <span class="text-xs text-gray-400 dark:text-gray-500">
                        {{ props.message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''
                        }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Documents/Sources Section -->
        <div v-if="props.message.documents && props.message.documents.length > 0">
            <UAccordion :items="accordionItems" :default-open="false">
                <template #item="{ item }">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <DocumentCard v-for="(document, docIndex) in props.message.documents" :key="docIndex"
                            :document="document" :index="docIndex" />
                    </div>
                </template>
            </UAccordion>
        </div>

        <!-- Document Viewer Modal for Reference Clicks -->
        <DocumentViewer v-model:isOpen="isDocumentViewerOpen" :file="selectedDocumentFile"
            :fileName="selectedDocumentFileName" :page="selectedDocumentPage" />
    </div>
</template>

<script lang="ts" setup>
import type { MDCParserResult } from "@nuxtjs/mdc";
import { computed } from "vue";
import type { Message, StatusPart } from "@/models/message";
import type { UserDocument } from "~/models/document";

const props = defineProps<{
    message: Message;
}>();

const body = ref<MDCParserResult | null>(null);

// Document viewer state
const isDocumentViewerOpen = ref<boolean>(false);
const selectedDocumentFile = ref<Blob | undefined>(undefined);
const selectedDocumentFileName = ref<string>("");
const selectedDocumentPage = ref<number>(1);

// Document viewer composable
const {
    fetchDocument,
    loading: isLoadingDocument,
    error: documentError,
} = useDocumentViewer();

// Toast for notifications
const toast = useToast();

/**
 * Transform content to replace document references with clickable superscripts
 */
function transformContentWithReferences(content: string): string {
    if (!props.message.documents || props.message.documents.length === 0) {
        return content;
    }

    // Replace [number] patterns with clickable superscript links
    return content.replace(/\[(\d+)\]/g, (match, number) => {
        const docIndex = Number.parseInt(number, 10) - 1; // Convert to 0-based index
        if (
            docIndex >= 0 &&
            props.message.documents &&
            docIndex < props.message.documents.length
        ) {
            return `<sup><a href="#" class="document-reference text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold no-underline" data-doc-index="${docIndex}">${number}</a></sup>`;
        }
        return match; // Return original if no matching document
    });
}

watch(
    () => props.message.content,
    async () => {
        const transformedContent = transformContentWithReferences(
            props.message.content,
        );
        const result = await parseMarkdown(transformedContent);
        body.value = result;
    },
    { immediate: true },
);

/**
 * Handle document reference click
 */
async function handleDocumentReferenceClick(docIndex: number): Promise<void> {
    if (
        !props.message.documents ||
        docIndex >= props.message.documents.length
    ) {
        return;
    }

    const document = props.message.documents[docIndex];
    if (!document) {
        return;
    }

    // Get document title from metadata
    const fileName =
        (typeof document.metadata?.file_name === "string"
            ? document.metadata.file_name
            : null) || `document_${docIndex + 1}`;

    try {
        // Only handle PDF files for viewer
        const isPdf = document.metadata?.mime_type === "application/pdf";
        if (!isPdf) {
            toast.add({
                title: t("documents.operationFailed"),
                description: `${t("documents.failedTo", { operation: "view", fileName })} Only PDF files are supported.`,
                icon: "i-heroicons-exclamation-triangle",
                color: "warning",
            });
            return;
        }

        // Find the corresponding user document to get the ID
        const { documents: userDocuments, fetchDocuments } = useDocuments();
        if (!userDocuments.value) {
            await fetchDocuments(); // Ensure documents are loaded
        }

        const userDocument = userDocuments.value?.documents?.find(
            (doc: UserDocument) => doc.file_name === fileName,
        );

        if (!userDocument) {
            toast.add({
                title: t("documents.failedToLoad"),
                description: t("documents.unableToLoad", { fileName }),
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
            return;
        }

        // Fetch and display document
        const result = await fetchDocument(userDocument.id, fileName);
        if (result) {
            selectedDocumentFile.value = result.blob;
            selectedDocumentFileName.value = result.fileName;
            selectedDocumentPage.value =
                (document.metadata?.page as number) || 1;
            isDocumentViewerOpen.value = true;
        } else if (documentError.value) {
            toast.add({
                title: t("documents.failedToLoad"),
                description: documentError.value,
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
        }
    } catch (error) {
        console.error("Failed to open document:", error);
        toast.add({
            title: t("documents.operationFailed"),
            description: t("documents.failedTo", {
                operation: "open",
                fileName: fileName,
            }),
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
    }
}

/**
 * Handle clicks on document references in the rendered content
 */
function handleContentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains("document-reference")) {
        event.preventDefault();
        const docIndex = Number.parseInt(
            target.getAttribute("data-doc-index") || "0",
            10,
        );
        handleDocumentReferenceClick(docIndex);
    }
}

const { t } = useI18n();

// Make accordionItems computed per component instance
const accordionItems = computed(() => [
    {
        label: t("chat.sources"),
        slot: "item",
    },
]);

const hasErrorStatus = computed(() => {
    return (
        props.message.statusParts?.some(
            (part) => part.text === "Error" && part.highlight === "error",
        ) || false
    );
});

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
