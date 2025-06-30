import type { User, UserResponse } from "~/models/user";

interface UseUserReturn {
    user: Ref<User | undefined>;
    loading: Ref<boolean>;
    error: Ref<string | undefined>;
    fetchUser: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

// Global state for user data (shared across all instances)
const globalUser = ref<User | undefined>(undefined);
const globalLoading = ref<boolean>(false);
const globalError = ref<string | undefined>(undefined);

/**
 * Composable for managing authenticated user data
 * Fetches user information from /users/me endpoint and provides reactive state
 */
export const useUser = (): UseUserReturn => {
    /**
     * Fetch user data from the API
     */
    async function fetchUser(): Promise<void> {
        // Skip if already loading
        if (globalLoading.value) {
            return;
        }

        globalLoading.value = true;
        globalError.value = undefined;

        try {
            const response = await $fetch<UserResponse>(
                "/api/backend/users/me",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            globalUser.value = response;
        } catch (e: unknown) {
            console.error("Error fetching user data:", e);
            let errorMessage = "Failed to fetch user information.";

            // Handle 401 errors by clearing user data to allow re-authentication
            if (
                e &&
                typeof e === "object" &&
                "status" in e &&
                e.status === 401
            ) {
                console.warn("User authentication expired, clearing user data");
                globalUser.value = undefined;
                errorMessage =
                    "Authentication expired. Please refresh the page.";
            } else if (e instanceof Error) {
                errorMessage = e.message;
            } else if (typeof e === "string") {
                errorMessage = e;
            } else if (
                typeof e === "object" &&
                e !== null &&
                "message" in e &&
                typeof (e as { message: unknown }).message === "string"
            ) {
                errorMessage = (e as { message: string }).message;
            }

            globalError.value = errorMessage;
        } finally {
            globalLoading.value = false;
        }
    }

    /**
     * Refresh user data (force refetch)
     */
    async function refreshUser(): Promise<void> {
        if (globalLoading.value) {
            return;
        }
        await fetchUser();
    }

    return {
        user: globalUser,
        loading: globalLoading,
        error: globalError,
        fetchUser,
        refreshUser,
    };
};
