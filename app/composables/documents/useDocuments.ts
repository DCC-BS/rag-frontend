import type { DocumentsResponse } from "~/models/document";

interface UseDocumentsReturn {
    documents: Ref<DocumentsResponse | undefined>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
    fetchDocuments: (query?: string, limit?: number) => Promise<void>;
    refreshDocuments: () => Promise<void>;
    searchDocuments: (query: string, limit?: number) => Promise<void>;
}

/**
 * Composable for managing user documents
 * Provides reactive state for documents, loading, and error states
 * Supports search functionality with query and limit parameters
 */
export const useDocuments = (): UseDocumentsReturn => {
    const documents = ref<DocumentsResponse | undefined>(undefined);
    const loading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);

    /**
     * Fetch documents from the API with optional search parameters
     * @param query - Search query string
     * @param limit - Maximum number of documents to return (max 20)
     */
    async function fetchDocuments(
        query?: string,
        limit?: number,
    ): Promise<void> {
        loading.value = true;
        error.value = undefined;

        try {
            // Build query parameters
            const searchParams = new URLSearchParams();
            if (query?.trim()) {
                searchParams.append("query", query.trim());
            }
            if (limit && limit > 0) {
                // Ensure limit doesn't exceed 20
                searchParams.append("limit", Math.min(limit, 20).toString());
            }

            const queryString = searchParams.toString();
            const url = queryString
                ? `api/documents?${queryString}`
                : "api/documents";

            const response = await $fetch<DocumentsResponse>(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            documents.value = response;
        } catch (e: unknown) {
            const { handleApiError } = useApiError();
            error.value = handleApiError(e, "Failed to fetch documents.");
        } finally {
            loading.value = false;
        }
    }

    /**
     * Search documents with specific query and limit
     * @param query - Search query string
     * @param limit - Maximum number of documents to return (max 20)
     */
    async function searchDocuments(
        query: string,
        limit?: number,
    ): Promise<void> {
        await fetchDocuments(query, limit);
    }

    /**
     * Refresh documents (fetch all without search parameters)
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
        searchDocuments,
    };
};
