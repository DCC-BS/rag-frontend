<template>
    <div v-if="documents && documents.length > 0" class="mt-2">
        <div class="flex flex-wrap gap-2 items-center">
            <UBadge v-for="(document, docIndex) in documents" :key="document.id" color="primary" variant="subtle"
                class="cursor-pointer hover:opacity-90" @click="handleDocumentClick(document, docIndex)">
                <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-1" />
                <span>[{{ docIndex + 1 }}]</span>
                <span class="truncate max-w-56">{{ document.file_name }}</span>
                <span v-if="document.page" class="ml-1 opacity-70">({{ t("common.page_abbreviation") }} {{ document.page
                    }})</span>
            </UBadge>
        </div>

        <!-- Document Viewer Modal -->
        <DocumentViewer v-model:isOpen="isDocumentViewerOpen" :file="selectedDocumentFile"
            :fileName="selectedDocumentFileName" :page="selectedDocumentPage" />
    </div>

</template>

<script setup lang="ts">
import type { Document } from "~/services/db";

const props = defineProps<{
    documents: Document[];
}>();

const { t } = useI18n();
const toast = useToast();

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

// Download composable (for non-PDF files)
const { downloadDocument } = useDocumentDownload();

/**
 * Handle document click to open viewer
 */
async function handleDocumentClick(
    document: Document,
    _docIndex: number,
): Promise<void> {
    const fileName = document.file_name;

    try {
        // Use the user_document_id directly to fetch/download without list lookup
        const userDocumentId = document.user_document_id;
        if (typeof userDocumentId !== "number") {
            toast.add({
                title: t("documents.failedToLoad"),
                description: t("documents.unableToLoad", { fileName }),
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
            return;
        }

        // If PDF, open in embedded viewer; otherwise, download
        const isPdf = document.mime_type === "application/pdf";
        if (isPdf) {
            const result = await fetchDocument(userDocumentId, fileName);
            if (result) {
                selectedDocumentFile.value = result.blob;
                selectedDocumentFileName.value = result.fileName;
                selectedDocumentPage.value = document.page || 1;
                isDocumentViewerOpen.value = true;
            } else if (documentError.value) {
                toast.add({
                    title: t("documents.failedToLoad"),
                    description: documentError.value,
                    icon: "i-heroicons-exclamation-triangle",
                    color: "error",
                });
            }
        } else {
            await downloadDocument(userDocumentId, fileName);
        }
    } catch (error) {
        console.error("Failed to open document:", error);
        toast.add({
            title: t("documents.operationFailed"),
            description: t("documents.failedTo", {
                operation: t("documents.open"),
                fileName: fileName,
            }),
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
    }
}
</script>
