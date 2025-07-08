interface UseDocumentDeletionReturn {
    deleteDocument: (documentId: number) => Promise<boolean>;
    deleteMultipleDocuments: (
        documentIds: number[],
    ) => Promise<{ success: number; failed: number }>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
}

/**
 * Composable for deleting documents
 * Handles both single and bulk deletion operations
 */
export const useDocumentDeletion = (): UseDocumentDeletionReturn => {
    const loading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);

    /**
     * Delete a single document
     */
    async function deleteDocument(documentId: number): Promise<boolean> {
        loading.value = true;
        error.value = undefined;

        try {
            await $fetch(`/api/documents/${documentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            return true;
        } catch (e: unknown) {
            const { extractErrorMessage } = useErrorExtractor();
            error.value = extractErrorMessage(e, "Failed to delete document.");
            return false;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Delete multiple documents
     */
    async function deleteMultipleDocuments(
        documentIds: number[],
    ): Promise<{ success: number; failed: number }> {
        loading.value = true;
        error.value = undefined;

        let successCount = 0;
        let failedCount = 0;

        try {
            // Process deletions in parallel for better performance
            const deletePromises = documentIds.map(async (id) => {
                try {
                    await $fetch(`/api/documents/${id}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    return { id, success: true };
                } catch {
                    return { id, success: false };
                }
            });

            const results = await Promise.all(deletePromises);

            // Count successes and failures
            for (const result of results) {
                if (result.success) {
                    successCount++;
                } else {
                    failedCount++;
                }
            }

            // Set error message if some deletions failed
            if (failedCount > 0) {
                error.value = `${failedCount} document${failedCount > 1 ? "s" : ""} failed to delete.`;
            }

            return { success: successCount, failed: failedCount };
        } catch {
            error.value = "Failed to delete documents.";
            return { success: 0, failed: documentIds.length };
        } finally {
            loading.value = false;
        }
    }

    return {
        deleteDocument,
        deleteMultipleDocuments,
        loading,
        error,
    };
};
