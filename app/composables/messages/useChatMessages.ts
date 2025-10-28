import { v4 as uuidv4 } from "uuid";
import type { ApiDocument, StreamChunk } from "~/models/api_message";
import { db } from "~/services/db";
import { sendMessage } from "./apiMessageHandler";
/**
 * Composable for managing chat messages and sending functionality
 */
export const useChatMessages = (
    selectedDocumentIds?: ComputedRef<number[]>,
) => {
    const { t } = useI18n();
    const { handleApiError } = useApiError();

    const status = ref<"streaming" | "ready">("ready");

    /**
     * Add a user message to the chat
     */
    async function addUserMessage(
        content: string,
        chatId: string,
    ): Promise<void> {
        await db.messages.add({
            id: uuidv4(),
            chatId: chatId,
            content: content,
            role: "user",
            createdAt: new Date(Date.now()),
        });
    }

    /**
     * Add an AI message placeholder and return its index
     */
    async function addAiMessagePlaceholder(chatId: string): Promise<string> {
        const messageId = await db.messages.add({
            id: uuidv4(),
            chatId: chatId,
            content: "",
            role: "assistant",
            createdAt: new Date(Date.now()),
        });
        return messageId;
    }

    /**
     * Update AI message content based on stream chunks
     */
    async function updateAiMessage(
        messageId: string,
        chunk: StreamChunk,
    ): Promise<void> {
        const currentAiMessage = await db.messages.get(messageId);
        if (!currentAiMessage) {
            return;
        }

        switch (chunk.type) {
            case "status":
                await handleStatusChunk(messageId, chunk);
                break;
            case "answer":
                await handleAnswerChunk(messageId, chunk);
                break;
            case "documents":
                await handleDocumentsChunk(messageId, chunk);
                break;
            case "decision":
                await handleDecisionChunk(messageId, chunk);
                break;
        }
    }

    /**
     * Handle status chunk updates
     */
    async function handleStatusChunk(
        messageId: string,
        chunk: StreamChunk,
    ): Promise<void> {
        if (chunk.type !== "status") return;
        await db.statusParts.add({
            id: uuidv4(),
            messageId: messageId,
            text: t(chunk.metadata.translation_key),
            highlight: null,
            sender: chunk.sender,
            createdAt: new Date(Date.now()),
        });
    }

    /**
     * Handle answer chunk updates
     */
    async function handleAnswerChunk(
        messageId: string,
        chunk: StreamChunk,
    ): Promise<void> {
        if (chunk.type !== "answer") return;

        const answer = chunk.metadata.answer;

        const currentAiMessage = await db.messages.get(messageId);
        if (!currentAiMessage) {
            return;
        }

        if (
            currentAiMessage.content === "…" ||
            currentAiMessage.content === ""
        ) {
            currentAiMessage.content = answer;
        } else {
            currentAiMessage.content += answer;
        }
        await db.messages.put(currentAiMessage);
    }

    /**
     * Handle documents chunk updates
     */
    async function handleDocumentsChunk(
        messageId: string,
        chunk: StreamChunk,
    ): Promise<void> {
        if (chunk.type !== "documents") return;
        await db.documents.bulkAdd(
            chunk.metadata.documents.map((document: ApiDocument) => ({
                id: uuidv4(),
                file_name: document.metadata.file_name,
                document_path: document.metadata.document_path,
                mime_type: document.metadata.mime_type,
                num_pages: document.metadata.num_pages ?? 1,
                access_roles: document.metadata.access_roles,
                user_document_id: document.metadata.id,
                page: document.metadata.page ?? 1,
                metadata: document.metadata as unknown as Record<
                    string,
                    string | number | string[] | null
                >,
                messageId: messageId,
                createdAt: new Date(Date.now()),
            })),
        );
    }

    /**
     * Handle decision chunk updates
     */
    async function handleDecisionChunk(
        messageId: string,
        chunk: StreamChunk,
    ): Promise<void> {
        if (chunk.type !== "decision") return;

        const statusPart = createDecisionStatusPart(chunk);

        await db.statusParts.add({
            id: uuidv4(),
            messageId: messageId,
            ...statusPart,
            createdAt: new Date(Date.now()),
        });
    }

    /**
     * Create status part for decision chunks with appropriate highlighting
     */
    function createDecisionStatusPart(
        chunk: StreamChunk,
    ): Pick<
        import("~/services/db").StatusPart,
        "text" | "highlight" | "sender"
    > {
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

        const statusPart: Pick<
            import("~/services/db").StatusPart,
            "text" | "highlight" | "sender"
        > = {
            text,
            sender: chunk.sender,
            highlight,
        };

        return statusPart;
    }

    /**
     * Finalize AI message on stream end
     */
    async function finalizeAiMessage(messageId: string): Promise<void> {
        const currentAiMessage = await db.messages.get(messageId);
        if (currentAiMessage) {
            if (
                currentAiMessage.content === "…" ||
                currentAiMessage.content === ""
            ) {
                const error = {
                    message: "No response received from AI",
                    statusCode: 500,
                    statusMessage:
                        "Failed to receive response from AI. Please try again.",
                };
                // Show error toast for empty response
                handleApiError(error);
                currentAiMessage.content =
                    "Failed to receive response. Please try again.";
            } else {
                // Replace German ß with Swiss German ss
                currentAiMessage.content = currentAiMessage.content.replace(
                    /ß/g,
                    "ss",
                );
            }
            await db.messages.put(currentAiMessage);
        }
    }

    /**
     * Send a chat message
     * Returns the chatId immediately and streams the response in the background
     */
    async function sendChatMessage(
        content: string,
        chatId: string | null = null,
    ): Promise<string | undefined> {
        if (!content.trim() || status.value === "streaming") {
            return chatId ?? undefined;
        }
        let chatIdToUse: string = chatId ?? "";
        if (!chatIdToUse) {
            chatIdToUse = await db.chats.add({
                id: uuidv4(),
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
            });
        }
        status.value = "streaming";

        // Add user message
        await addUserMessage(content, chatIdToUse);

        // Add AI message placeholder
        const aiMessageIndex = await addAiMessagePlaceholder(chatIdToUse);

        // Start streaming in the background (don't await)
        // This allows immediate redirect while response streams in
        const documentIds = selectedDocumentIds?.value?.length
            ? selectedDocumentIds.value
            : null;

        // Stream the response without blocking the return
        new Promise<void>((resolve, reject) => {
            sendMessage(
                content,
                chatIdToUse,
                documentIds,
                (chunk: StreamChunk) => updateAiMessage(aiMessageIndex, chunk),
                () => {
                    finalizeAiMessage(aiMessageIndex);
                    status.value = "ready";
                    resolve();
                },
                (error: Error) => {
                    reject(error);
                },
            );
        }).catch((error) => {
            console.error("Failed to send chat message:", error);
            status.value = "ready";
            handleApiError(error);
        });

        // Return chatId immediately so UI can redirect
        return chatIdToUse;
    }

    return {
        status,
        sendChatMessage,
    };
};
