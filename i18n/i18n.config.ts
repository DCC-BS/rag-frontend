export default defineI18nConfig(() => ({
    legacy: false,
    availableLocales: ["en", "de"],
    locale: "de",
    messages: {
        en: {
            chat: {
                title: "Chat",
                send: "Send",
                message: "Message",
                new: "New Chat",
                page: "Page",
                sources: "Sources",
            },
            navigation: {
                languages: "Languages",
                signOut: "Sign Out",
            },
        },

        de: {
            chat: {
                title: "Chat",
                send: "Senden",
                message: "Nachricht",
                new: "Neuer Chat",
                page: "Seite",
                sources: "Quellen",
            },
            navigation: {
                languages: "Sprachen",
                signOut: "Abmelden",
            },
        },
    },
}));
