<script setup lang="ts">
// Initialize token refresh functionality
const { isRefreshing, hasSessionError } = useTokenRefresh();

// Initialize user data management
const { user, loading: userLoading, error: userError, fetchUser } = useUser();

// Optionally expose refresh state to global usage
// This allows other components to check if a refresh is in progress
provide("tokenRefreshState", {
    isRefreshing,
    hasSessionError,
});

// Expose user state globally
provide("userState", {
    user,
    userLoading,
    userError,
});

// Fetch user data when authenticated
const { data: session } = useAuth();

// Watch for authentication state changes
watch(session, async (newSession, oldSession) => {
    // Only proceed if we have a valid session and it's different from the previous one
    // This prevents unnecessary calls during initial load or when session hasn't actually changed
    if (newSession &&
        !hasSessionError() &&
        !user.value &&
        newSession !== oldSession) {

        // Additional check to ensure we have proper authentication tokens
        if (newSession.user && (newSession as { accessToken?: string }).accessToken) {
            // User is authenticated and we don't have user data yet
            await fetchUser();
        }
    }
});
</script>

<template>
    <UApp>
        <NuxtPage />
    </UApp>
</template>