import type { DocumentsResponse } from "~/models/message";

interface UseDocumentsReturn {
    documents: Ref<DocumentsResponse | undefined>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
    fetchDocuments: () => Promise<void>;
    refreshDocuments: () => Promise<void>;
}

/**
 * Composable for managing user documents
 * Provides reactive state for documents, loading, and error states
 */
export const useDocuments = (): UseDocumentsReturn => {
    const documents = ref<DocumentsResponse | undefined>(undefined);
    const loading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);

    /**
     * Fetch documents from the API
     */
    async function fetchDocuments(): Promise<void> {
        loading.value = true;
        error.value = undefined;

        try {
            const response = await $fetch<DocumentsResponse>(
                "/api/backend/documents",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            documents.value = response;
        } catch (e: unknown) {
            console.error("Error fetching documents:", e);
            let errorMessage = "Failed to fetch documents.";

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
     * Refresh documents (alias for fetchDocuments for clarity)
     */
    async function refreshDocuments(): Promise<void> {
        await fetchDocuments();
    }

    return {
        documents,
        loading,
        error,
        fetchDocuments,
        refreshDocuments,
    };
};
