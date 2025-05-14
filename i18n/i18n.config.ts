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
            },
            navigation: {
                languages: "Sprachen",
                signOut: "Abmelden",
            },
        },
    },
}));
