import { ref, computed } from "vue";
import type { Ref, ComputedRef } from "vue";
import type { User } from "~/models/user";

/**
 * Composable for managing document form state and logic.
 * Encapsulates shared functionality between document upload and update modals.
 *
 * @returns An object with reactive state and methods for the document form.
 */
export function useDocumentForm() {
    // User data from global state
    const { user, fetchUser, refreshUser } = useUser();

    // Form state
    const selectedFile = ref<File | undefined>(undefined);
    const selectedAccessRole = ref<string>("");
    const fileInputRef = ref<{ input: HTMLInputElement } | null>(null);

    // Computed property for organizations to ensure reactivity
    const organizations: ComputedRef<string[]> = computed(
        () => user.value?.organizations ?? [],
    );

    /**
     * Handles the file input change event.
     * @param {Event} event - The input change event.
     */
    function handleFileChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            selectedFile.value = file;
        }
    }

    /**
     * Formats a file size in bytes into a human-readable string.
     * @param {number} bytes - The file size in bytes.
     * @returns {string} The formatted file size.
     */
    function formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
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
        user,
        selectedFile,
        selectedAccessRole,
        fileInputRef,
        organizations,
        fetchUser,
        refreshUser,
        handleFileChange,
        formatFileSize,
        resetForm,
    };
}
