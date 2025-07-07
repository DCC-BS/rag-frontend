<script lang="ts" setup>
import type { Document, UserDocument } from "@/models/message";

const { t } = useI18n();
const toast = useToast();

// Document fetching composables
const {
    fetchDocument,
    loading: viewerLoading,
    error: viewerError,
} = useDocumentViewer();
const { documents, fetchDocuments } = useDocuments();

const props = defineProps<{
    document: Document;
    index: number;
}>();

// State for document viewer
const isViewerOpen = ref<boolean>(false);
const documentFile = ref<Blob | undefined>(undefined);
const documentFileName = ref<string>("");

// Helper function to get document title from metadata
const getDocumentTitle = (): string => {
    const metadata = props.document.metadata;
    if (metadata?.file_name && typeof metadata.file_name === "string")
        return metadata.file_name;

    return t("chat.document");
};

// Helper function to get page information
const getPageInfo = (): string => {
    const metadata = props.document.metadata;

    if (
        metadata?.page &&
        metadata.num_pages &&
        typeof metadata.page === "number" &&
        typeof metadata.num_pages === "number"
    ) {
        return t("chat.page", {
            page: metadata.page,
            num_pages: metadata.num_pages,
        });
    }

    return "";
};

// Helper function to get the document page number
const getDocumentPage = (): number => {
    const metadata = props.document.metadata;
    if (metadata?.page && typeof metadata.page === "number") {
        return metadata.page;
    }
    return 1;
};

// Helper function to check if document is a PDF
const isPdfFile = (): boolean => {
    const metadata = props.document.metadata;
    return metadata?.mime_type === "application/pdf";
};

// Helper function to find UserDocument by filename
const findUserDocument = async (
    fileName: string
): Promise<UserDocument | undefined> => {
    // Ensure documents are loaded
    if (!documents.value) {
        await fetchDocuments();
    }

    return documents.value?.documents?.find(
        (doc: UserDocument) => doc.file_name === fileName
    );
};

// Handle document click to open viewer
async function handleDocumentClick(): Promise<void> {
    // Prevent reopening if modal is already open
    if (isViewerOpen.value) {
        return;
    }

    try {
        const fileName = getDocumentTitle();

        // Only handle PDF files for now
        if (!isPdfFile()) {
            toast.add({
                title: t("documents.operationFailed"),
                description: t("documents.failedTo", {
                    operation: t("documents.load"),
                    fileName,
                }),
                icon: "i-heroicons-exclamation-triangle",
                color: "warning",
            });
            return;
        }

        // Find the UserDocument by filename
        const userDocument = await findUserDocument(fileName);

        if (!userDocument) {
            toast.add({
                title: t("documents.failedToLoad"),
                description: t("documents.unableToLoad", {
                    fileName,
                }),
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
            return;
        }

        // Fetch and show document in viewer
        const result = await fetchDocument(
            userDocument.id,
            userDocument.file_name
        );

        if (result) {
            documentFile.value = result.blob;
            documentFileName.value = result.fileName;
            isViewerOpen.value = true;
        } else if (viewerError.value) {
            // Show error toast for viewer failure
            toast.add({
                title: t("documents.failedToLoad"),
                description:
                    viewerError.value ||
                    t("documents.unableToLoad", {
                        fileName,
                    }),
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
        }
    } catch (error: unknown) {
        console.error("Error handling document click:", error);
        toast.add({
            title: t("documents.operationFailed"),
            description: t("documents.failedTo", {
                operation: t("documents.load"),
                fileName: getDocumentTitle(),
            }),
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
    }
}

const formatMetadata = (metadata: Record<string, unknown>): string => {
    const metadata_strings = [];
    if (metadata?.mime_type && typeof metadata.mime_type === "string") {
        const mime_type = metadata.mime_type.split("/")[1];
        metadata_strings.push(`${t("chat.mime_type")}: ${mime_type}`);
    }
    if (metadata?.created_at && typeof metadata.created_at === "string") {
        metadata_strings.push(
            `${t("chat.created_at")}: ${new Date(metadata.created_at).toLocaleDateString()}`
        );
    }

    return metadata_strings.join(", ");
};
</script>

<template>

</template>
