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
            console.error("Error fetching document:", e);
            let errorMessage = "Failed to fetch document.";

            if (e instanceof Error) {
                errorMessage = e.message;
            } else if (typeof e === "string") {
                errorMessage = e;
            } else if (
                typeof e === "object" &&
                e !== null &&
                "message" in e &&
                typeof (e as { message: unknown }).message === "string"
            ) {
                errorMessage = (e as { message: string }).message;
            }

            error.value = errorMessage;
            return undefined;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Sanitize filename to remove invalid characters
     */
    function sanitizeFilename(filename: string): string {
        // Remove or replace invalid characters for filenames
        // Keep alphanumeric, dots, hyphens, underscores, and spaces
        let sanitized = filename
            .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid chars with underscore
            .replace(/\s+/g, " ") // Replace multiple spaces with single space
            .trim() // Remove leading/trailing whitespace
            .substring(0, 255); // Limit length to 255 characters

        // Remove control characters (0-31)
        for (let i = 0; i < 32; i++) {
            sanitized = sanitized.replace(
                new RegExp(String.fromCharCode(i), "g"),
                "_",
            );
        }

        return sanitized || `document_${Date.now()}`; // Fallback if filename becomes empty
    }

    return {
        fetchDocument,
        loading,
        error,
    };
};
