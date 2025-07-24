interface UseDocumentUpdateReturn {
    updateDocument: (
        documentId: number,
        file: File,
        accessRole: string,
        documentPath: string,
    ) => Promise<boolean>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
}

/**
 * Composable for updating documents
 * Handles file upload and access role updates
 */
export const useDocumentUpdate = (): UseDocumentUpdateReturn => {
    const loading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);

    /**
     * Update a document with new file and access role
     */
    async function updateDocument(
        documentId: number,
        file: File,
        accessRole: string,
        documentPath: string,
    ): Promise<boolean> {
        loading.value = true;
        error.value = undefined;

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("access_role", accessRole);
            formData.append("document_path", documentPath);

            await $fetch(`/api/documents/${documentId}`, {
                method: "PUT",
                body: formData,
            });

            return true;
        } catch (e: unknown) {
            const { handleApiError } = useApiError();
            error.value = handleApiError(e, "Failed to update document.");
            return false;
        } finally {
            loading.value = false;
        }
    }

    return {
        updateDocument,
        loading,
        error,
    };
};
