import type { UserDocument } from "~/models/document";

/**
 * Composable for managing document selection transfer between documents page and chat
 * Provides a bridge to transfer selected documents from documents page to chat functionality
 * Uses localStorage for persistence across page reloads (non-SPA environment)
 */
export const useChatDocumentSelection = () => {
    // Global state for documents selected for chat from documents page
    const selectedDocumentsForChat = ref<UserDocument[]>([]);

    // Initialize from localStorage
    function initializeChatDocuments(): void {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("chat-selected-documents");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (
                        Array.isArray(parsed) &&
                        parsed.every(
                            (item) =>
                                item &&
                                typeof item === "object" &&
                                "id" in item &&
                                typeof item.id === "number",
                        )
                    ) {
                        selectedDocumentsForChat.value = parsed;
                    }
                }
            } catch (error) {
                console.warn(
                    "Failed to restore chat document selections:",
                    error,
                );
            }
        }
    }

    // Save to localStorage whenever selections change
    function saveChatDocuments(): void {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(
                    "chat-selected-documents",
                    JSON.stringify(selectedDocumentsForChat.value),
                );
            } catch (error) {
                console.warn("Failed to save chat document selections:", error);
            }
        }
    }

    // Initialize on first access
    initializeChatDocuments();

    /**
     * Set documents for chat from documents page selection
     * @param documents - Array of documents to use for chat
     */
    function setDocumentsForChat(documents: UserDocument[]): void {
        selectedDocumentsForChat.value = [...documents];
        saveChatDocuments();
    }

    /**
     * Get documents for chat
     * @returns Array of documents selected for chat
     */
    function getDocumentsForChat(): UserDocument[] {
        return [...selectedDocumentsForChat.value];
    }

    /**
     * Clear chat document selection
     */
    function clearChatDocumentSelection(): void {
        selectedDocumentsForChat.value = [];
        saveChatDocuments();
    }

    /**
     * Check if there are documents selected for chat
     * @returns true if documents are selected for chat
     */
    function hasChatDocuments(): boolean {
        return selectedDocumentsForChat.value.length > 0;
    }

    return {
        selectedDocumentsForChat: readonly(selectedDocumentsForChat),
        setDocumentsForChat,
        getDocumentsForChat,
        clearChatDocumentSelection,
        hasChatDocuments,
    };
};
