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
        "@dcc-bs/authentication.bs.js",
        "@nuxt/ui",
        "@nuxtjs/i18n",
        "@nuxtjs/mdc",
        "@dcc-bs/common-ui.bs.js",
        "@dcc-bs/logger.bs.js",
        "@dcc-bs/feedback-control.bs.js",
    ],
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    // // Configure components to scan nested directories
    components: [
        {
            path: "~/components",
            pathPrefix: false,
        },
    ],
    "feedback-control.bs.js": {
        repo: "Feedback",
        owner: "DCC-BS",
        project: "RAG-Frontend",
        githubToken: process.env.GITHUB_TOKEN,
    },
    runtimeConfig: {
        public: {
            logger_bs: {
                loglevel: process.env.LOG_LEVEL ?? "debug",
            },
        },
        apiUrl: process.env.FASTAPI_URL,
    },
    // localization
    i18n: {
        locales: [
            {
                code: "en",
                name: "English",
                file: "en.json",
            },
            {
                code: "de",
                name: "Deutsch",
                file: "de.json",
            },
        ],
        defaultLocale: "de",
        strategy: "prefix_except_default",
    },
    imports: {
        dirs: [
            "composables",
            "composables/*/index.{ts,js,mjs,mts}",
            "composables/**/*.{ts,js,mjs,mts}",
        ],
    },
});
