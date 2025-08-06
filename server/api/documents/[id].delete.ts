import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);

    // Check if the user is authenticated
    if (!session?.user) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
        });
    }

    // Check if the user has the Writer role
    const user = session.user as { roles?: string[] };
    if (!user.roles?.includes("Writer")) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden - Writer role required",
        });
    }
    const id = getRouterParam(event, "id");

    const handler = defineBackendHandler({
        url: `/documents/${id}`,
        method: "DELETE",
    });

    return await handler(event);
});
