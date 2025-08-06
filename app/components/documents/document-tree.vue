<template>
    <div class="space-y-4">
        <!-- Tree View -->
        <UTree v-if="treeItems.length > 0" :items="treeItems" :multiple="true" color="neutral" size="md"
            @select="handleTreeSelection">
            <template #item="{ item }">
                <div class="flex items-center justify-between w-full min-w-0">
                    <!-- Item Content -->
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                        <UIcon :name="item.icon" :class="getIconClass(item)" />
                        <span class="truncate text-sm" :class="getTextClass(item)">
                            {{ item.label }}
                        </span>
                        <UBadge v-if="item.isFile && item.document" :color="getBadgeColor(item.document.mime_type)"
                            variant="soft" size="xs">
                            {{ formatMimeType(item.document.mime_type) }}
                        </UBadge>
                    </div>

                    <!-- File Actions -->
                    <div v-if="item.isFile && item.document" class="flex items-center gap-1 shrink-0 ml-2" @click.stop>
                        <UCheckbox :model-value="selectedDocuments.includes(item.document?.id || 0)"
                            @update:model-value="(value) => handleDocumentSelection(item.document?.id || 0, value === true)"
                            size="sm" />

                        <!-- File Actions -->
                        <UButton :icon="isPdfFile(item.document) ? 'i-heroicons-eye' : 'i-heroicons-arrow-down-tray'"
                            color="neutral" variant="ghost" size="xs" @click="handleDocumentClick(item.document)"
                            :disabled="isDocumentLoading()" />

                        <!-- Update and Delete buttons - only show for Writer role -->
                        <UButton v-if="hasWriterRole" icon="i-heroicons-pencil-square" color="warning" variant="ghost"
                            size="xs" @click="handleUpdateClick(item.document.id)"
                            :disabled="isDocumentUpdating(item.document.id)" />

                        <UButton v-if="hasWriterRole" icon="i-heroicons-trash" color="error" variant="ghost" size="xs"
                            @click="handleDeleteClick(item.document.id)"
                            :disabled="isDocumentDeleting(item.document.id)" />
                    </div>

                    <!-- Folder Badge -->
                    <UBadge v-else-if="!item.isFile" color="neutral" variant="outline" size="xs" class="ml-2">
                        {{ getFileCount(item) }}
                    </UBadge>
                </div>
            </template>
        </UTree>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
            <UIcon name="i-heroicons-folder-open" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {{ t('documents.noDocumentsInTree') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
                {{ t('documents.noDocumentsInTreeDescription') }}
            </p>
        </div>

        <!-- Document Viewer Modal -->
        <DocumentViewer v-model:isOpen="isViewerOpen" :file="documentFile" :fileName="documentFileName"
            :page="viewerPage || 1" />
    </div>
</template>

<script lang="ts" setup>
import type { UserDocument } from "~/models/document";

const { t } = useI18n();
const toast = useToast();

interface TreeItem {
    label: string;
    value: string;
    icon: string;
    isFile: boolean;
    document?: UserDocument;
    children?: TreeItem[];
    defaultExpanded?: boolean;
}

const props = defineProps<{
    documents: UserDocument[];
    selectedDocuments: number[];
    deletingDocumentIds: number[];
    updatingDocumentIds: number[];
    hasWriterRole: boolean;
}>();

const emit = defineEmits<{
    "update:selected": [documentId: number, selected: boolean];
    delete: [documentId: number];
    update: [documentId: number];
}>();

// Document viewer state
const {
    fetchDocument,
    loading: isLoadingViewer,
    error: viewerError,
} = useDocumentViewer();

const {
    downloadDocument,
    loading: isDownloading,
    error: downloadError,
} = useDocumentDownload();

const isViewerOpen = ref<boolean>(false);
const documentFile = ref<Blob | undefined>(undefined);
const documentFileName = ref<string>("");
const viewerPage = ref<number | undefined>(undefined);

/**
 * Transform flat document list into hierarchical tree structure
 */
const treeItems = computed<TreeItem[]>(() => {
    if (!props.documents || props.documents.length === 0) {
        return [];
    }

    const tree: TreeItem[] = [];
    const nodeMap = new Map<string, TreeItem>();

    // Helper function to get or create a folder node
    function getOrCreateFolderNode(
        path: string,
        folderName: string,
        isRootLevel = false,
    ): TreeItem {
        const existing = nodeMap.get(path);
        if (existing) {
            return existing;
        }

        const folderItem: TreeItem = {
            label: folderName,
            value: path,
            icon: "i-heroicons-folder",
            isFile: false,
            children: [],
            defaultExpanded: isRootLevel,
        };
        nodeMap.set(path, folderItem);
        return folderItem;
    }

    // Process each document
    for (const document of props.documents) {
        const fullPath = document.document_path || document.file_name;
        let pathParts = fullPath.split("/").filter((part) => part.length > 0);

        // Remove "s3:" prefix if it's the first part of the path
        if (pathParts.length > 0 && pathParts[0] === "s3:") {
            pathParts = pathParts.slice(1);
        }

        if (pathParts.length === 0) {
            // Handle edge case where path is empty
            pathParts.push(document.file_name);
        }

        let currentLevel = tree;
        let currentPath = "";

        // Navigate/create folder structure
        for (let i = 0; i < pathParts.length - 1; i++) {
            const folderName = pathParts[i];
            if (!folderName) continue;

            currentPath = currentPath
                ? `${currentPath}/${folderName}`
                : folderName;

            // Check if folder already exists at current level
            let folderNode = currentLevel.find(
                (item) => !item.isFile && item.label === folderName,
            );

            if (!folderNode) {
                const isRootLevel = currentLevel === tree;
                folderNode = getOrCreateFolderNode(
                    currentPath,
                    folderName,
                    isRootLevel,
                );
                currentLevel.push(folderNode);
            }

            if (folderNode.children) {
                currentLevel = folderNode.children;
            }
        }

        // Add the file
        const fileName = pathParts[pathParts.length - 1] || document.file_name;
        const fileItem: TreeItem = {
            label: fileName,
            value: `file_${document.id}`,
            icon: getFileIcon(document.mime_type),
            isFile: true,
            document: document,
        };

        currentLevel.push(fileItem);
    }

    // Sort tree items: folders first, then files, both alphabetically
    function sortTreeItems(items: TreeItem[]): TreeItem[] {
        return items
            .sort((a, b) => {
                if (a.isFile !== b.isFile) {
                    return a.isFile ? 1 : -1; // Folders first
                }
                return a.label.localeCompare(b.label);
            })
            .map((item) => {
                if (item.children) {
                    item.children = sortTreeItems(item.children);
                }
                return item;
            });
    }

    return sortTreeItems(tree);
});

/**
 * Handle tree selection (for navigation purposes)
 */
function handleTreeSelection(item: TreeItem): void {
    if (item.isFile && item.document) {
        handleDocumentClick(item.document);
    }
}

/**
 * Handle document selection for bulk operations
 */
function handleDocumentSelection(documentId: number, selected: boolean): void {
    emit("update:selected", documentId, selected === true);
}

/**
 * Handle document click (view or download)
 */
async function handleDocumentClick(document: UserDocument): Promise<void> {
    if (isViewerOpen.value) return;

    try {
        if (isPdfFile(document)) {
            // For PDF files, fetch and show in viewer
            const result = await fetchDocument(document.id, document.file_name);
            if (result) {
                documentFile.value = result.blob;
                documentFileName.value = result.fileName;
                viewerPage.value = document.page;
                isViewerOpen.value = true;
            } else if (viewerError.value) {
                toast.add({
                    title: t("documents.failedToLoad"),
                    description: viewerError.value,
                    icon: "i-heroicons-exclamation-triangle",
                    color: "error",
                });
            }
        } else {
            // For other files, download directly
            await downloadDocument(document.id, document.file_name);

            if (!downloadError.value) {
                toast.add({
                    title: t("documents.downloadStarted"),
                    description: t("documents.downloadInitiated", {
                        fileName: document.file_name,
                    }),
                    icon: "i-heroicons-arrow-down-tray",
                    color: "success",
                });
            } else {
                toast.add({
                    title: t("documents.downloadFailed"),
                    description: downloadError.value,
                    icon: "i-heroicons-exclamation-triangle",
                    color: "error",
                });
            }
        }
    } catch (error) {
        console.error("Failed to handle document:", error);
        toast.add({
            title: t("documents.operationFailed"),
            description: t("documents.failedTo", {
                operation: isPdfFile(document)
                    ? t("documents.load")
                    : t("documents.download"),
                fileName: document.file_name,
            }),
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
    }
}

/**
 * Handle update click
 */
function handleUpdateClick(documentId: number): void {
    emit("update", documentId);
}

/**
 * Handle delete click
 */
function handleDeleteClick(documentId: number): void {
    emit("delete", documentId);
}

/**
 * Check if document is PDF
 */
function isPdfFile(document: UserDocument): boolean {
    return document.mime_type.toLowerCase().includes("pdf");
}

/**
 * Check if document is currently loading
 */
function isDocumentLoading(): boolean {
    return isLoadingViewer.value || isDownloading.value;
}

/**
 * Check if document is currently updating
 */
function isDocumentUpdating(documentId: number): boolean {
    return props.updatingDocumentIds.includes(documentId);
}

/**
 * Check if document is currently being deleted
 */
function isDocumentDeleting(documentId: number): boolean {
    return props.deletingDocumentIds.includes(documentId);
}

/**
 * Get file icon based on mime type
 */
function getFileIcon(mimeType: string): string {
    const type = mimeType.toLowerCase();
    if (type.includes("pdf")) return "i-heroicons-document-text";
    if (type.includes("image")) return "i-heroicons-photo";
    if (type.includes("video")) return "i-heroicons-film";
    if (type.includes("audio")) return "i-heroicons-musical-note";
    if (type.includes("text") || type.includes("doc"))
        return "i-heroicons-document-text";
    if (type.includes("spreadsheet") || type.includes("excel"))
        return "i-heroicons-table-cells";
    if (type.includes("presentation") || type.includes("powerpoint"))
        return "i-heroicons-presentation-chart-bar";

    return "i-heroicons-document";
}

/**
 * Get icon class for styling
 */
function getIconClass(item: TreeItem): string {
    if (item.isFile) {
        return "w-4 h-4 text-blue-600 dark:text-blue-400";
    }
    return "w-4 h-4 text-amber-600 dark:text-amber-400";
}

/**
 * Get text class for styling
 */
function getTextClass(item: TreeItem): string {
    if (item.isFile) {
        return "text-gray-900 dark:text-white";
    }
    return "font-medium text-gray-900 dark:text-white";
}

/**
 * Get badge color based on mime type
 */
function getBadgeColor(
    mimeType: string,
):
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral" {
    const type = mimeType.toLowerCase();

    if (type.includes("pdf")) return "error";
    if (type.includes("image")) return "success";
    if (type.includes("video")) return "secondary";
    if (type.includes("audio")) return "warning";
    if (type.includes("text") || type.includes("doc")) return "info";
    if (type.includes("spreadsheet") || type.includes("excel"))
        return "success";
    if (type.includes("presentation") || type.includes("powerpoint"))
        return "warning";

    return "neutral";
}

/**
 * Format mime type for display
 */
function formatMimeType(mimeType: string): string {
    const parts = mimeType.split("/");
    if (parts.length > 1 && parts[1]) {
        if (parts[1].includes("word")) return "DOCX";
        if (parts[1].includes("excel")) return "XLSX";
        if (parts[1].includes("powerpoint")) return "PPTX";
        return parts[1].toUpperCase();
    }
    return mimeType.toUpperCase();
}

/**
 * Get file count for folder badge
 */
function getFileCount(item: TreeItem): string {
    if (!item.children) return "0 files";

    function countFiles(items: TreeItem[]): number {
        let count = 0;
        for (const child of items) {
            if (child.isFile) {
                count++;
            } else if (child.children) {
                count += countFiles(child.children);
            }
        }
        return count;
    }

    const count = countFiles(item.children);
    return `${count} ${count === 1 ? "file" : "files"}`;
}
</script>
