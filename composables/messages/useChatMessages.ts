import type { Message, StreamChunk } from "~/models/message";

/**
 * Composable for managing chat messages and sending functionality
 */
export const useChatMessages = () => {
    const { data: authData } = useAuth();
    const { thread_id } = useThread();

    const messages = ref<Message[]>([]);
    const isLoading = ref(false);

    /**
     * Add a user message to the chat
     */
    function addUserMessage(content: string): void {
        const userAvatar =
            authData.value?.user?.picture ?? "https://i.pravatar.cc/150?img=1";

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
            status: "",
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
        if (!currentAiMessage) return;

        if (chunk.type === "status") {
            let statusText = chunk.message || "";
            if (chunk.decision) {
                statusText += ` (Decision: ${chunk.decision})`;
            }
            if (currentAiMessage.status) {
                currentAiMessage.status += ` -> ${statusText}`;
            } else {
                currentAiMessage.status = statusText;
            }

            if (currentAiMessage.content === "") {
                currentAiMessage.content = "…";
            }
        } else if (chunk.type === "answer") {
            if (
                currentAiMessage.content === "…" ||
                currentAiMessage.content === ""
            ) {
                currentAiMessage.content = chunk.answer || "";
            } else {
                currentAiMessage.content += chunk.answer || "";
            }
        } else if (chunk.type === "documents") {
            currentAiMessage.documents = chunk.documents;
        }
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
            currentAiMessage.status = "Error";
        }
    }

    /**
     * Send a chat message
     */
    async function sendChatMessage(content: string): Promise<void> {
        if (!content.trim() || isLoading.value) return;

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
            await new Promise<void>((resolve, reject) => {
                sendMessage(
                    content,
                    thread_id.value,
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
