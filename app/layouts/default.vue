<script lang="ts" setup>

</script>

<template>
    <Disclaimer app-name="Bebbi Bot" />
    <FeedbackControl />
    <UMain>
        <NavigationMenu />
        <slot />
    </UMain>
    <DataBsFooter class="w-full" />
</template>