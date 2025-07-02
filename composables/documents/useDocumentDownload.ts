interface UseDocumentDownloadReturn {
    downloadDocument: (documentId: number, fileName?: string) => Promise<void>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
}

/**
 * Composable for downloading and viewing documents
 * Handles fetching document binary data and opening in popup
 */
export const useDocumentDownload = (): UseDocumentDownloadReturn => {
    const loading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);

    /**
     * Download and open document in popup window
     */
    async function downloadDocument(
        documentId: number,
        fileName?: string,
    ): Promise<void> {
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

            // Create blob URL for the document
            const blob = response._data as unknown as Blob;
            let blobUrl: string;

            blobUrl = URL.createObjectURL(blob);

            const finalFileName = fileName ?? `document_${documentId}`;

            // Determine if we should open in popup or download based on file type
            const mimeType = blob.type;
            const shouldOpenInPopup =
                mimeType.includes("pdf") ||
                mimeType.includes("image") ||
                mimeType.includes("text");

            if (shouldOpenInPopup) {
                // Open in new window/tab for viewable content
                try {
                    const newWindow = window.open(
                        blobUrl,
                        "_blank",
                        "width=800,height=600,scrollbars=yes,resizable=yes",
                    );

                    if (!newWindow) {
                        // Fallback to download if popup blocked
                        downloadBlob(blob, finalFileName);
                        URL.revokeObjectURL(blobUrl);
                    } else {
                        // Clean up blob URL after window loads
                        newWindow.onload = () => {
                            setTimeout(
                                () => URL.revokeObjectURL(blobUrl),
                                1000,
                            );
                        };
                    }
                } catch (e) {
                    console.warn(
                        "Failed to open popup, falling back to download:",
                        e,
                    );
                    downloadBlob(blob, finalFileName);
                    URL.revokeObjectURL(blobUrl);
                }
            } else {
                // Download file for non-viewable content
                downloadBlob(blob, finalFileName);
                URL.revokeObjectURL(blobUrl);
            }
        } catch (e: unknown) {
            console.error("Error downloading document:", e);
            let errorMessage = "Failed to download document.";

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
        } finally {
            loading.value = false;
        }
    }

    /**
     * Helper function to trigger file download
     */
    function downloadBlob(blob: Blob, fileName: string): void {
        try {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = sanitizeFilename(fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to download file:", e);
            throw new Error("Failed to download document");
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
        downloadDocument,
        loading,
        error,
    };
};
