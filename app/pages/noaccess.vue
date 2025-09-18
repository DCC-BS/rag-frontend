<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 flex flex-col items-center justify-center">
      <img src="/img/otter.jpg" alt="Otter" class="w-24 h-24 rounded-full object-cover m-4" />
      <h1>{{ t('noaccess.title') }}</h1>
      <p>{{ t('noaccess.description') }}</p>
      <p>{{ t('noaccess.contact') }}</p>
      <a href="mailto:dcc@bs.ch"
        class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline hover:underline-offset-4 transition-colors duration-200">
        <Icon name="heroicons:envelope" class="w-5 h-5" />
        dcc@bs.ch
      </a>
    </div>
    <DataBsBanner />
  </div>

</template>

<script lang="ts" setup>
import { DataBsBanner } from '@dcc-bs/common-ui.bs.js';

const { t } = useI18n();
</script>
