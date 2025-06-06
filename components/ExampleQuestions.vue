<script setup lang="ts">
const { t } = useI18n();

// Define the event emitter for when a question is clicked
const emit = defineEmits<{
    questionClicked: [question: string];
}>();

// Array of example questions using i18n keys
const exampleQuestions = [
    {
        text: t("chat.exampleQuestions.question1"),
        icon: "i-heroicons-light-bulb",
        category: t("chat.exampleQuestions.category1"),
    },
    {
        text: t("chat.exampleQuestions.question2"),
        icon: "i-heroicons-chart-bar",
        category: t("chat.exampleQuestions.category2"),
    },
    {
        text: t("chat.exampleQuestions.question3"),
        icon: "i-heroicons-code-bracket",
        category: t("chat.exampleQuestions.category3"),
    },
];

// Function to handle question click
function handleQuestionClick(question: string): void {
    emit("questionClicked", question);
}
</script>

<template>
    <div class="flex flex-col items-center justify-center space-y-8 p-8 min-h-[60vh]">
        <!-- Welcome Section -->
        <div class="text-center max-w-2xl mx-auto">
            <div class="mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                    <UIcon name="i-heroicons-chat-bubble-left-right" class="w-8 h-8 text-white" />
                </div>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {{ t("chat.exampleQuestions.title") }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-500">
                {{ t("chat.exampleQuestions.description") }}
            </p>
        </div>
        
        <!-- Example Questions Grid -->
        <div class="w-full max-w-4xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    v-for="(question, index) in exampleQuestions"
                    :key="index"
                    class="group relative"
                >
                    <button
                        @click="handleQuestionClick(question.text)"
                        class="w-full text-left p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                        <!-- Category Badge -->
                        <div class="flex items-center justify-between mb-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {{ question.category }}
                            </span>
                            <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                                <UIcon 
                                    :name="question.icon" 
                                    class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
                                />
                            </div>
                        </div>
                        
                        <!-- Question Text -->
                        <div class="space-y-2">
                            <p class="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                                {{ question.text }}
                            </p>
                            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <UIcon name="i-heroicons-arrow-right" class="w-3 h-3 mr-1" />
                                {{ t("chat.exampleQuestions.clickToAsk") }}
                            </div>
                        </div>
                        
                        <!-- Hover Effect -->
                        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Additional Help Text -->
        <div class="text-center max-w-md mx-auto">
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {{ t("chat.exampleQuestions.additionalHelp") }}
            </p>
        </div>
    </div>
</template> 