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

// Navigation menu items
const items = computed<NavigationMenuItem[][]>(() => [
    [
        // left
        {
            label: t("navigation.signOut"),
            icon: "i-heroicons-arrow-right-on-rectangle",
            onClick: signOut,
        },
    ],
    [
        // center
    ],
    [
        // right
        {
            label: t("navigation.languages"),
            icon: "i-heroicons-language",
            children: availableLocales.value.map((locale) => ({
                label: locale.name,
                to: switchLocalePath(locale.code),
            })),
        },
    ],
]);
</script>

<template>
    <div>
        <UNavigationMenu
            content-orientation="vertical"
            :items="items"
            class="w-full justify-between z-50"
        />
    </div>
</template>