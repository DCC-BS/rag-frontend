import { ref, onMounted, onUnmounted } from "vue";

/**
 * Composable for handling automatic token refresh
 */
export const useTokenRefresh = () => {
    const { data: session, refresh: refreshSession, signOut } = useAuth();
    const isRefreshing = ref(false);
    const refreshInterval = ref<NodeJS.Timeout | undefined>(undefined);

    /**
     * Check if session has an error indicating token refresh failed
     */
    function hasSessionError(): boolean {
        return (
            (session.value as { error?: string })?.error ===
            "RefreshAccessTokenError"
        );
    }

    /**
     * Refresh the session and handle errors
     */
    async function handleTokenRefresh(): Promise<boolean> {
        if (isRefreshing.value) {
            return false;
        }

        isRefreshing.value = true;

        try {
            console.log("Refreshing session...");
            await refreshSession();

            // Check if refresh failed
            if (hasSessionError()) {
                console.error("Session refresh failed, signing out...");
                await signOut();
                return false;
            }

            console.log("Session refreshed successfully");
            return true;
        } catch (error) {
            console.error("Error refreshing session:", error);
            await signOut();
            return false;
        } finally {
            isRefreshing.value = false;
        }
    }

    /**
     * Start automatic token refresh interval
     */
    function startTokenRefreshInterval(): void {
        // Refresh every 14 minutes (840 seconds)
        // This ensures tokens are refreshed before they expire (typically 15-60 minutes)
        const intervalMs = 14 * 60 * 1000; // 14 minutes

        refreshInterval.value = setInterval(async () => {
            if (session.value && !hasSessionError()) {
                await handleTokenRefresh();
            }
        }, intervalMs);

        console.log("Token refresh interval started (14 minutes)");
    }

    /**
     * Stop automatic token refresh interval
     */
    function stopTokenRefreshInterval(): void {
        if (refreshInterval.value) {
            clearInterval(refreshInterval.value);
            refreshInterval.value = undefined;
            console.log("Token refresh interval stopped");
        }
    }

    /**
     * Handle visibility change to refresh on window focus
     */
    function handleVisibilityChange(): void {
        if (!document.hidden && session.value && !hasSessionError()) {
            handleTokenRefresh();
        }
    }

    // Auto-start refresh interval when composable is used
    onMounted(() => {
        if (import.meta.client && session.value) {
            // Check for existing session errors on mount
            if (hasSessionError()) {
                console.warn("Session has error on mount, signing out...");
                signOut();
                return;
            }

            startTokenRefreshInterval();

            // Listen for visibility changes (when user comes back to tab)
            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        }
    });

    // Cleanup on unmount
    onUnmounted(() => {
        if (import.meta.client) {
            stopTokenRefreshInterval();
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        }
    });

    // Watch for session changes
    watch(
        session,
        (newSession) => {
            if (import.meta.client) {
                if (newSession && !hasSessionError()) {
                    if (!refreshInterval.value) {
                        startTokenRefreshInterval();
                    }
                } else {
                    stopTokenRefreshInterval();
                }
            }
        },
        { immediate: true },
    );

    return {
        isRefreshing,
        hasSessionError,
        handleTokenRefresh,
        startTokenRefreshInterval,
        stopTokenRefreshInterval,
    };
};
