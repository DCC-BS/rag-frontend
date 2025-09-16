<script setup lang="ts">
import { Disclaimer } from "@dcc-bs/common-ui.bs.js";

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
        <Disclaimer app-name="Chatbot" />
    </UApp>
</template>