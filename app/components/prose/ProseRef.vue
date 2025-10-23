<template>
    <UTooltip :delay-duration="0" :text="tooltipText">
        <ref>
            <slot />
        </ref>
    </UTooltip>
</template>

<script setup lang="ts">
// Props that might be passed from MDC
interface ProseRefProps {
    text?: string;
}

const props = withDefaults(defineProps<ProseRefProps>(), {
    text: "Reference",
});

// Compute tooltip text from props or use default
const tooltipText = computed((): string => {
    return props.text ?? "Reference";
});
</script>

<style scoped>
ref {
    /* Style for ref tag */
    display: inline;
    cursor: help;
    text-decoration: underline;
    text-decoration-style: dotted;
}
</style>
