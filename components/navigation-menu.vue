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

// Navigation menu items - now separate for each column
const leftItems = computed(() => [
    {
        label: t("navigation.signOut"),
        icon: "i-heroicons-arrow-right-on-rectangle",
        onClick: signOut,
        class: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
    },
]);

const logoItem = computed(() => ({
    label: t("navigation.title"),
    icon: "i-heroicons-chat-bubble-left-right",
    class: "font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-default",
}));

const rightItems = computed(() => [
    {
        label: t("navigation.languages"),
        icon: "i-heroicons-language",
        children: availableLocales.value.map((locale) => ({
            label: locale.name,
            to: switchLocalePath(locale.code),
            class: "hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors",
        })),
        class: "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
    },
]);
</script>

<template>
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-4 gap-4 items-center py-3">
                <!-- Column 1: Sign Out -->
                <div class="flex justify-start">
                    <UNavigationMenu
                        content-orientation="vertical"
                        :items="[leftItems]"
                    />
                </div>
                
                <!-- Column 2: Logo/Brand -->
                <div class="flex justify-center">
                    <UNavigationMenu
                        content-orientation="vertical"
                        :items="[[logoItem]]"
                    />
                </div>
                
                <!-- Column 3: Disclaimer -->
                <div class="flex justify-center">
                    <DisclaimerLlm />
                </div>
                
                <!-- Column 4: Languages -->
                <div class="flex justify-end">
                    <UNavigationMenu
                        content-orientation="vertical"
                        :items="[rightItems]"
                    />
                </div>
            </div>
        </div>
    </div>
</template>