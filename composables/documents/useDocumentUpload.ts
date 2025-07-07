import { unzip } from "fflate";

interface UploadProgress {
    current: number;
    total: number;
    percentage: number;
    status: string;
}

interface UploadResult {
    success: number;
    failed: number;
    totalFiles: number;
    failedFiles: string[];
}

interface UseDocumentUploadReturn {
    uploadFiles: (
        files: File | File[],
        accessRole: string,
    ) => Promise<UploadResult>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
    progress: Ref<UploadProgress>;
}

/**
 * Composable for uploading documents (single files or ZIP archives)
 * Handles client-side ZIP extraction, batching, and progress tracking
 */
export const useDocumentUpload = (): UseDocumentUploadReturn => {
    const loading = ref<boolean>(false);
    const error = ref<string | undefined>(undefined);
    const progress = ref<UploadProgress>({
        current: 0,
        total: 0,
        percentage: 0,
        status: "idle",
    });

    // Constants for batching limits
    const MAX_FILES_PER_BATCH = 100;
    const MAX_BATCH_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

    /**
     * Extract files from ZIP archive using fflate
     */
    async function extractZipFiles(zipFile: File): Promise<File[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const uint8Array = new Uint8Array(arrayBuffer);

                unzip(uint8Array, (error, unzipped) => {
                    if (error) {
                        reject(
                            new Error(
                                `Failed to extract ZIP: ${error.message}`,
                            ),
                        );
                        return;
                    }

                    const extractedFiles: File[] = [];

                    // Process all entries, including those in subdirectories
                    for (const [filename, fileData] of Object.entries(
                        unzipped,
                    )) {
                        // Skip directories and system files
                        if (
                            filename.endsWith("/") ||
                            filename.startsWith("__MACOSX/") ||
                            filename.includes(".DS_Store")
                        ) {
                            continue;
                        }

                        // Extract just the filename (remove path)
                        const cleanFilename =
                            filename.split("/").pop() ?? filename;

                        // Create File object from extracted data
                        const file = new File([fileData], cleanFilename, {
                            type: getFileType(cleanFilename),
                        });

                        extractedFiles.push(file);
                    }

                    resolve(extractedFiles);
                });
            };

            reader.onerror = () => {
                reject(new Error("Failed to read ZIP file"));
            };

            reader.readAsArrayBuffer(zipFile);
        });
    }

    /**
     * Get MIME type based on file extension
     */
    function getFileType(filename: string): string {
        const extension = filename.toLowerCase().split(".").pop();
        const typeMap: Record<string, string> = {
            pdf: "application/pdf",
            txt: "text/plain",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls: "application/vnd.ms-excel",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ppt: "application/vnd.ms-powerpoint",
            pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        };
        return typeMap[extension ?? ""] ?? "application/octet-stream";
    }

    /**
     * Create batches from files array based on file count and size limits
     */
    function createBatches(files: File[]): File[][] {
        const batches: File[][] = [];
        let currentBatch: File[] = [];
        let currentBatchSize = 0;

        for (const file of files) {
            // Check if adding this file would exceed limits
            if (
                currentBatch.length >= MAX_FILES_PER_BATCH ||
                (currentBatchSize + file.size > MAX_BATCH_SIZE_BYTES &&
                    currentBatch.length > 0)
            ) {
                // Start new batch
                if (currentBatch.length > 0) {
                    batches.push(currentBatch);
                    currentBatch = [];
                    currentBatchSize = 0;
                }
            }

            currentBatch.push(file);
            currentBatchSize += file.size;
        }

        // Add remaining files as final batch
        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }

        return batches;
    }

    /**
     * Upload a batch of files to the backend
     */
    async function uploadBatch(
        files: File[],
        accessRole: string,
    ): Promise<UploadResult> {
        const formData = new FormData();

        // Add all files to the FormData
        for (const file of files) {
            formData.append("files", file);
        }
        formData.append("access_role", accessRole);

        try {
            const response = await $fetch<{
                message: string;
                document_id?: string;
                file_name?: string;
                additional_info?: {
                    success: number;
                    failed: number;
                    failed_files?: string[];
                };
            }>("/api/backend/documents", {
                method: "POST",
                body: formData,
            });

            // Extract success/failed counts from response
            const additionalInfo = response.additional_info;
            return {
                success: additionalInfo?.success ?? files.length,
                failed: additionalInfo?.failed ?? 0,
                totalFiles: files.length,
                failedFiles: additionalInfo?.failed_files ?? [],
            };
        } catch (e: unknown) {
            const { extractErrorMessage } = useErrorExtractor();
            const errorMessage = extractErrorMessage(
                e,
                "Failed to upload files.",
            );
            throw new Error(errorMessage);
        }
    }

    /**
     * Main upload function that handles both single files and ZIP archives
     */
    async function uploadFiles(
        input: File | File[],
        accessRole: string,
    ): Promise<UploadResult> {
        loading.value = true;
        error.value = undefined;
        progress.value = {
            current: 0,
            total: 0,
            percentage: 0,
            status: "preparing",
        };

        try {
            let filesToUpload: File[];

            // Handle input - either single file, array of files, or ZIP file
            if (Array.isArray(input)) {
                filesToUpload = input;
            } else if (
                input.name.toLowerCase().endsWith(".zip") ||
                input.type === "application/zip"
            ) {
                // Extract ZIP file
                progress.value.status = "extracting";
                filesToUpload = await extractZipFiles(input);

                if (filesToUpload.length === 0) {
                    throw new Error("No valid files found in ZIP archive");
                }
            } else {
                // Single file
                filesToUpload = [input];
            }

            // Create batches if needed
            const batches = createBatches(filesToUpload);
            progress.value.total = filesToUpload.length;
            progress.value.status = "uploading";

            // Aggregate results across all batches
            let totalSuccess = 0;
            let totalFailed = 0;
            const allFailedFiles: string[] = [];
            let lastBatchError: string | undefined;

            // Upload each batch
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                progress.value.status = `uploading batch ${i + 1} of ${batches.length}`;

                try {
                    const batchResult = await uploadBatch(batch, accessRole);
                    totalSuccess += batchResult.success;
                    totalFailed += batchResult.failed;
                    allFailedFiles.push(...batchResult.failedFiles);
                } catch (batchError) {
                    // If batch fails completely, count all files as failed and preserve error message
                    totalFailed += batch.length;
                    allFailedFiles.push(...batch.map((f) => f.name));

                    // Preserve the batch error message for display
                    if (batchError instanceof Error) {
                        lastBatchError = batchError.message;
                    }
                }

                // Update progress
                progress.value.current = Math.min(
                    progress.value.current + batch.length,
                    progress.value.total,
                );
                progress.value.percentage = Math.round(
                    (progress.value.current / progress.value.total) * 100,
                );
            }

            // If there were batch errors and no successful uploads, set the error for display
            if (totalSuccess === 0 && lastBatchError) {
                error.value = lastBatchError;
            }

            progress.value.status = "completed";

            return {
                success: totalSuccess,
                failed: totalFailed,
                totalFiles: filesToUpload.length,
                failedFiles: allFailedFiles,
            };
        } catch (e: unknown) {
            const { extractErrorMessage } = useErrorExtractor();
            error.value = extractErrorMessage(e, "Failed to upload files.");
            progress.value.status = "error";

            return {
                success: 0,
                failed: Array.isArray(input) ? input.length : 1,
                totalFiles: Array.isArray(input) ? input.length : 1,
                failedFiles: Array.isArray(input)
                    ? input.map((f) => f.name)
                    : [input.name],
            };
        } finally {
            loading.value = false;
        }
    }

    return {
        uploadFiles,
        loading,
        error,
        progress,
    };
};
