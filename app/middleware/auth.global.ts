export default defineNuxtRouteMiddleware((to, from) => {
    // skip middleware on server
    if (import.meta.server) return;

    const { data: session } = useAuth();
    const roles: ComputedRef<string[]> = computed(
        () => (session.value?.user as { roles?: string[] })?.roles ?? [],
    );
    if (!roles && to.path !== "/noaccess") {
        // if roles is empty, redirect to no access page
        return navigateTo("/noaccess");
    }
});
