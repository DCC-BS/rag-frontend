<script setup lang="ts">

</script>

<template>
  <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between min-h-[4rem]">
        <div class="flex-1">
          <!--  Left blank for spacing -->
        </div>
        <div class="flex-1 flex justify-center">
          <DataBsFooter class="bg-white dark:bg-gray-800" />
        </div>
        <div class="flex-1 flex justify-end items-center gap-4">
          <DisclaimerButton />
          <FeedbackControl />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.feedback-wrapper {
  position: static !important;
  bottom: auto !important;
  right: auto !important;
  z-index: auto !important;
}
</style>