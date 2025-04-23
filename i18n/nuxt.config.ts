// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    // Define app head configuration
    app: {
        head: {
            titleTemplate: "rag-frontend",
            htmlAttrs: {
                lang: "de",
            },
            meta: [
                { charset: "utf-8" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    name: "apple-mobile-web-app-title",
                    content: "rag-frontend",
                },
                { name: "application-name", content: "rag-frontend" },
                { name: "msapplication-config", content: "/browserconfig.xml" },
            ],
        },
    },
    ui: {
        colorMode: false,
    },
    modules: [
        "@nuxt/ui",
        "@nuxtjs/i18n",
        "@dcc-bs/common-ui.bs.js",
        "@dcc-bs/logger.bs.js",
    ],
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    // localization
    i18n: {
        locales: ["en", "de"],
        defaultLocale: "de",
        vueI18n: "./i18n.config.ts",
        lazy: true,
    },
});
