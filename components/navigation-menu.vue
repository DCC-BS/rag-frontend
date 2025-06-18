<script lang="ts" setup>
import type { NavigationMenuItem } from "#ui/components/NavigationMenu.vue";

// Add translation hook
const { t } = useI18n();

const { signOut } = useAuth();

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => {
    return locales.value.filter((i) => i.code !== locale.value);
});

const items = ref<NavigationMenuItem[]>([
    [
        {
            label: t("navigation.signOut"),
            icon: "i-heroicons-arrow-right-on-rectangle",
            onClick: signOut,
            class: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
        }
    ],
    [
        {
            label: t("navigation.title"),
            icon: "i-heroicons-chat-bubble-left-right",
            class: "font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-default",
        },

    ],
    [
        {
            label: t("navigation.languages"),
            icon: "i-heroicons-language",
            children: availableLocales.value.map((locale) => ({
                label: locale.name,
                to: switchLocalePath(locale.code),
            })),
        }
    ]
]);
</script>

<template>
    <UNavigationMenu :items="items" content-orientation="vertical" class="w-full justify-between z-50" />
</template>