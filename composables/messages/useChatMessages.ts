import type { Message, StatusPart, StreamChunk } from "~/models/message";

/**
 * Composable for managing chat messages and sending functionality
 */
export const useChatMessages = (
    selectedDocumentIds?: ComputedRef<number[]>,
) => {
    const { data: authData } = useAuth();
    const { thread_id } = useThread();
    const { t } = useI18n();

    const messages = ref<Message[]>([]);
    const isLoading = ref(false);

    /**
     * Add a user message to the chat
     */
    function addUserMessage(content: string): void {
        const userAvatar =
            authData.value?.user?.image ?? "https://i.pravatar.cc/150?img=1";

        messages.value.push({
            id: `user-${Date.now()}`,
            isUser: true,
            avatar: userAvatar,
            content,
            timestamp: new Date(),
        });
    }

    /**
     * Add an AI message placeholder and return its index
     */
    function addAiMessagePlaceholder(): number {
        const aiAvatar = "/img/ai.png";
        const aiMessageId = `ai-${Date.now()}`;

        messages.value.push({
            id: aiMessageId,
            isUser: false,
            avatar: aiAvatar,
            content: "",
            streaming: true,
            timestamp: new Date(),
        });

        return messages.value.findIndex(
            (msg: Message) => msg.id === aiMessageId,
        );
    }

    /**
     * Update AI message content based on stream chunks
     */
    function updateAiMessage(index: number, chunk: StreamChunk): void {
        const currentAiMessage = messages.value[index];
        if (!currentAiMessage) {
            return;
        }

        switch (chunk.type) {
            case "status":
                handleStatusChunk(currentAiMessage, chunk);
                break;
            case "answer":
                handleAnswerChunk(currentAiMessage, chunk);
                break;
            case "documents":
                handleDocumentsChunk(currentAiMessage, chunk);
                break;
            case "decision":
                handleDecisionChunk(currentAiMessage, chunk);
                break;
        }
    }

    /**
     * Handle status chunk updates
     */
    function handleStatusChunk(message: Message, chunk: StreamChunk): void {
        if (chunk.type !== "status") return;

        const statusPart: StatusPart = {
            text: t(chunk.metadata.translation_key),
            sender: chunk.sender,
        };

        message.statusParts ??= [];
        message.statusParts.push(statusPart);
    }

    /**
     * Handle answer chunk updates
     */
    function handleAnswerChunk(message: Message, chunk: StreamChunk): void {
        if (chunk.type !== "answer") return;

        const answer = chunk.metadata.answer;

        if (message.content === "…" || message.content === "") {
            message.content = answer;
        } else {
            message.content += answer;
        }
    }

    /**
     * Handle documents chunk updates
     */
    function handleDocumentsChunk(message: Message, chunk: StreamChunk): void {
        if (chunk.type !== "documents") return;

        message.documents = chunk.metadata.documents;
    }

    /**
     * Handle decision chunk updates
     */
    function handleDecisionChunk(message: Message, chunk: StreamChunk): void {
        if (chunk.type !== "decision") return;

        const statusPart = createDecisionStatusPart(chunk);

        message.statusParts ??= [];
        message.statusParts.push(statusPart);
    }

    /**
     * Create status part for decision chunks with appropriate highlighting
     */
    function createDecisionStatusPart(chunk: StreamChunk): StatusPart {
        if (chunk.type !== "decision") {
            throw new Error("Invalid chunk type for decision status part");
        }

        const { decision, reason } = chunk.metadata;

        let text = "";
        let highlight: "success" | "error" | "warning" | null | undefined =
            null;
        switch (chunk.sender) {
            case "is_truthful":
                text = decision
                    ? t("common.yes")
                    : `${t("common.no")} (${reason})`;
                highlight = decision ? "success" : "error";
                break;
            case "should_retrieve":
                text = decision
                    ? t("chat.decision.retrieve")
                    : t("chat.decision.answer");
                break;
        }

        const statusPart: StatusPart = {
            text,
            sender: chunk.sender,
            highlight,
        };

        return statusPart;
    }

    /**
     * Finalize AI message on stream end
     */
    function finalizeAiMessage(index: number): void {
        const currentAiMessage = messages.value[index];
        if (currentAiMessage) {
            currentAiMessage.streaming = false;
            if (
                currentAiMessage.content === "…" ||
                currentAiMessage.content === ""
            ) {
                currentAiMessage.content = "No response or stream ended.";
            }
        }
    }

    /**
     * Handle AI message error
     */
    function handleAiMessageError(index: number): void {
        const currentAiMessage = messages.value[index];
        if (currentAiMessage) {
            currentAiMessage.content = "Failed to send message.";
            currentAiMessage.statusParts = [
                {
                    text: "Error: Failed to process message",
                    highlight: "error",
                },
            ];
        }
    }

    /**
     * Send a chat message
     */
    async function sendChatMessage(content: string): Promise<void> {
        if (!content.trim() || isLoading.value) {
            return;
        }

        isLoading.value = true;

        // Add user message
        addUserMessage(content);

        // Add AI message placeholder
        const aiMessageIndex = addAiMessagePlaceholder();
        if (aiMessageIndex === -1) {
            isLoading.value = false;
            return;
        }

        try {
            // Use provided document IDs or null
            const documentIds = selectedDocumentIds?.value?.length
                ? selectedDocumentIds.value
                : null;

            await new Promise<void>((resolve, reject) => {
                sendMessage(
                    content,
                    thread_id.value,
                    documentIds,
                    (chunk: StreamChunk) =>
                        updateAiMessage(aiMessageIndex, chunk),
                    () => {
                        finalizeAiMessage(aiMessageIndex);
                        isLoading.value = false;
                        resolve();
                    },
                    (error: Error) => {
                        reject(error);
                    },
                );
            });
        } catch (error) {
            console.error("Failed to send chat message:", error);
            handleAiMessageError(aiMessageIndex);
            isLoading.value = false;
            throw error;
        }
    }

    /**
     * Clear all messages
     */
    function clearMessages(): void {
        messages.value = [];
    }

    /**
     * Check if example questions should be shown
     */
    const showExampleQuestions = computed(() => messages.value.length === 0);

    return {
        messages,
        isLoading,
        showExampleQuestions,
        sendChatMessage,
        clearMessages,
    };
};
