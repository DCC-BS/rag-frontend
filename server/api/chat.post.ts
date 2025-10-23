export default defineBackendHandler({
    url: "/chat",
    method: "POST",
    fetcher: async ({ url, method, body, headers }) => {
        console.log("body", body);
        return await fetch(url, {
            method,
            body: JSON.stringify(body),
            headers,
        });
    },
});
