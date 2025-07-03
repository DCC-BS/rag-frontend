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
                sourcesCount: "{count} document | {count} documents",
                error: {
                    title: "Message could not be sent",
                    sendMessage: "Please sign in again and try again.",
                },
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
                documents: "Documents",
            },
            documents: {
                title: "Documents",
                description: "Manage and view your accessible documents",
                loading: "Loading documents...",
                errorTitle: "Error Loading Documents",
                tryAgain: "Try Again",
                searchPlaceholder: "Search documents by title...",
                deselectAll: "Deselect All",
                selectAll: "Select All",
                addDocument: "Add Document",
                refresh: "Refresh",
                selected: "{count} selected",
                clearSelection: "Clear selection",
                deleteSelected:
                    "Delete {count} document | Delete {count} documents",
                searchMatch:
                    "{count} of {total} document found | {count} of {total} documents found",
                searchMatch_plural:
                    "{count} of {total} documents match your search",
                available:
                    "{count} document available | {count} documents available",
                noDocumentsTitle: "No Documents Found",
                noDocumentsDescription:
                    "You don't have access to any documents yet. Upload your first document to get started.",
                uploadFirst: "Upload Your First Document",
                noResultsTitle: "No Matching Documents",
                noResultsDescription:
                    'No documents found matching "{query}". Try adjusting your search terms.',
                clearSearch: "Clear Search",
                deleteModalTitle: "Delete Document | Delete {count} Documents",
                deleteModalMessage:
                    'Are you sure you want to delete "{fileName}"? This action cannot be undone.',
                deleteModalMessage_plural:
                    "Are you sure you want to delete {count} documents? This action cannot be undone.",
                cancel: "Cancel",
                delete: "Delete",
                deleteSuccessTitle: "Document Deleted",
                deleteSuccessDescription:
                    '"{fileName}" has been successfully deleted.',
                deleteErrorTitle: "Deletion Failed",
                deleteErrorDescription:
                    'Failed to delete "{fileName}". Please try again.',
                deleteMultipleSuccessTitle: "Documents Deleted",
                deleteMultipleSuccessDescription:
                    "{count} document successfully deleted. | {count} documents successfully deleted.",
                deleteMultiplePartialSuccessTitle: "Partial Success",
                deleteMultiplePartialSuccessDescription:
                    "{successCount} document deleted successfully, {failedCount} failed. | {successCount} documents deleted successfully, {failedCount} failed.",
                deleteMultipleErrorTitle: "Deletion Failed",
                deleteMultipleErrorDescription:
                    "Failed to delete {count} document. Please try again. | Failed to delete {count} documents. Please try again.",
                refreshErrorTitle: "Refresh Failed",
                refreshErrorDescription:
                    "Document was uploaded but failed to refresh the list. Please refresh manually.",
                downloading: "Downloading...",
                loadingDocument: "Loading document...",
                deleting: "Deleting...",
                updating: "Updating...",
                processing: "Processing...",
                clickToView: "Click to view",
                clickToDownload: "Click to download",
                updateDocument: "Update document",
                deleteDocument: "Delete document",
                documentId: "Document ID",
                pages: "Pages",
                page: "page",
                accessRoles: "Access Roles",
                documentPath: "Document Path",
                failedToLoad: "Failed to Load Document",
                unableToLoad: 'Unable to load "{fileName}". Please try again.',
                downloadStarted: "Download Started",
                downloadInitiated: '"{fileName}" download initiated.',
                downloadFailed: "Download Failed",
                failedToDownload:
                    'Failed to download "{fileName}". Please try again.',
                operationFailed: "Operation Failed",
                failedTo:
                    'Failed to {operation} "{fileName}". Please try again.',
                load: "load",
                uploadTitle: "Upload New Document",
                uploadDescription: "Add a new document to your collection",
                selectFile: "Select File *",
                file: "File",
                fileSize: "File size",
                chooseFile: "Choose a document to upload",
                accessRole: "Access Role *",
                selectAccessRole: "Select an access role",
                availableOrganizations:
                    "Choose from your available organizations",
                noOrganizations:
                    "No organizations available for access control",
                uploading: "Uploading...",
                uploadDocument: "Upload Document",
                validationError: "Validation Error",
                validationErrorDescription:
                    "Please select a file and access role before uploading.",
                authError: "Authentication Error",
                authErrorDescription: "Please refresh the page and try again.",
                uploadFailed: "Upload Failed",
                uploadErrorDescription:
                    "Failed to upload document. Please try again.",
                uploadErrorUnexpected:
                    "An unexpected error occurred during upload.",
                updateTitle: "Update Document",
                updateDescription:
                    'Replace the file and update access role for "{fileName}"',
                selectNewFile: "Select New File *",
                updatingDoc: "Updating...",
                updateSuccessTitle: "Document Updated Successfully",
                updateSuccessDescription:
                    '"{fileName}" has been updated. Changes will be reflected in the application within 15 minutes.',
                updateFailed: "Update Failed",
                updateFailedDescription:
                    "Failed to update document. Please try again.",
                uploadSuccessTitle: "Document Updated Successfully",
                uploadSuccessDescription:
                    '"{fileName}" has been updated. Changes will be reflected in the application within 15 minutes.',
                fileSizeError: "File Too Large",
                fileSizeErrorDescription:
                    "The selected file ({fileSize}) exceeds the maximum allowed size of {maxSize}.",
                maxFileSize: "Max size: {size}",
                closeViewer: "Close PDF viewer",
                loadingPdf: "Loading PDF...",
                failedToLoadPdf: "Failed to load PDF",
                retry: "Retry",
                zoomIn: "Zoom in",
                zoomOut: "Zoom out",
                resetZoom: "Reset zoom",
                download: "Download",
                previous: "Previous",
                next: "Next",
                pageOf: "Page {currentPage} of {totalPages}",
                selectForDeletion: "Select for multi-delete",
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
                sourcesCount: "{count} Dokument | {count} Dokumente",
                error: {
                    title: "Nachricht konnte nicht gesendet werden",
                    sendMessage:
                        "Bitte melden Sie sich erneut an und versuchen Sie es erneut.",
                },
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
                documents: "Dokumente",
            },
            documents: {
                title: "Dokumente",
                description:
                    "Verwalten und betrachten Sie Ihre hinterlegten Dokumente",
                loading: "Dokumente werden geladen...",
                errorTitle: "Fehler beim Laden der Dokumente",
                tryAgain: "Erneut versuchen",
                searchPlaceholder: "Dokumente nach Titel durchsuchen...",
                deselectAll: "Auswahl aufheben",
                selectAll: "Alle auswählen",
                addDocument: "Dokument hinzufügen",
                refresh: "Aktualisieren",
                selected: "{count} ausgewählt",
                clearSelection: "Auswahl löschen",
                deleteSelected:
                    "{count} Dokument löschen | {count} Dokumente löschen",
                searchMatch:
                    "{count} von {total} Dokument gefunden | {count} von {total} Dokumenten gefunden",
                searchMatch_plural:
                    "{count} von {total} Dokumenten entsprechen Ihrer Suche",
                available:
                    "{count} Dokument verfügbar | {count} Dokumente verfügbar",
                noDocumentsTitle: "Keine Dokumente gefunden",
                noDocumentsDescription:
                    "Sie haben noch keinen Zugriff auf Dokumente. Laden Sie Ihr erstes Dokument hoch, um zu beginnen.",
                uploadFirst: "Laden Sie Ihr erstes Dokument hoch",
                noResultsTitle: "Keine passenden Dokumente",
                noResultsDescription:
                    'Keine Dokumente gefunden, die mit "{query}" übereinstimmen. Versuchen Sie, Ihre Suchbegriffe anzupassen.',
                clearSearch: "Suche löschen",
                deleteModalTitle:
                    "Dokument löschen | {count} Dokumente löschen",
                deleteModalMessage:
                    'Sind Sie sicher, dass Sie "{fileName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
                deleteModalMessage_plural:
                    "Sind Sie sicher, dass Sie {count} Dokumente löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
                cancel: "Abbrechen",
                delete: "Löschen",
                deleteSuccessTitle: "Dokument gelöscht",
                deleteSuccessDescription:
                    '"{fileName}" wurde erfolgreich gelöscht.',
                deleteErrorTitle: "Löschen fehlgeschlagen",
                deleteErrorDescription:
                    'Das Löschen von "{fileName}" ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
                deleteMultipleSuccessTitle: "Dokumente gelöscht",
                deleteMultipleSuccessDescription:
                    "{count} Dokument erfolgreich gelöscht. | {count} Dokumente erfolgreich gelöscht.",
                deleteMultiplePartialSuccessTitle: "Teilweiser Erfolg",
                deleteMultiplePartialSuccessDescription:
                    "{successCount} Dokument erfolgreich gelöscht, {failedCount} fehlgeschlagen. | {successCount} Dokumente erfolgreich gelöscht, {failedCount} fehlgeschlagen.",
                deleteMultipleErrorTitle: "Löschen fehlgeschlagen",
                deleteMultipleErrorDescription:
                    "Das Löschen von {count} Dokument ist fehlgeschlagen. Bitte versuchen Sie es erneut. | Das Löschen von {count} Dokumenten ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
                refreshErrorTitle: "Aktualisierung fehlgeschlagen",
                refreshErrorDescription:
                    "Das Dokument wurde hochgeladen, aber die Liste konnte nicht aktualisiert werden. Bitte aktualisieren Sie manuell.",
                downloading: "Wird heruntergeladen...",
                loadingDocument: "Dokument wird geladen...",
                deleting: "Wird gelöscht...",
                updating: "Wird aktualisiert...",
                processing: "Wird verarbeitet...",
                clickToView: "Klicken zum Anzeigen",
                clickToDownload: "Klicken zum Herunterladen",
                updateDocument: "Dokument aktualisieren",
                deleteDocument: "Dokument löschen",
                documentId: "Dokumenten-ID",
                pages: "Seiten",
                page: "Seite",
                accessRoles: "Zugriffsrollen",
                documentPath: "Dokumentenpfad",
                failedToLoad: "Dokument konnte nicht geladen werden",
                unableToLoad:
                    'Konnte "{fileName}" nicht laden. Bitte versuchen Sie es erneut.',
                downloadStarted: "Download gestartet",
                downloadInitiated:
                    'Der Download von "{fileName}" wurde gestartet.',
                downloadFailed: "Download fehlgeschlagen",
                failedToDownload:
                    'Der Download von "{fileName}" ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
                operationFailed: "Operation fehlgeschlagen",
                failedTo:
                    'Konnte "{fileName}" nicht {operation}. Bitte versuchen Sie es erneut.',
                load: "laden",
                uploadTitle: "Neues Dokument hochladen",
                uploadDescription:
                    "Fügen Sie Ihrer Sammlung ein neues Dokument hinzu",
                selectFile: "Datei auswählen *",
                file: "Datei",
                fileSize: "Dateigrösse",
                chooseFile: "Wählen Sie ein Dokument zum Hochladen",
                accessRole: "Zugriffsrolle *",
                selectAccessRole: "Wählen Sie eine Zugriffsrolle",
                availableOrganizations:
                    "Wählen Sie aus Ihren verfügbaren Organisationen",
                noOrganizations:
                    "Keine Organisationen für die Zugriffskontrolle verfügbar",
                uploading: "Wird hochgeladen...",
                uploadDocument: "Dokument hochladen",
                validationError: "Validierungsfehler",
                validationErrorDescription:
                    "Bitte wählen Sie eine Datei und eine Zugriffsrolle vor dem Hochladen aus.",
                authError: "Authentifizierungsfehler",
                authErrorDescription:
                    "Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.",
                uploadFailed: "Hochladen fehlgeschlagen",
                uploadErrorDescription:
                    "Das Hochladen des Dokuments ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
                uploadErrorUnexpected:
                    "Beim Hochladen ist ein unerwarteter Fehler aufgetreten.",
                updateTitle: "Dokument aktualisieren",
                updateDescription:
                    'Ersetzen Sie die Datei und aktualisieren Sie die Zugriffsrolle für "{fileName}"',
                selectNewFile: "Neue Datei auswählen *",
                updatingDoc: "Wird aktualisiert...",
                updateSuccessTitle: "Dokument erfolgreich aktualisiert",
                updateSuccessDescription:
                    '"{fileName}" wurde aktualisiert. Änderungen werden innerhalb von 15 Minuten in der Anwendung sichtbar sein.',
                updateFailed: "Aktualisierung fehlgeschlagen",
                updateFailedDescription:
                    "Das Aktualisieren des Dokuments ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
                uploadSuccessTitle: "Dokument erfolgreich aktualisiert",
                uploadSuccessDescription:
                    '"{fileName}" wurde aktualisiert. Änderungen werden innerhalb von 15 Minuten in der Anwendung sichtbar sein.',
                fileSizeError: "Datei zu gross",
                fileSizeErrorDescription:
                    "Die ausgewählte Datei ({fileSize}) überschreitet die maximal zulässige Grösse von {maxSize}.",
                maxFileSize: "Max. Grösse: {size}",
                closeViewer: "PDF-Viewer schliessen",
                loadingPdf: "PDF wird geladen...",
                failedToLoadPdf: "PDF konnte nicht geladen werden",
                retry: "Erneut versuchen",
                zoomIn: "Vergrössern",
                zoomOut: "Verkleinern",
                resetZoom: "Zoom zurücksetzen",
                download: "Herunterladen",
                previous: "Zurück",
                next: "Weiter",
                pageOf: "Seite {currentPage} von {totalPages}",
                selectForDeletion: "Für Mehrfachlöschung auswählen",
            },
        },
    },
}));
