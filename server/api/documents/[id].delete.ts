export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");

    const handler = defineBackendHandler({
        url: `/documents/${id}`,
        method: "DELETE",
    });

    return await handler(event);
});
