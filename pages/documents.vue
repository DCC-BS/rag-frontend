<template>
    <div class="flex flex-col h-screen">
        <header>
            <NavigationMenu />
        </header>
        <main class="flex-1 overflow-y-auto">
            <div class="container mx-auto px-4 py-8">
                <!-- Page Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Documents
                            </h1>
                            <p class="text-gray-600 dark:text-gray-400">
                                Manage and view your accessible documents
                            </p>
                        </div>
                        <button @click="refreshDocuments" :disabled="loading"
                            class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200">
                            <UIcon :name="loading ? 'i-heroicons-arrow-path' : 'i-heroicons-arrow-path'"
                                :class="{ 'animate-spin': loading }" class="w-4 h-4" />
                            {{ loading ? 'Refreshing...' : 'Refresh' }}
                        </button>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading && !documents" class="flex items-center justify-center py-12">
                    <div class="text-center">
                        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p class="text-gray-600 dark:text-gray-400">Loading documents...</p>
                    </div>
                </div>

                <!-- Error State -->
                <div v-else-if="error"
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div class="flex items-center gap-3 mb-3">
                        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h3 class="font-semibold text-red-800 dark:text-red-200">Error Loading Documents</h3>
                    </div>
                    <p class="text-red-700 dark:text-red-300 mb-4">{{ error }}</p>
                    <button @click="fetchDocuments"
                        class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
                        Try Again
                    </button>
                </div>

                <!-- Documents Content -->
                <div v-else-if="documents">
                    <!-- Stats -->
                    <div
                        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <div class="flex items-center gap-3">
                            <UIcon name="i-heroicons-document-duplicate"
                                class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span class="text-blue-800 dark:text-blue-200 font-medium">
                                {{ documents.total_count ?? 0 }} {{ (documents.total_count ?? 0) === 1 ? 'document' :
                                    'documents' }}
                                available
                            </span>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="documents.documents && documents.documents.length === 0" class="text-center py-12">
                        <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Documents Found
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-6">
                            You don't have access to any documents yet.
                        </p>
                    </div>

                    <!-- Documents Grid -->
                    <div v-else-if="documents.documents && documents.documents.length > 0"
                        class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        <UserDocument v-for="document in documents.documents" :key="document.id" :document="document" />
                    </div>
                </div>
            </div>
        </main>
        <footer>
            <Footer />
        </footer>
    </div>
</template>

<script lang="ts" setup>
const { documents, loading, error, fetchDocuments, refreshDocuments } = useDocuments();

// Set page metadata
useHead({
    title: 'Documents',
    meta: [
        { name: 'description', content: 'Manage and view your accessible documents' }
    ]
});

// Fetch documents on mount
onMounted(() => {
    fetchDocuments();
});
</script>

<style></style>