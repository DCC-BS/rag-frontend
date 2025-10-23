<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

// Add translation hook
const { t } = useI18n();
const { data, signOut } = useAuth();

const userImage = computed(() => {
    const base64 = data.value?.user?.image;
    return base64 ? base64 : "/LucideCircleUserRound.png";
});

// Navigation menu items
const items = computed<DropdownMenuItem[]>(() => [
    {
        label: t("navigation.signOut"),
        icon: "i-lucide-sign-out",
        onSelect: handleSignOut,
    },
]);

async function handleSignOut(): Promise<void> {
    await signOut();
}
</script>

<template>
  <NavigationBar>
    <template #center>
      <UButton variant="ghost" color="neutral" :to="$localePath('/')">{{ t('navigation.chat') }}</UButton>
      <UButton variant="ghost" color="neutral" :to="$localePath('/documents')">{{ t('navigation.documents') }}</UButton>
    </template>
    <template #right>
      <UDropdownMenu :items="items">
        <UButton variant="ghost" color="neutral">
          <img :src="userImage" class="h-6 w-6 rounded-full" :alt="data?.user?.name || 'User'" />
        </UButton>
      </UDropdownMenu>
    </template>
  </NavigationBar>
</template>