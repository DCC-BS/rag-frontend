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
                    <UInput id="file-input" ref="fileInputRef" type="file" @change="handleFileChange"
                        :disabled="isLoading" class="w-full" />
                    <p v-if="selectedFile" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {{ t('documents.file') }}: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
                    </p>
                    <p v-else class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ t('documents.chooseFile') }}
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
            </form>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="outline" :disabled="isLoading" @click="handleCancel">
                    {{ t('documents.cancel') }}
                </UButton>
                <UButton color="primary" :loading="isLoading" :disabled="!selectedFile || !selectedAccessRole"
                    icon="i-heroicons-arrow-up-tray" @click="handleSubmit">
                    {{ isLoading ? t('documents.uploading') : t('documents.uploadDocument') }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
import { useDocumentForm } from '~/composables/documents/useDocumentForm';

interface Props {
    isOpen: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:isOpen': [value: boolean];
    'uploaded': [];
}>();

// Document upload functionality
const { uploadDocument, loading: isLoading, error: uploadError } = useDocumentUpload();

const items = ref(['Backlog', 'Todo', 'In Progress', 'Done'])
const value = ref('Backlog')

// Shared document form logic
const {
    user,
    selectedFile,
    selectedAccessRole,
    fileInputRef,
    organizations,
    fetchUser,
    refreshUser,
    handleFileChange,
    formatFileSize,
    resetForm
} = useDocumentForm();

// Authentication and token refresh
const { handleTokenRefresh } = useTokenRefresh();
const { t } = useI18n();
// Toast notifications
const toast = useToast();

// Ensure user data is available
if (!user.value) {
    fetchUser();
}

// Watch for modal open/close to reset form and ensure authentication
watch(() => props.isOpen, async (newValue) => {
    if (newValue) {
        resetForm();
        uploadError.value = undefined;
    }
});

/**
 * Handle form submission
 */
async function handleSubmit(): Promise<void> {
    if (!selectedFile.value || !selectedAccessRole.value) {
        toast.add({
            title: t('documents.validationError'),
            description: t('documents.validationErrorDescription'),
            icon: 'i-heroicons-exclamation-triangle',
            color: 'error',
        });
        return;
    }

    // Ensure user data is still available before upload
    if (!user.value) {
        try {
            await handleTokenRefresh();
            await refreshUser();
        } catch (error) {
            console.error('Failed to refresh user data for upload:', error);
            toast.add({
                title: t('documents.authError'),
                description: t('documents.authErrorDescription'),
                icon: 'i-heroicons-exclamation-triangle',
                color: 'error',
            });
            return;
        }
    }

    try {
        const success = await uploadDocument(selectedFile.value, selectedAccessRole.value);

        if (success) {
            // Success toast
            toast.add({
                title: t('documents.uploadSuccessTitle'),
                description: t('documents.uploadSuccessDescription', { fileName: selectedFile.value.name }),
                icon: 'i-heroicons-check-circle',
                color: 'success',
            });

            // Emit uploaded event and close modal
            emit('uploaded');
            handleCancel();
        } else if (uploadError.value) {
            // Error toast only if no specific error alert is shown
            toast.add({
                title: t('documents.uploadFailed'),
                description: uploadError.value || t('documents.uploadErrorDescription'),
                icon: 'i-heroicons-exclamation-triangle',
                color: 'error',
            });
        }
    } catch (error) {
        console.error('Upload submission error:', error);
        toast.add({
            title: t('documents.uploadErrorUnexpected'),
            description: 'An unexpected error occurred during upload.',
            icon: 'i-heroicons-exclamation-triangle',
            color: 'error',
        });
    }
}

/**
 * Handle cancel/close
 */
function handleCancel(): void {
    emit('update:isOpen', false);
}
</script>

<style></style>