<script setup lang="ts">
const { data: session, status } = useAuth();

// Expose session state globally for components that need it
provide("sessionState", {
    session,
    status,
});
</script>

<template>
    <UApp>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>