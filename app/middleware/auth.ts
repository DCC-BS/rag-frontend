export default defineNuxtRouteMiddleware((to, _from) => {
    // Skip middleware on server to avoid hydration issues
    if (import.meta.server) return;

    try {
        const { data: session } = useAuth();
        const roles: ComputedRef<string[]> = computed(
            () => (session.value?.user as { roles?: string[] })?.roles ?? [],
        );

        // Check if user has any roles (authenticated)
        if (roles.value.length === 0) {
            // Avoid infinite redirect loop by checking if we're already going to noaccess
            if (to.path !== "/noaccess") {
                console.log(
                    "Auth middleware: Redirecting to /noaccess - no user roles found",
                );
                return navigateTo("/noaccess");
            }
        }
    } catch (error) {
        // If auth check fails, log error and redirect to no access page
        console.error("Auth middleware error:", error);
        if (to.path !== "/noaccess") {
            return navigateTo("/noaccess");
        }
    }
});
