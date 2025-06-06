/**
 * Composable for managing chat input and keyboard interactions
 */
export const useChatInput = () => {
    const userInput = ref("");

    /**
     * Handle keyboard shortcuts for the chat input
     */
    function createKeydownHandler(onSend: () => void) {
        return (event: KeyboardEvent): void => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
            }
        };
    }

    /**
     * Clear the input field
     */
    function clearInput(): void {
        userInput.value = "";
    }

    /**
     * Set input value (useful for example questions)
     */
    function setInput(value: string): void {
        userInput.value = value;
    }

    /**
     * Check if input has content
     */
    const hasContent = computed(() => userInput.value.trim().length > 0);

    return {
        userInput,
        hasContent,
        createKeydownHandler,
        clearInput,
        setInput,
    };
};
