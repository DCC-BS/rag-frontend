/**
 * Composable for handling auto-scroll behavior in chat
 */
export const useAutoScroll = () => {
    const chatHistoryRef = ref<HTMLElement>();

    /**
     * Scroll to the bottom of the chat container
     */
    function scrollToBottom(): void {
        if (import.meta.client && chatHistoryRef.value) {
            // Use setTimeout to ensure DOM is fully updated
            setTimeout(() => {
                const element = chatHistoryRef.value;
                if (element) {
                    const { scrollHeight, clientHeight } = element;

                    // Only scroll if there's actually scrollable content
                    if (scrollHeight > clientHeight) {
                        element.scrollTop = scrollHeight;
                    }
                }
            }, 10);
        }
    }

    /**
     * Watch messages and auto-scroll when they change
     */
    function watchMessages<T>(messages: Ref<T[]>): void {
        watch(
            messages,
            () => {
                scrollToBottom();
            },
            { deep: true },
        );
    }

    return {
        chatHistoryRef,
        scrollToBottom,
        watchMessages,
    };
};
