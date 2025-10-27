<template>
    <UModal :open="isOpen" :title="t('documents.updateTitle')"
        :description="t('documents.updateDescription', { fileName: documentName })"
        @update:open="$emit('update:isOpen', $event)" :prevent-close="isLoading">

        <template #body>
            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- File Selection -->
                <UFileUpload v-model="selectedFile" ref="fileUploadRef" accept=".pdf,.docx,.pptx,.html"
                    :label="t('documents.selectNewFile')" :description="getUpdateFileDescription()"
                    :disabled="isLoading" icon="i-heroicons-arrow-up-tray" :multiple="false" />

                <!-- Access Role Selection -->
                <div>
                    <label class="block text-sm font-medium mb-2">
                        {{ t('documents.accessRole') }}
                    </label>
                    <USelect v-model="selectedAccessRole" :items="roleItems"
                        :placeholder="t('documents.selectAccessRole')" :disabled="isLoading" />
                    <p class="mt-1 text-xs text-gray-500">
                        {{ (roles.length || 0) > 0
                            ? t('documents.availableRoles')
                            : t('documents.noRoles') }}
                    </p>
                </div>
            </form>
        </template>

        <template #footer>
            <div class="flex justify-end gap-3">
                <UButton color="neutral" variant="outline" :disabled="isLoading" @click="handleCancel">
                    {{ t('common.cancel') }}
                </UButton>
                <UButton color="warning" :loading="isLoading" :disabled="!selectedFile || !selectedAccessRole"
                    icon="i-heroicons-arrow-up-tray" @click="handleSubmit">
                    {{ isLoading ? t('documents.updatingDoc') : t('documents.updateDocument') }}
                </UButton>
            </div>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
import { useDocumentForm } from "~/composables/documents/useDocumentForm";

interface Props {
    isOpen: boolean;
    documentId?: number;
    documentName?: string;
    currentAccessRole?: string;
    documentPath: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:isOpen": [value: boolean];
    updated: [documentId: number];
}>();

// Document update functionality
const {
    updateDocument,
    loading: isLoading,
    error: updateError,
} = useDocumentUpdate();

// Shared document form logic
const {
    selectedFile,
    selectedAccessRole,
    roles,
    resetForm,
} = useDocumentForm();

// File upload component ref
const fileUploadRef = ref();

const roleItems = computed(() => {
    const original = roles.value ?? [];
    const filtered = original.filter((role: string) => role !== "Writer");
    return filtered.length > 0 ? filtered : original;
});

/**
 * Get description for the file upload component
 */
function getUpdateFileDescription(): string {
    return `${t("documents.supportedFormats")}: PDF, DOCX, PPTX, HTML`;
}

const { t } = useI18n();
// Toast notifications
const toast = useToast();

// Watch for modal open/close to reset form
watch(
    () => props.isOpen,
    (newValue) => {
        if (newValue) {
            // Reset form when modal opens
            resetForm();
            selectedAccessRole.value = props.currentAccessRole || "";
            updateError.value = undefined;
        }
    },
);

// Watch for session data changes to ensure access role is set when available
watch(
    () => roles.value,
    (rolesList) => {
        // If session data loads and we have a current access role, make sure it's still valid
        if (
            rolesList &&
            props.currentAccessRole &&
            rolesList.includes(props.currentAccessRole)
        ) {
            selectedAccessRole.value = props.currentAccessRole;
        }
    },
    { immediate: true },
);

/**
 * Handle form submission
 */
async function handleSubmit(): Promise<void> {
    if (!selectedFile.value || !selectedAccessRole.value || !props.documentId) {
        return;
    }

    try {
        const success = await updateDocument(
            props.documentId,
            selectedFile.value,
            selectedAccessRole.value,
            props.documentPath,
        );

        if (success) {
            // Show success toast
            toast.add({
                title: t("documents.updateSuccessTitle"),
                description: t("documents.updateSuccessDescription", {
                    fileName: props.documentName,
                }),
                icon: "i-heroicons-check-circle",
                color: "success",
            });

            emit("updated", props.documentId);
            handleCancel();
        }
    } catch (error) {
        console.error("Failed to update document:", error);

        // Include server error message using i18n template
        const serverErrorMessage = updateError.value;
        const errorMessage = serverErrorMessage
            ? t("documents.updateFailedWithDetails", {
                details: serverErrorMessage,
            })
            : t("documents.updateFailedDescription");

        // Show error toast
        toast.add({
            title: t("documents.updateFailed"),
            description: errorMessage,
            icon: "i-heroicons-exclamation-triangle",
            color: "error",
        });
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