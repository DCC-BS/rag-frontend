<template>
    <!-- Fixed positioned modal overlay -->
    <div v-if="isOpen" class="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4"
        @click.self="closeModal">
        <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
            <div class="flex flex-col h-full w-full overflow-hidden">
                <!-- Header with close button -->
                <div
                    class="flex justify-between items-center p-3 bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                    <div
                        class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate overflow-hidden whitespace-nowrap max-w-[40%]">
                        {{ fileName }}
                    </div>
                    <button class="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full" @click="closeModal"
                        :aria-label="t('documents.closeViewer')">
                        <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                    </button>
                </div>

                <!-- PDF Document Container with zoom -->
                <div ref="containerRef" v-if="pdfSource" class="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
                    <div class="pdf-container"
                        :style="{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }">
                        <ClientOnly>
                            <PdfEmbed :source="pdfSource" :width="containerRef ? containerRef.clientWidth - 32 : 600"
                                :page="currentPage" @loaded="handleDocumentLoaded"
                                @update:instance="pdfInstance = $event" @error="handlePdfError" />
                        </ClientOnly>
                    </div>
                </div>

                <!-- Loading state -->
                <div v-else-if="!pdfError" class="flex items-center justify-center h-full w-full">
                    <div class="p-6 bg-black/5 dark:bg-white/5 rounded-md flex flex-col items-center">
                        <div class="spinner-container mb-3">
                            <div
                                class="spinner border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin">
                            </div>
                        </div>
                        <span class="text-sm text-gray-600 dark:text-gray-400">{{ t('documents.loadingDocument')
                            }}</span>
                    </div>
                </div>

                <!-- Error state -->
                <div v-else class="flex items-center justify-center h-full w-full">
                    <div class="p-6 bg-red-50 dark:bg-red-900/20 rounded-md flex flex-col items-center text-center">
                        <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500 mb-3" />
                        <span class="text-sm text-red-600 dark:text-red-400 mb-2">{{ t('documents.failedToLoadPdf')
                            }}</span>
                        <span class="text-xs text-red-500 dark:text-red-300">{{ pdfError }}</span>
                        <button @click="retryLoad"
                            class="mt-3 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700">
                            {{ t('documents.retry') }}
                        </button>
                    </div>
                </div>

                <!-- Footer with page navigation and zoom controls -->
                <div v-if="pdfSource"
                    class="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600">
                    <div class="flex items-center gap-2">
                        <!-- Zoom controls -->
                        <button
                            class="py-1 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="zoomLevel <= 50" @click="zoomOut" :aria-label="t('documents.zoomOut')">
                            <UIcon name="i-heroicons-minus" class="w-4 h-4" />
                        </button>
                        <span class="text-sm text-gray-700 dark:text-gray-300">{{ zoomLevel }}%</span>
                        <button
                            class="py-1 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="zoomLevel >= 300" @click="zoomIn" :aria-label="t('documents.zoomIn')">
                            <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                        </button>
                        <button
                            class="py-1 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ml-1"
                            @click="resetZoom" :aria-label="t('documents.resetZoom')">
                            {{ t('documents.resetZoom') }}
                        </button>

                        <!-- Download button -->
                        <button
                            class="py-1 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ml-2 flex items-center gap-1"
                            @click="downloadPdf" :aria-label="t('documents.download')">
                            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
                            {{ t('documents.download') }}
                        </button>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            class="py-1 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
                            {{ t('documents.previous') }}
                        </button>
                        <span class="mx-2 text-sm text-gray-700 dark:text-gray-300">{{ t('documents.pageOf', {
                            currentPage, totalPages
                        }) }}</span>
                        <button
                            class="py-1 px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
                            {{ t('documents.next') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { defineAsyncComponent, onMounted, ref, watch } from "vue";

const { t } = useI18n();
// Import PDF component dynamically (client-side only)
const PdfEmbed = defineAsyncComponent(() =>
    import("vue-pdf-embed").then((module) => module.default),
);

interface DocumentViewerProps {
    isOpen: boolean;
    file: Blob | undefined;
    fileName: string;
    page?: number;
}

const props = withDefaults(defineProps<DocumentViewerProps>(), {
    page: 1,
});

const emit = defineEmits<{
    "update:isOpen": [value: boolean];
}>();

// Reactive state
const currentPage = ref(props.page || 1);
const totalPages = ref(0);
const pdfSource = ref<string | ArrayBuffer | undefined>(undefined);
const pdfInstance = ref<unknown>(undefined);
const zoomLevel = ref(100);
const containerRef = ref<HTMLElement | undefined>(undefined);
const pdfError = ref<string | undefined>(undefined);
const isLoading = ref(false);

/**
 * Convert Blob to data URL for embedding
 */
function convertBlobToSource(blob: Blob): void {
    isLoading.value = true;
    pdfError.value = undefined;
    pdfSource.value = undefined;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            if (event.target?.result) {
                pdfSource.value = event.target.result as string | ArrayBuffer;
            } else {
                throw new Error("Failed to read file content");
            }
        } catch (error) {
            pdfError.value =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
        } finally {
            isLoading.value = false;
        }
    };

    reader.onerror = () => {
        pdfError.value = "Failed to read PDF file";
        isLoading.value = false;
    };

    reader.readAsArrayBuffer(blob);
}

/**
 * Retry loading the PDF
 */
function retryLoad(): void {
    if (props.file) {
        convertBlobToSource(props.file);
    }
}

/**
 * Navigate to a specific page
 */
function goToPage(pageNumber: number): void {
    if (pageNumber > 0 && pageNumber <= totalPages.value) {
        currentPage.value = pageNumber;
    }
}

/**
 * Handle when PDF document is loaded
 */
function handleDocumentLoaded(pdfDocument: PDFDocumentProxy): void {
    pdfError.value = undefined;

    // Get the number of pages from the PDF document
    totalPages.value = pdfDocument.numPages;

    // Navigate to the specified page once document is loaded
    goToPage(props.page);
}

/**
 * Handle PDF loading errors
 */
function handlePdfError(error: unknown): void {
    const errorMessage =
        error instanceof Error ? error.message : "Failed to load PDF document";
    pdfError.value = errorMessage;
}

/**
 * Increase zoom level by the specified percentage
 */
function zoomIn(): void {
    if (zoomLevel.value < 300) {
        zoomLevel.value += 25;
    }
}

/**
 * Decrease zoom level by the specified percentage
 */
function zoomOut(): void {
    if (zoomLevel.value > 50) {
        zoomLevel.value -= 25;
    }
}

/**
 * Reset zoom level to 100%
 */
function resetZoom(): void {
    zoomLevel.value = 100;
}

/**
 * Handle wheel events for zooming with shift+wheel
 */
function handleWheel(event: WheelEvent): void {
    if (event.shiftKey) {
        event.preventDefault();
        if (event.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    }
}

/**
 * Download the current PDF file
 */
function downloadPdf(): void {
    if (!props.file || !props.fileName) {
        return;
    }

    // Create a download URL from the file blob
    const url = URL.createObjectURL(props.file);

    // Create a temporary anchor element
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = props.fileName;

    // Append to the document, trigger click, and clean up
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Release the object URL
    URL.revokeObjectURL(url);
}

/**
 * Close the PDF viewer modal
 */
function closeModal(): void {
    emit("update:isOpen", false);
}

onMounted(() => {
    // Initialize PDF source if modal is already open and file is available
    if (props.isOpen && props.file) {
        convertBlobToSource(props.file);
    }

    // Add wheel event listener for zooming
    if (containerRef.value) {
        containerRef.value.addEventListener("wheel", handleWheel, {
            passive: false,
        });
    }
});

// Watch for changes to the page prop
watch(
    () => props.page,
    (newPage) => {
        goToPage(newPage);
    },
);

// Watch for changes to the file prop
watch(
    () => props.file,
    (newFile) => {
        if (newFile) {
            convertBlobToSource(newFile);
        } else {
            pdfSource.value = undefined;
        }
    },
);

// Watch for modal open state changes
watch(
    () => props.isOpen,
    (isOpen) => {
        if (!isOpen) {
            // Reset state when modal closes
            pdfSource.value = undefined;
            currentPage.value = 1;
            totalPages.value = 0;
            zoomLevel.value = 100;
            pdfError.value = undefined;
            isLoading.value = false;
        } else {
            // When modal opens, initialize PDF if file is available
            if (props.file) {
                convertBlobToSource(props.file);
            }
        }
    },
);
</script>

<style scoped>
/* Loading spinner animation styles */
.spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* PDF container styles */
.pdf-container {
    transition: transform 0.2s ease-in-out;
    display: inline-block;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Dark mode adjustments */
.dark .pdf-container {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>