interface UseDocumentViewerReturn {
    fetchDocument: (
        documentId: number,
        fileName?: string,
    ) => Promise<{ blob: Blob; fileName: string } | undefined>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
}

/**
 * Composable for fetching documents for viewing
 * Handles fetching document binary data for display in viewers
 */
export const useDocumentViewer = (): UseDocumentViewerReturn => {
    const loading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);

    /**
     * Fetch document data for viewing
     */
    async function fetchDocument(
        documentId: number,
        fileName?: string,
    ): Promise<{ blob: Blob; fileName: string } | undefined> {
        loading.value = true;
        error.value = undefined;

        try {
            // Fetch document as blob
            const response = await $fetch.raw(
                `/api/backend/documents/${documentId}`,
                {
                    method: "GET",
                    responseType: "blob",
                },
            );

            if (!response._data) {
                throw new Error("No document data received");
            }

            // Create blob from response
            const blob = response._data as unknown as Blob;

            const finalFileName = fileName ?? `document_${documentId}`;

            return {
                blob,
                fileName: finalFileName,
            };
        } catch (e: unknown) {
            const { extractErrorMessage } = useErrorExtractor();
            error.value = extractErrorMessage(e, "Failed to fetch document.");
            return;
        } finally {
            loading.value = false;
        }
    }

    return {
        fetchDocument,
        loading,
        error,
    };
};
