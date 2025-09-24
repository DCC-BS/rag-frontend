<template>
    <div class="flex h-screen flex-col">
        <header>
            <NavigationMenu />
        </header>
        <main class="flex-1 overflow-y-auto">
            <Chat />
        </main>
        <footer>
            <Footer />
        </footer>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ["auth"],
});
</script>
