import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    // Check if the user is authenticated and has the Writer role
    if (!(session?.user as { roles?: string[] })?.roles?.includes("Writer")) {
        throw createError({
            statusCode: 401,
            statusMessage: "Unauthorized",
        });
    }
    const id = getRouterParam(event, "id");

    const handler = defineBackendHandler({
        url: `/documents/${id}`,
        method: "DELETE",
    });

    return await handler(event);
});
