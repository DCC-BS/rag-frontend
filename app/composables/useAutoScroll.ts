import { TIMING, UI_LAYOUT } from "~/utils/constants";

/**
 * Composable for handling auto-scroll behavior in chat
 */
export const useAutoScroll = () => {
    const chatHistoryRef = ref<HTMLElement>();
    const hasUserScrolled = ref(false);
    const isAutoScrolling = ref(false);

    /**
     * Scroll to the bottom of the chat container
     */
    function scrollToBottom(): void {
        if (
            import.meta.client &&
            chatHistoryRef.value &&
            !hasUserScrolled.value
        ) {
            // Use setTimeout to ensure DOM is fully updated
            setTimeout(() => {
                const element = chatHistoryRef.value;
                if (element && !hasUserScrolled.value) {
                    const { scrollHeight, clientHeight } = element;

                    // Only scroll if there's actually scrollable content
                    if (scrollHeight > clientHeight) {
                        isAutoScrolling.value = true;
                        element.scrollTop = scrollHeight;
                        // Reset the flag after auto-scroll is complete
                        setTimeout(() => {
                            isAutoScrolling.value = false;
                        }, TIMING.AUTO_SCROLL_DELAY);
                    }
                }
            }, TIMING.DOM_UPDATE_DELAY);
        }
    }

    /**
     * Check if user is near the bottom of the scroll container
     */
    function isNearBottom(): boolean {
        if (!chatHistoryRef.value) return true;

        const element = chatHistoryRef.value;
        const { scrollTop, scrollHeight, clientHeight } = element;
        const threshold = UI_LAYOUT.SCROLL_THRESHOLD; // pixels from bottom

        return scrollHeight - scrollTop - clientHeight <= threshold;
    }

    /**
     * Handle scroll events to detect manual scrolling
     */
    function handleScroll(): void {
        if (isAutoScrolling.value) {
            // Ignore scroll events triggered by auto-scroll
            return;
        }

        if (!isNearBottom()) {
            hasUserScrolled.value = true;
        }
    }

    /**
     * Reset the manual scroll flag (call when sending new message or starting new chat)
     */
    function resetScrollState(): void {
        hasUserScrolled.value = false;
    }

    /**
     * Watch messages and auto-scroll when they change
     */
    function watchMessages<T>(messages: Ref<T[]>): void {
        // Set up scroll event listener when chatHistoryRef is available
        watchEffect(() => {
            if (import.meta.client && chatHistoryRef.value) {
                const element = chatHistoryRef.value;
                element.addEventListener("scroll", handleScroll, {
                    passive: true,
                });

                // Cleanup function
                return () => {
                    element.removeEventListener("scroll", handleScroll);
                };
            }
        });

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
        resetScrollState,
        hasUserScrolled: readonly(hasUserScrolled),
    };
};
