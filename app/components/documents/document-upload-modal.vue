<template>
    <UModal :open="isOpen" @update:open="$emit('update:isOpen', $event)" :prevent-close="isLoading">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                    <UIcon name="i-heroicons-arrow-up-tray" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ t('documents.uploadTitle') }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ t('documents.uploadDescription') }}
                    </p>
                </div>
            </div>
        </template>

        <template #body>
            <UAlert :description="t('documents.uploadDurationAlert')" color="warning" variant="subtle"
                icon="i-heroicons-exclamation-triangle" />
            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- File Selection -->
                <div>
                    <label for="file-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t('documents.selectFile') }}
                    </label>
                    <UInput id="file-input" ref="fileInputRef" type="file" @change="handleFileChange"
                        accept=".pdf,.zip,.docx,.pptx,.html" multiple :disabled="isLoading" class="w-full" />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ getFileUploadDescription() }}
                    </p>

                    <!-- Additional file info for selected files -->
                    <div v-if="selectedFiles.length > 0" class="mt-3 space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="font-medium text-gray-700 dark:text-gray-300">
                                {{ t('documents.selectedFiles') }}: {{ selectedFiles.length }}
                                <span v-if="isZipFile && selectedFiles.length === 1"
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ml-2">
                                    ZIP Archive
                                </span>
                            </span>
                            <span class="text-gray-500 dark:text-gray-400">
                                {{ formatTotalFileSize() }}
                            </span>
                        </div>

                        <!-- File list -->
                        <div class="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <div v-for="(file, index) in selectedFiles" :key="index"
                                class="flex items-center justify-between text-xs">
                                <span class="truncate flex-1 pr-2">{{ file.name }}</span>
                                <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {{ formatFileSize(file.size) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Folder Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t('documents.selectFolder') }}
                    </label>
                    <USelect v-model="selectedFolder" :items="folderItems"
                        :placeholder="t('documents.selectFolderPlaceholder')" :disabled="isLoading" />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ t('documents.folderSelectionHint') }}
                    </p>
                </div>

                <!-- Access Role Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t('documents.accessRole') }}
                    </label>
                    <USelect v-model="selectedAccessRole" :items="roleItems"
                        :placeholder="t('documents.selectAccessRole')" :disabled="isLoading" />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ (roleItems.length || 0) > 0
                            ? t('documents.availableRoles')
                            : t('documents.noRoles') }}
                    </p>
                </div>

                <!-- Progress Indicator -->
                <div v-if="isLoading && progress.total > 0" class="space-y-3">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700 dark:text-gray-300">
                            {{ getProgressText() }}
                        </span>
                        <span class="text-gray-500 dark:text-gray-400">
                            {{ progress.current }} / {{ progress.total }} files
                        </span>
                    </div>
                    <UProgress :value="progress.percentage" :max="100" status color="primary" size="md" />
                </div>
            </form>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="outline" :disabled="isLoading" @click="handleCancel">
                    {{ t('common.cancel') }}
                </UButton>
                <UButton color="primary" :loading="isLoading" :disabled="!hasValidFiles || !selectedAccessRole"
                    icon="i-heroicons-arrow-up-tray" @click="handleSubmit">
                    {{ getUploadButtonText() }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
import { useDocumentForm } from "~/composables/documents/useDocumentForm";
import { ERROR_LIMITS, FILE_LIMITS, FILE_TYPES } from "~/utils/constants";

interface Props {
    isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:isOpen": [value: boolean];
    uploaded: [];
}>();

// Document upload functionality
const {
    uploadFiles,
    loading: isLoading,
    error: uploadError,
    progress,
} = useDocumentUpload();

// Shared document form logic (we'll use some parts but override file handling)
const {
    session,
    selectedAccessRole,
    fileInputRef,
    roles,
    formatMaxFileSize,
    refreshSession,
    formatFileSize,
} = useDocumentForm();

const { t } = useI18n();
// Toast notifications
const toast = useToast();

// Multiple file selection state
const selectedFiles = ref<File[]>([]);

const maxFiles = FILE_LIMITS.MAX_FILES;
const maxFileSize = FILE_LIMITS.MAX_FILE_SIZE;

// Folder selection state
const selectedFolder = ref<string>("");

// Get available documents for folder extraction
const { documents: existingDocuments, refreshDocuments } = useDocuments();

// Extract folder items from existing documents (primitive string values for USelect)
const folderItems = computed(() => {
    const folders = new Set<string>();

    // Add root folder option
    folders.add("");

    if (
        existingDocuments.value?.documents &&
        existingDocuments.value.documents.length > 0
    ) {
        for (const document of existingDocuments.value.documents) {
            const fullPath = document.document_path || document.file_name;
            let pathParts = fullPath
                .split("/")
                .filter((part) => part.length > 0);

            // Remove "s3:" prefix if it's the first part of the path
            if (pathParts.length > 0 && pathParts[0] === "s3:") {
                pathParts = pathParts.slice(1);
            }

            // Extract folder paths (exclude the filename)
            if (pathParts.length > 1) {
                for (let i = 1; i <= pathParts.length - 1; i++) {
                    const folderPath = pathParts.slice(0, i).join("/");
                    if (folderPath) {
                        folders.add(folderPath);
                    }
                }
            }
        }
    }

    // Convert to sorted array of options
    const sortedFolders = Array.from(folders).sort((a, b) => {
        if (a === "") return -1; // Root folder first
        if (b === "") return 1;
        return a.localeCompare(b);
    });

    return sortedFolders.map((folder) => (folder === "" ? "/" : folder));
});

// Build role items for the select component from session roles (primitive string values)
const roleItems = computed(() => {
    const original = roles.value ?? [];
    const filtered = original.filter((role: string) => role !== "Writer");
    return filtered.length > 0 ? filtered : original;
});

// Check if any selected file is a zip file
const isZipFile = computed(() => {
    return (
        selectedFiles.value.length === 1 &&
        (selectedFiles.value[0]?.name.toLowerCase().endsWith(".zip") ||
            selectedFiles.value[0]?.type === "application/zip" ||
            selectedFiles.value[0]?.type === "application/x-zip-compressed")
    );
});

// Check if we have valid files selected
const hasValidFiles = computed(() => {
    return selectedFiles.value.length > 0;
});

/**
 * Handle file input change event
 */
function handleFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    const validFiles = validateSelectedFiles(files);
    selectedFiles.value = validFiles;
}

/**
 * Get the description text for the file upload component
 */
function getFileUploadDescription(): string {
    const maxSizeText = t("documents.maxFileSize", {
        size: formatMaxFileSize.value,
    });
    const supportedFormats = `${t("documents.supportedFormats")}: PDF, DOCX, PPTX, HTML, ZIP`;
    const multipleHint = t("documents.multipleFileHint");

    return `${t("documents.chooseMultipleFiles")} (${maxSizeText}). ${supportedFormats}. ${multipleHint}`;
}

/**
 * Validate files when they are selected through the FileUpload component
 */
function validateSelectedFiles(files: File[]): File[] {
    if (files.length === 0) {
        return [];
    }

    // Validate file count
    if (files.length > maxFiles) {
        toast.add({
            title: t("documents.tooManyFilesError"),
            description: t("documents.tooManyFilesErrorDescription", {
                maxFiles,
            }),
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
        return [];
    }

    // Validate individual file sizes and types
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
        // Check file size
        if (file.size > maxFileSize) {
            errors.push(
                t("documents.fileSizeErrorForFile", {
                    fileName: file.name,
                    maxSize: formatFileSize(maxFileSize),
                }),
            );
            continue;
        }

        // Check file type
        const allowedExtensions = FILE_TYPES.ALLOWED_EXTENSIONS;
        const fileExtension = `.${file.name.toLowerCase().split(".").pop()}`;
        if (!allowedExtensions.some((ext) => ext === fileExtension)) {
            errors.push(
                t("documents.invalidFileTypeError", { fileName: file.name }),
            );
            continue;
        }

        validFiles.push(file);
    }

    // Show errors if any
    if (errors.length > 0) {
        toast.add({
            title: t("documents.fileValidationError"),
            description:
                errors
                    .slice(0, ERROR_LIMITS.MAX_VALIDATION_ERRORS_DISPLAYED)
                    .join("\n") +
                (errors.length > ERROR_LIMITS.MAX_VALIDATION_ERRORS_DISPLAYED
                    ? "\n..."
                    : ""),
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
    }

    return validFiles;
}

/**
 * Clear file selection
 */
function clearFileSelection(): void {
    selectedFiles.value = [];
}

/**
 * Format total size of all selected files
 */
function formatTotalFileSize(): string {
    const totalSize = selectedFiles.value.reduce(
        (sum, file) => sum + file.size,
        0,
    );
    return formatFileSize(totalSize);
}

/**
 * Reset form state
 */
function resetForm(): void {
    clearFileSelection();
    selectedAccessRole.value = "";
    selectedFolder.value = "";
}

// Watch for file selection changes to validate files
watch(
    selectedFiles,
    (newFiles: File[], oldFiles: File[]) => {
        // Only validate if files were actually changed (not just cleared)
        if (newFiles.length > 0 && newFiles !== oldFiles) {
            const validFiles = validateSelectedFiles(newFiles);

            // If validation failed, clear the selection
            if (validFiles.length !== newFiles.length) {
                // Use nextTick to avoid infinite loop
                nextTick(() => {
                    selectedFiles.value = validFiles;
                });
            }
        }
    },
    { deep: true },
);

// Watch for modal open/close to reset form and ensure authentication
watch(
    () => props.isOpen,
    async (newValue) => {
        if (newValue) {
            resetForm();
            uploadError.value = undefined;
            // Reset progress
            progress.value = {
                current: 0,
                total: 0,
                percentage: 0,
                status: "idle",
            };

            // Ensure data sources are populated for selects
            try {
                await Promise.all([refreshDocuments(), refreshSession()]);
            } catch {
                toast.add({
                    title: t("errors.generic"),
                    description: t("documents.refreshErrorDescription"),
                    color: "warning",
                });
            }
        }
    },
);

/**
 * Get localized progress text based on current status
 */
function getProgressText(): string {
    switch (progress.value.status) {
        case "extracting":
            return t("documents.progressExtracting");
        case "preparing":
            return t("documents.progressPreparing");
        case "uploading":
            return t("documents.progressUploading");
        case "completed":
            return t("documents.progressCompleted");
        default:
            if (progress.value.status.startsWith("uploading batch")) {
                const parts = progress.value.status.split(" ");
                const current = parts[2];
                const total = parts[4];
                return t("documents.progressBatch", { current, total });
            }
            return t("documents.progressUploading");
    }
}

/**
 * Get dynamic upload button text
 */
function getUploadButtonText(): string {
    if (isLoading.value) {
        return t("documents.uploading");
    }

    if (selectedFiles.value.length === 0) {
        return t("documents.uploadDocument");
    }

    if (isZipFile.value) {
        return `${t("documents.uploadDocument")} (ZIP)`;
    }

    if (selectedFiles.value.length === 1) {
        return t("documents.uploadDocument");
    }

    return t("documents.uploadMultipleFiles", {
        count: selectedFiles.value.length,
    });
}

/**
 * Handle form submission
 */
async function handleSubmit(): Promise<void> {
    if (selectedFiles.value.length === 0 || !selectedAccessRole.value) {
        toast.add({
            title: t("documents.validationError"),
            description: t("documents.validationErrorDescription"),
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
        return;
    }

    // Ensure session is still available before upload
    if (!session.value?.user) {
        try {
            await refreshSession();
        } catch (error) {
            console.error("Failed to refresh session for upload:", error);
            // Include server error message for auth errors too
            const serverErrorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown authentication error";
            toast.add({
                title: t("documents.authError"),
                description: `${t("documents.authErrorDescription")}: ${serverErrorMessage}`,
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
            return;
        }
    }

    try {
        // For single ZIP file, pass the file directly
        // For multiple files, pass the array
        const filesToUpload = isZipFile.value
            ? selectedFiles.value[0]
            : selectedFiles.value;

        if (!filesToUpload) {
            throw new Error("No files selected for upload");
        }

        const folderPathToSend =
            selectedFolder.value === "/" ? "" : selectedFolder.value || "";
        const result = await uploadFiles(
            filesToUpload,
            selectedAccessRole.value,
            folderPathToSend,
        );

        if (result.success > 0) {
            // Determine which toast to show based on results
            if (result.failed === 0) {
                // All files uploaded successfully
                if (isZipFile.value) {
                    toast.add({
                        title: t("documents.batchUploadSuccessTitle"),
                        description: t(
                            "documents.batchUploadSuccessDescription",
                            {
                                successCount: result.success,
                                totalCount: result.totalFiles,
                            },
                        ),
                        icon: "i-heroicons-check-circle",
                        color: "success",
                    });
                } else if (selectedFiles.value.length === 1) {
                    toast.add({
                        title: t("documents.uploadSuccessTitle"),
                        description: t("documents.uploadSuccessDescription", {
                            fileName:
                                selectedFiles.value[0]?.name || "Unknown file",
                        }),
                        icon: "i-heroicons-check-circle",
                        color: "success",
                    });
                } else {
                    toast.add({
                        title: t("documents.multipleUploadSuccessTitle"),
                        description: t(
                            "documents.multipleUploadSuccessDescription",
                            {
                                count: result.success,
                            },
                        ),
                        icon: "i-heroicons-check-circle",
                        color: "success",
                    });
                }
            } else {
                // Partial success with failed files list
                let description = t(
                    "documents.batchUploadPartialSuccessDescription",
                    {
                        successCount: result.success,
                        failedCount: result.failed,
                    },
                );

                if (result.failedFiles && result.failedFiles.length > 0) {
                    const failedFilesList = result.failedFiles
                        .slice(0, 5)
                        .join(", ");
                    const moreCount = result.failedFiles.length - 5;
                    let filesString = failedFilesList;
                    if (moreCount > 0) {
                        filesString += ` ${t("documents.andMore", { count: moreCount })}`;
                    }
                    description += `\n\n${t("documents.failedFilesList")}:\n${filesString}`;
                }

                toast.add({
                    title: t("documents.batchUploadPartialSuccessTitle"),
                    description,
                    icon: "i-heroicons-exclamation-triangle",
                    color: "warning",
                });
            }

            // Emit uploaded event and close modal
            emit("uploaded");
            handleCancel();
        } else {
            // All files failed
            const serverErrorMessage = uploadError.value;
            let description = serverErrorMessage
                ? t("documents.uploadErrorWithDetails", {
                    details: serverErrorMessage,
                })
                : t("documents.uploadErrorDescription");

            // For multiple files, add list of failed files
            if (
                selectedFiles.value.length > 1 &&
                result.failedFiles &&
                result.failedFiles.length > 0
            ) {
                const failedFilesList = result.failedFiles
                    .slice(0, 5)
                    .join(", ");
                const moreCount = result.failedFiles.length - 5;
                let filesString = failedFilesList;
                if (moreCount > 0) {
                    filesString += ` ${t("documents.andMore", { count: moreCount })}`;
                }
                description += `\n\n${t("documents.failedFilesList")}:\n${filesString}`;
            }

            toast.add({
                title:
                    isZipFile.value || selectedFiles.value.length > 1
                        ? t("documents.batchUploadFailedTitle")
                        : t("documents.uploadFailed"),
                description,
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
        }
    } catch (error) {
        console.error("Upload submission error:", error);

        // Check if it's a ZIP extraction error
        if (error instanceof Error && error.message.includes("ZIP")) {
            toast.add({
                title: t("documents.zipExtractionError"),
                description: `${t("documents.zipExtractionErrorDescription")}: ${error.message}`,
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
        } else {
            // Include server error message without translation
            const serverErrorMessage =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred during upload.";
            toast.add({
                title: t("documents.uploadErrorUnexpected"),
                description: serverErrorMessage,
                icon: "i-heroicons-exclamation-triangle",
                color: "error",
            });
        }
    }
}

/**
 * Handle cancel/close
 */
function handleCancel(): void {
    emit("update:isOpen", false);
}
</script>

<style></style>