import type { UserDocument } from "~/models/message";

export interface UseDocumentSelectionReturn {
    selectedDocuments: Ref<UserDocument[]>;
    selectedDocumentIds: ComputedRef<number[]>;
    maxSelectionReached: ComputedRef<boolean>;
    selectDocument: (document: UserDocument) => boolean;
    deselectDocument: (documentId: number) => void;
    clearSelection: () => void;
    isDocumentSelected: (documentId: number) => boolean;
    canSelectMore: ComputedRef<boolean>;
}

/**
 * Composable for managing document selection for chat
 * Allows selection of up to 5 documents for targeted chat conversations
 */
export const useDocumentSelection = (): UseDocumentSelectionReturn => {
    const MAX_SELECTION = 5;

    // Store selected documents with full data for UI display
    const selectedDocuments = ref<UserDocument[]>([]);

    /**
     * Computed array of selected document IDs for API calls
     */
    const selectedDocumentIds = computed<number[]>(() =>
        selectedDocuments.value.map((doc) => doc.id),
    );

    /**
     * Check if maximum selection has been reached
     */
    const maxSelectionReached = computed<boolean>(
        () => selectedDocuments.value.length >= MAX_SELECTION,
    );

    /**
     * Check if more documents can be selected
     */
    const canSelectMore = computed<boolean>(
        () => selectedDocuments.value.length < MAX_SELECTION,
    );

    /**
     * Select a document (if not already selected and under limit)
     * @param document - The document to select
     * @returns true if document was selected, false if already selected or limit reached
     */
    function selectDocument(document: UserDocument): boolean {
        // Check if document is already selected
        if (isDocumentSelected(document.id)) {
            return false;
        }

        // Check if we've reached the maximum selection
        if (maxSelectionReached.value) {
            return false;
        }

        selectedDocuments.value.push(document);
        return true;
    }

    /**
     * Deselect a document by ID
     * @param documentId - The ID of the document to deselect
     */
    function deselectDocument(documentId: number): void {
        const index = selectedDocuments.value.findIndex(
            (doc) => doc.id === documentId,
        );
        if (index > -1) {
            selectedDocuments.value.splice(index, 1);
        }
    }

    /**
     * Clear all selected documents
     */
    function clearSelection(): void {
        selectedDocuments.value = [];
    }

    /**
     * Check if a document is currently selected
     * @param documentId - The ID of the document to check
     * @returns true if the document is selected
     */
    function isDocumentSelected(documentId: number): boolean {
        return selectedDocuments.value.some((doc) => doc.id === documentId);
    }

    return {
        selectedDocuments,
        selectedDocumentIds,
        maxSelectionReached,
        selectDocument,
        deselectDocument,
        clearSelection,
        isDocumentSelected,
        canSelectMore,
    };
};
