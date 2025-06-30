interface UseDocumentUploadReturn {
    uploadDocument: (file: File, accessRole: string) => Promise<boolean>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
}

/**
 * Composable for uploading new documents
 * Handles file upload with access role assignment
 */
export const useDocumentUpload = (): UseDocumentUploadReturn => {
    const loading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);

    /**
     * Upload a new document with file and access role
     */
    async function uploadDocument(
        file: File,
        accessRole: string,
    ): Promise<boolean> {
        loading.value = true;
        error.value = undefined;

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("access_role", accessRole);

            await $fetch("/api/backend/documents", {
                method: "POST",
                body: formData,
            });

            return true;
        } catch (e: unknown) {
            console.error("Error uploading document:", e);
            let errorMessage = "Failed to upload document.";

            // Handle validation errors from FastAPI
            if (e && typeof e === "object" && "data" in e) {
                const errorData = (
                    e as {
                        data?: {
                            detail?: Array<{ msg: string; loc: string[] }>;
                        };
                    }
                ).data;
                if (errorData?.detail && Array.isArray(errorData.detail)) {
                    // Format validation errors nicely
                    const validationErrors = errorData.detail
                        .map((err) => `${err.loc.join(".")}: ${err.msg}`)
                        .join("; ");
                    errorMessage = `Validation error: ${validationErrors}`;
                } else if (typeof errorData === "string") {
                    errorMessage = errorData;
                }
            } else if (e instanceof Error) {
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
            return false;
        } finally {
            loading.value = false;
        }
    }

    return {
        uploadDocument,
        loading,
        error,
    };
};
