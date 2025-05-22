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
        "@dcc-bs/feedback-control.bs.js",
        "@sidebase/nuxt-auth",
    ],
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
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
            apiBaseUrl: "/api/backend",
        },
        fastapiUrl: process.env.FASTAPI_URL,
        authSecret: process.env.NUXT_AUTH_SECRET,
        googleClientId: process.env.NUXT_GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
        azureAdTenantId: process.env.AZURE_AD_TENANT_ID,
        azureAdClientId: process.env.AZURE_AD_CLIENT_ID,
        azureAdClientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    },
    // localization
    i18n: {
        bundle: {
            optimizeTranslationDirective: false,
        },
        locales: [
            {
                code: "en",
                name: "English",
            },
            {
                code: "de",
                name: "Deutsch",
            },
        ],
        defaultLocale: "de",
        vueI18n: "./i18n.config.ts",
        lazy: true,
        strategy: "prefix_except_default",
    },
    auth: {
        isEnabled: true,
        globalAppMiddleware: true,
        originEnvKey: "AUTH_ORIGIN",
        provider: {
            type: "authjs",
            defaultProvider: "azureAd",
            addDefaultCallbackUrl: true,
        },
        sessionRefresh: {
            // enablePeriodically: true,
            enableOnWindowFocus: true,
        },
    },
    typescript: {
        shim: false, // Recommended for Nuxt 3
    },
});
