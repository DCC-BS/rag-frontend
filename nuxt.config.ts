// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    title: "Bebbi-Bot",
    // Define app head configuration
    app: {
        head: {
            title: "Bebbi-Bot",
            htmlAttrs: {
                lang: "de",
            },
            link: [
                {
                    rel: "icon",
                    type: "image/png",
                    href: "/favicon-192x192.png",
                    sizes: "192x192",
                },
                {
                    rel: "icon",
                    type: "image/png",
                    href: "/favicon-512x512.png",
                    sizes: "512x512",
                },
                {
                    rel: "icon",
                    type: "image/png",
                    href: "/favicon-32x32.png",
                    sizes: "32x32",
                },
                { rel: "shortcut icon", href: "/favicon.ico" },
                {
                    rel: "apple-touch-icon",
                    sizes: "180x180",
                    href: "/apple-touch-icon.png",
                },
            ],
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
        githubToken: process.env.GITHUB_TOKEN,
        public: {
            logger_bs: {
                loglevel: process.env.LOG_LEVEL ?? "debug",
            },
        },
        apiUrl: process.env.API_URL,
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
        strategy: "no_prefix",
    },
    imports: {
        dirs: [
            "composables",
            "composables/*/index.{ts,js,mjs,mts}",
            "composables/**/*.{ts,js,mjs,mts}",
        ],
    },
    viewport: {
        breakpoints: {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            "2xl": 1536,
        },
        defaultBreakpoints: {
            desktop: "lg",
            mobile: "xs",
            tablet: "md",
        },
        fallbackBreakpoint: "lg",
    },
});
