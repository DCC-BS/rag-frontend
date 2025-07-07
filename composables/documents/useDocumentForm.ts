import type { ComputedRef } from "vue";
import { computed, ref } from "vue";

/**
 * Composable for managing document form state and logic.
 * Encapsulates shared functionality between document upload and update modals.
 *
 * @returns An object with reactive state and methods for the document form.
 */
export function useDocumentForm() {
    // Use authentication session data
    const { data: session, refresh } = useAuth();

    // File size configuration (in bytes)
    const maxFileSize = ref(50 * 1024 * 1024); // 50MB default

    // Form state
    const selectedFile = ref<File | undefined>(undefined);
    const selectedAccessRole = ref<string>("");
    const fileInputRef = ref<{ input: HTMLInputElement } | null>(null);

    // Toast notifications
    const toast = useToast();
    const { t } = useI18n();

    // Computed property for organizations from session data
    const organizations: ComputedRef<string[]> = computed(
        () => session.value?.user?.organizations ?? [],
    );

    /**
     * Format file size limit for display
     */
    const formatMaxFileSize = computed(() => {
        return formatFileSize(maxFileSize.value);
    });

    /**
     * Handles the file input change event with file size validation.
     * @param {Event} event - The input change event.
     */
    function handleFileChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
            // Validate file size
            if (file.size > maxFileSize.value) {
                toast.add({
                    title: t("documents.fileSizeError"),
                    description: t("documents.fileSizeErrorDescription", {
                        maxSize: formatMaxFileSize.value,
                        fileSize: formatFileSize(file.size),
                    }),
                    icon: "i-heroicons-exclamation-triangle",
                    color: "error",
                });

                // Clear the file input
                if (fileInputRef.value?.input) {
                    fileInputRef.value.input.value = "";
                }
                selectedFile.value = undefined;
                return;
            }

            selectedFile.value = file;
        }
    }

    /**
     * Formats a file size in bytes into a human-readable string.
     * @param {number} bytes - The file size in bytes.
     * @returns {string} The formatted file size.
     */
    function formatFileSize(bytes: number): string {
        if (bytes === 0) {
            return "0 Bytes";
        }
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
    }

    /**
     * Resets the form to its initial state.
     */
    function resetForm(): void {
        selectedFile.value = undefined;
        selectedAccessRole.value = "";
        if (fileInputRef.value?.input) {
            fileInputRef.value.input.value = "";
        }
    }

    return {
        session,
        selectedFile,
        selectedAccessRole,
        fileInputRef,
        organizations,
        maxFileSize,
        formatMaxFileSize,
        refreshSession: refresh,
        handleFileChange,
        formatFileSize,
        resetForm,
    };
}
