<template>
    <UTooltip :delay-duration="0" :text="tooltipText">
        <ref>
            <slot />
        </ref>
    </UTooltip>
</template>

<script setup lang="ts">
const { t } = useI18n();

// Props that might be passed from MDC
interface ProseRefProps {
    text?: string;
}

const props = defineProps<ProseRefProps>();

// Compute tooltip text from props or use default
const tooltipText = computed((): string => {
    return props.text ?? t("common.reference");
});
</script>

<style scoped>
ref {
    display: inline;
    cursor: help;
    text-decoration: underline;
    text-decoration-style: dotted;
    color: #3b82f6;
    font-size: 0.75em;
    vertical-align: super;
    font-weight: 600;
}

/* Add brackets around ref content using pseudo-elements */
ref::before {
    content: "[";
}

ref::after {
    content: "]";
}
</style>
