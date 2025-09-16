import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    // Check if the user is authenticated
    if (!session?.user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Authentication required",
        });
    }

    // Check if the user has the Writer role
    const userRoles = (session.user as { roles?: string[] })?.roles || [];
    if (!Array.isArray(userRoles) || !userRoles.includes("Writer")) {
        throw createError({
            statusCode: 403,
            statusMessage: "Insufficient permissions",
        });
    }
    const id = getRouterParam(event, "id");

    const handler = defineBackendHandler({
        url: `/documents/${id}`,
        method: "DELETE",
    });

    return await handler(event);
});
