export default defineEventHandler(async (event) => {
    const { query, limit } = getQuery(event);

    let queryParams = "";
    if (query && typeof query === "string") {
        queryParams = `?query=${query}`;
    }
    if (limit && typeof limit === "string") {
        queryParams += `&limit=${limit}`;
    }

    const handler = defineBackendHandler({
        url: `/documents${queryParams}`,
        method: "GET",
    });
    return await handler(event);
});
