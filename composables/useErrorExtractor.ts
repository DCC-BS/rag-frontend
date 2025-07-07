interface NuxtError {
    error?: boolean;
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    data?: {
        error?: boolean;
        statusCode?: number;
        statusMessage?: string;
        message?: string;
        data?: {
            detail?: string;
        };
    };
}

/**
 * Utility composable to extract user-friendly error messages from various error formats
 * Handles Nuxt/H3 errors, fetch errors, and generic Error objects
 */
export const useErrorExtractor = () => {
    /**
     * Extract a clean error message from various error formats
     * @param error - The error object to extract message from
     * @param fallbackMessage - Default message if no specific message found
     * @returns Clean, user-friendly error message
     */
    function extractErrorMessage(
        error: unknown,
        fallbackMessage = "An unexpected error occurred"
    ): string {
        // Handle null/undefined
        if (!error) {
            return fallbackMessage;
        }

        // Handle string errors
        if (typeof error === "string") {
            return error;
        }

        // Handle objects (including Error instances that may have additional properties)
        if (typeof error === "object") {
            const nuxtError = error as NuxtError & Error;

            // Priority 1: data.data.detail (most specific backend error) - works for FetchError too
            if (nuxtError.data?.data?.detail) {
                return nuxtError.data.data.detail;
            }

            // Priority 2: message property (but skip generic ones)
            if (
                nuxtError.message &&
                nuxtError.message !== "Bad Request" &&
                !nuxtError.message.includes("[POST]") &&
                !nuxtError.message.includes("[GET]") &&
                !nuxtError.message.includes("[PUT]") &&
                !nuxtError.message.includes("[DELETE]")
            ) {
                return nuxtError.message;
            }

            // Priority 3: statusMessage
            if (
                nuxtError.statusMessage &&
                nuxtError.statusMessage !== "Bad Request"
            ) {
                return nuxtError.statusMessage;
            }

            // Priority 4: fallback to Error.message for Error instances (if no better option)
            if (error instanceof Error) {
                return nuxtError.message;
            }
        }

        return fallbackMessage;
    }

    return {
        extractErrorMessage,
    };
};
