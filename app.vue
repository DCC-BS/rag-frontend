<script setup lang="ts">
// Initialize token refresh functionality
const { isRefreshing, hasSessionError } = useTokenRefresh();

// Optionally expose refresh state to global usage
// This allows other components to check if a refresh is in progress
provide("tokenRefreshState", {
    isRefreshing,
    hasSessionError,
});
</script>

<template>
    <UApp>
        <FeedbackControl />
        <NavigationMenu />
        <NuxtPage />
    </UApp>
</template>
