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
            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- File Selection -->
                <div>
                    <label for="file-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t('documents.selectFile') }}
                    </label>
                    <UInput id="file-input" ref="fileInputRef" type="file" @change="handleFileChange" accept=".pdf,.zip"
                        :disabled="isLoading" class="w-full" />
                    <p v-if="selectedFile" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {{ t('documents.file') }}: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                        <span v-if="isZipFile"
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ml-2">
                            ZIP Archive
                        </span>
                    </p>
                    <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ t('documents.chooseFile') }} ({{ t('documents.maxFileSize', { size: formatMaxFileSize }) }})
                        <span class="block mt-1">
                            {{ t('documents.supportedFormats') }}: PDF, ZIP
                        </span>
                    </p>
                </div>

                <!-- Access Role Selection -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t('documents.accessRole') }}
                    </label>
                    <USelect v-model="selectedAccessRole" :items="organizations"
                        :placeholder="t('documents.selectAccessRole')" :disabled="isLoading" />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ (organizations.length || 0) > 0
                            ? t('documents.availableOrganizations')
                            : t('documents.noOrganizations') }}
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
                    {{ t('documents.cancel') }}
                </UButton>
                <UButton color="primary" :loading="isLoading" :disabled="!selectedFile || !selectedAccessRole"
                    icon="i-heroicons-arrow-up-tray" @click="handleSubmit">
                    {{ getUploadButtonText() }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
import { useDocumentForm } from "~/composables/documents/useDocumentForm";

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

// Shared document form logic
const {
    session,
    selectedFile,
    selectedAccessRole,
    fileInputRef,
    organizations,
    formatMaxFileSize,
    refreshSession,
    handleFileChange,
    formatFileSize,
    resetForm,
} = useDocumentForm();

const { t } = useI18n();
// Toast notifications
const toast = useToast();

// Check if selected file is a zip file
const isZipFile = computed(() => {
    return (
        selectedFile.value?.name.toLowerCase().endsWith(".zip") ||
        selectedFile.value?.type === "application/zip" ||
        selectedFile.value?.type === "application/x-zip-compressed"
    );
});

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
    return isZipFile.value
        ? `${t("documents.uploadDocument")} (ZIP)`
        : t("documents.uploadDocument");
}

/**
 * Handle form submission
 */
async function handleSubmit(): Promise<void> {
    if (!selectedFile.value || !selectedAccessRole.value) {
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
        const result = await uploadFiles(
            selectedFile.value,
            selectedAccessRole.value,
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
                } else {
                    toast.add({
                        title: t("documents.uploadSuccessTitle"),
                        description: t("documents.uploadSuccessDescription", {
                            fileName: selectedFile.value.name,
                        }),
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

            // For ZIP files, add list of failed files
            if (
                isZipFile.value &&
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
                title: isZipFile.value
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