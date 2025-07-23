interface ApiError {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    data?: {
        originalError?: unknown;
    };
}

interface UseApiErrorReturn {
    handleApiError: (error: unknown, fallbackMessage?: string) => string;
    extractErrorMessage: (error: unknown, fallbackMessage?: string) => string;
}

/**
 * Unified API error handling composable
 * Handles common HTTP status codes and provides consistent error messages
 * 
 * @example Basic usage in a composable:
 * ```typescript
 * export const useMyApiComposable = () => {
 *     const loading = ref(false);
 *     const error = ref<string | undefined>(undefined);
 *     
 *     async function performApiCall() {
 *         loading.value = true;
 *         error.value = undefined;
 *         
 *         try {
 *             const result = await $fetch('/api/some-endpoint');
 *             return result;
 *         } catch (e: unknown) {
 *             const { handleApiError } = useApiError();
 *             error.value = handleApiError(e, "Failed to perform operation.");
 *             return null;
 *         } finally {
 *             loading.value = false;
 *         }
 *     }
 *     
 *     return { loading, error, performApiCall };
 * };
 * ```
 * 
 * @example For stream processing or when you don't want toasts:
 * ```typescript
 * try {
 *     // API call that might fail
 * } catch (e: unknown) {
 *     const { extractErrorMessage } = useApiError();
 *     const errorMessage = extractErrorMessage(e, "Stream processing failed");
 *     // Handle the error message without showing a toast
 * }
 * ```
 */
export const useApiError = (): UseApiErrorReturn => {
    const toast = useToast();
    const { t } = useI18n();

    /**
     * Extract error message from various error types
     */
    function extractErrorMessage(error: unknown, fallbackMessage = "An unexpected error occurred"): string {
        // Handle null/undefined
        if (!error) {
            return fallbackMessage;
        }

        // Handle API errors with structure from createError
        if (typeof error === 'object' && error !== null) {
            const apiError = error as ApiError;
            
            // Use message from error if available
            if (apiError.message) {
                return apiError.message;
            }
            
            // Use statusMessage if available
            if (apiError.statusMessage) {
                return apiError.statusMessage;
            }
        }

        // Handle Error objects
        if (error instanceof Error) {
            return error.message;
        }

        // Handle string errors
        if (typeof error === 'string') {
            return error;
        }

        // Fallback for any other type
        return fallbackMessage;
    }

    /**
     * Get user-friendly message for HTTP status codes
     */
    function getStatusCodeMessage(statusCode: number): string {
        switch (statusCode) {
            case 400:
                return t("errors.badRequest", "Invalid request. Please check your input.");
            case 401:
                return t("errors.unauthorized", "You are not authorized to perform this action.");
            case 403:
                return t("errors.forbidden", "Access denied. You don't have permission for this action.");
            case 404:
                return t("errors.notFound", "The requested item could not be found.");
            case 409:
                return t("errors.conflict", "This action conflicts with the current state.");
            case 422:
                return t("errors.validationError", "Validation failed. Please check your input.");
            case 429:
                return t("errors.tooManyRequests", "Too many requests. Please try again later.");
            case 500:
                return t("errors.serverError", "Oops, something went wrong on our end.");
            case 502:
                return t("errors.badGateway", "Service temporarily unavailable.");
            case 503:
                return t("errors.serviceUnavailable", "Service is currently unavailable.");
            case 504:
                return t("errors.gatewayTimeout", "Request timed out. Please try again.");
            default:
                return t("errors.generic", "An unexpected error occurred.");
        }
    }

    /**
     * Get toast type for different status codes
     */
    function getToastType(statusCode: number): "success" | "error" | "warning" | "info" {
        if (statusCode >= 400 && statusCode < 500) {
            return statusCode === 401 || statusCode === 403 ? "warning" : "error";
        }
        if (statusCode >= 500) {
            return "error";
        }
        return "error";
    }

    /**
     * Show toast notification for error
     */
    function showErrorToast(statusCode: number, message: string): void {
        const toastType = getToastType(statusCode);
        
        toast.add({
            title: t("errors.title", "Error"),
            description: message,
            color: toastType,
        });
    }

    /**
     * Main error handling function that extracts errors, shows toasts, and returns user-friendly messages
     */
    function handleApiError(error: unknown, fallbackMessage = "An unexpected error occurred"): string {
        let statusCode = 500; // Default to server error
        let errorMessage = fallbackMessage;

        // Extract status code and message from API error
        if (typeof error === 'object' && error !== null) {
            const apiError = error as ApiError;
            
            if (apiError.statusCode) {
                statusCode = apiError.statusCode;
            }
            
            // Get appropriate message based on status code
            errorMessage = getStatusCodeMessage(statusCode);
            
            // If the API provided a specific message and it's not a generic server error, use it
            if (apiError.message && statusCode !== 500) {
                errorMessage = apiError.message;
            }
        } else {
            // For non-API errors, extract message but treat as 500
            errorMessage = extractErrorMessage(error, fallbackMessage);
        }

        // Show toast notification
        showErrorToast(statusCode, errorMessage);

        // Return the error message for component-level error state
        return errorMessage;
    }

    return {
        handleApiError,
        extractErrorMessage,
    };
};

// Legacy export for backwards compatibility
export const useUseApiError = useApiError;
