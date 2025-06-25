export default defineI18nConfig(() => ({
    legacy: false,
    availableLocales: ["en", "de"],
    locale: "de",
    messages: {
        en: {
            chat: {
                pressEnterToSend: "Press Enter to send",
                send: "Send",
                message: "Message",
                new: "New Chat",
                page: "Page {page} of {num_pages}",
                sources: "Sources",
                document: "Document",
                created_at: "Created at",
                mime_type: "File type",
                exampleQuestions: {
                    title: "Try asking:",
                    clickToAsk: "Click to ask",
                    additionalHelp: "You can ask me about social security.",
                    description:
                        "Click on one of the following questions to start, or enter your own question.",
                    question1:
                        "What can be reimbursed as rent and ancillary costs for homeowners?",
                    category1: "Ancillary costs",
                    question2:
                        "What do I need to consider following an inheritance?",
                    category2: "Inheritance",
                    question3:
                        "Does the salary from the month before support count as income?",
                    category3: "Income",
                },
            },
            navigation: {
                languages: "Languages",
                signOut: "Sign Out",
                title: "AI Chat Bot",
            },
        },

        de: {
            chat: {
                pressEnterToSend:
                    "Drücken Sie Enter, um die Nachricht zu senden",
                send: "Senden",
                message: "Nachricht",
                new: "Neuer Chat",
                sources: "Quellen",
                document: "Dokument",
                page: "Seite {page} von {num_pages}",
                created_at: "Erstellt am",
                mime_type: "Dateityp",
                exampleQuestions: {
                    additionalHelp:
                        "Sie können mir alles zu Sozialversicherung fragen.",
                    clickToAsk: "Klicken Sie, um zu fragen",
                    description:
                        "Klicken Sie auf eine der folgenden Fragen, um zu beginnen, oder geben Sie Ihre eigene Frage ein.",
                    title: "Fragen Sie zum Beispiel:",
                    question1:
                        "Was kann bei Hausbesitzer:innen alles als Miete und Nebenkosten erstattet werden?",
                    category1: "Nebenkosten",
                    question2:
                        "Was muss ich in Folge einer Erbschaft beachten?",
                    category2: "Erbrecht",
                    question3:
                        "Zählt der Lohn aus dem Monat vor Unterstütztung als Einnahme?",
                    category3: "Einkommen",
                },
            },
            navigation: {
                languages: "Sprachen",
                signOut: "Abmelden",
                title: "AI Chat Bot",
            },
        },
    },
}));
