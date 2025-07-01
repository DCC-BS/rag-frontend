<script setup lang="ts">
// Use built-in authentication session
const { data: session, status } = useAuth();

// Expose session state globally for components that need it
provide("sessionState", {
    session,
    status,
});
</script>

<template>
    <UApp>
        <NuxtPage />
    </UApp>
</template>