export default defineI18nConfig(() => ({
    legacy: false,
    availableLocales: ["en", "de"],
    locale: "de",
    messages: {
        en: {
            chat: {
                title: "AI Chat Bot",
                new: "New Chat",
                send: "Send",
                message: "Message",
                pressEnterToSend: "Press Enter to send",
                sources: "Sources",
                document: "Document",
                page: "Page {page} of {num_pages}",
                created_at: "Created at",
                mime_type: "File type",
                sourcesCount: "{count} document | {count} documents",
                error: {
                    title: "Message could not be sent",
                    sendMessage: "Please sign in again and try again.",
                    newChat: "Could not start a new chat. Please try again.",
                    exampleQuestion:
                        "Could not send the example question. Please try again",
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
                title: "AI Chat Bot",
                documents: "Documents",
                languages: "Languages",
                signOut: "Sign Out",
            },
            documents: {
                // Page
                title: "Documents",
                description: "Manage and view your accessible documents",

                // States
                loading: "Loading documents...",
                downloading: "Downloading...",
                deleting: "Deleting...",
                updating: "Updating...",
                processing: "Processing...",
                uploading: "Uploading...",
                loadingDocument: "Loading document...",

                // Actions
                addDocument: "Add Document",
                refresh: "Refresh",
                tryAgain: "Try Again",
                cancel: "Cancel",
                delete: "Delete",
                clearSearch: "Clear Search",
                uploadFirst: "Upload Your First Document",
                deselectAll: "Deselect All",
                selectAll: "Select All",
                clearSelection: "Clear selection",
                deleteSelected:
                    "Delete {count} document | Delete {count} documents",
                clickToView: "Click to view",
                clickToDownload: "Click to download",
                selectForDeletion: "Select for multi-delete",
                updateDocument: "Update document",
                deleteDocument: "Delete document",

                // Search and Filter
                searchPlaceholder: "Search documents by title...",
                searchMatch_plural:
                    "{count} of {total} documents match your search",
                available:
                    "{count} document available | {count} documents available",
                selected: "{count} selected",

                // Empty States
                noDocumentsTitle: "No Documents Found",
                noDocumentsDescription:
                    "You don't have access to any documents yet. Upload your first document to get started.",
                noResultsTitle: "No Matching Documents",
                noResultsDescription:
                    'No documents found matching "{query}". Try adjusting your search terms.',
                noContent: "No content available",

                // Properties
                documentId: "Document ID",
                pages: "Pages",
                page: "page",
                accessRoles: "Access Roles",
                file: "File",
                fileSize: "File size",

                // Delete Modal
                deleteModalTitle: "Delete Document | Delete {count} Documents",
                deleteModalMessage:
                    'Are you sure you want to delete "{fileName}"? This action cannot be undone.',
                deleteModalMessage_plural:
                    "Are you sure you want to delete {count} documents? This action cannot be undone.",

                // Success Messages
                deleteSuccessTitle: "Document Deleted",
                deleteSuccessDescription:
                    '"{fileName}" has been successfully deleted.',
                deleteMultipleSuccessTitle: "Documents Deleted",
                deleteMultipleSuccessDescription:
                    "{count} document successfully deleted. | {count} documents successfully deleted.",
                deleteMultiplePartialSuccessTitle: "Partial Success",
                deleteMultiplePartialSuccessDescription:
                    "{successCount} document deleted successfully, {failedCount} failed. | {successCount} documents deleted successfully, {failedCount} failed.",
                downloadStarted: "Download Started",
                downloadInitiated: '"{fileName}" download initiated.',
                uploadSuccessTitle: "Document Uploaded Successfully",
                uploadSuccessDescription:
                    '"{fileName}" has been uploaded successfully.',
                updateSuccessTitle: "Document Updated Successfully",
                updateSuccessDescription:
                    '"{fileName}" has been updated. Changes will be reflected in the application within 15 minutes.',
                batchUploadSuccessTitle: "Files Uploaded Successfully",
                batchUploadSuccessDescription:
                    "Successfully uploaded {successCount} of {totalCount} files.",
                batchUploadPartialSuccessTitle: "Upload Partially Completed",
                batchUploadPartialSuccessDescription:
                    "Uploaded {successCount} files successfully, {failedCount} failed.",

                // Error Messages
                errorTitle: "Error Loading Documents",
                refreshErrorTitle: "Refresh Failed",
                refreshErrorDescription:
                    "Document was uploaded but failed to refresh the list. Please refresh manually.",
                deleteErrorTitle: "Deletion Failed",
                deleteErrorDescription:
                    'Failed to delete "{fileName}". Please try again.',
                deleteMultipleErrorTitle: "Deletion Failed",
                deleteMultipleErrorDescription:
                    "Failed to delete {count} document. Please try again. | Failed to delete {count} documents. Please try again.",
                failedToLoad: "Failed to Load Document",
                unableToLoad: 'Unable to load "{fileName}". Please try again.',
                downloadFailed: "Download Failed",
                failedToDownload:
                    'Failed to download "{fileName}". Please try again.',
                operationFailed: "Operation Failed",
                failedTo:
                    'Failed to {operation} "{fileName}". Please try again.',
                load: "load",
                download: "download",
                validationError: "Validation Error",
                validationErrorDescription:
                    "Please select a file and access role before uploading.",
                authError: "Authentication Error",
                authErrorDescription: "Please refresh the page and try again.",
                uploadFailed: "Upload Failed",
                uploadErrorDescription:
                    "Failed to upload document. Please try again.",
                uploadErrorWithDetails: "Failed to upload document: {details}",
                uploadErrorUnexpected:
                    "An unexpected error occurred during upload.",
                updateFailed: "Update Failed",
                updateFailedDescription:
                    "Failed to update document. Please try again.",
                updateFailedWithDetails: "Failed to update document: {details}",
                fileSizeError: "File Too Large",
                fileSizeErrorDescription:
                    "The selected file ({fileSize}) exceeds the maximum allowed size of {maxSize}.",
                zipExtractionError: "ZIP Extraction Failed",
                zipExtractionErrorDescription:
                    "Failed to extract files from ZIP archive. Please ensure the file is a valid ZIP format.",
                batchUploadFailedTitle: "Upload Failed",
                batchUploadFailedDescription:
                    "Failed to upload files: {errorMessage}",

                // Upload/Update Form
                uploadTitle: "Upload New Document",
                uploadDescription: "Add a new document to your collection",
                updateTitle: "Update Document",
                updateDescription:
                    'Replace the file and update access role for "{fileName}"',
                selectFile: "Select File *",
                selectNewFile: "Select New File *",
                chooseFile: "Choose a document to upload",
                accessRole: "Access Role *",
                selectAccessRole: "Select an access role",
                availableOrganizations:
                    "Choose from your available organizations",
                noOrganizations:
                    "No organizations available for access control",
                uploadDocument: "Upload Document",
                supportedFormats: "Supported formats",
                maxFileSize: "Max size: {size}",

                // Batch Upload Progress
                progressExtracting: "Extracting ZIP file...",
                progressPreparing: "Preparing upload...",
                progressUploading: "Uploading files...",
                progressCompleted: "Upload completed",
                progressBatch: "Uploading batch {current} of {total}",
                failedFilesList: "Failed files",
                andMore: "and {count} more",

                // PDF Viewer
                closeViewer: "Close PDF viewer",
                failedToLoadPdf: "Failed to load PDF",
                retry: "Retry",
                zoomIn: "Zoom in",
                zoomOut: "Zoom out",
                resetZoom: "Reset zoom",
                previous: "Previous",
                next: "Next",
                pageOf: "Page {currentPage} of {totalPages}",
            },
        },

        de: {
            chat: {
                title: "KI-Chatbot",
                new: "Neuer Chat",
                send: "Senden",
                message: "Nachricht",
                pressEnterToSend:
                    "Drücken Sie Enter, um die Nachricht zu senden",
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
                    newChat:
                        "Neuer Chat konnte nicht gestartet werden. Bitte versuchen Sie es erneut.",
                    exampleQuestion:
                        "Beispielfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
                },
                exampleQuestions: {
                    title: "Fragen Sie zum Beispiel:",
                    clickToAsk: "Klicken Sie, um zu fragen",
                    additionalHelp:
                        "Sie können mir alles zu Sozialversicherung fragen.",
                    description:
                        "Klicken Sie auf eine der folgenden Fragen, um zu beginnen, oder geben Sie Ihre eigene Frage ein.",
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
                title: "KI-Chatbot",
                documents: "Dokumente",
                languages: "Sprachen",
                signOut: "Abmelden",
            },
            documents: {
                // Page
                title: "Dokumente",
                description:
                    "Verwalten und betrachten Sie Ihre hinterlegten Dokumente",

                // States
                loading: "Dokumente werden geladen...",
                downloading: "Wird heruntergeladen...",
                deleting: "Wird gelöscht...",
                updating: "Wird aktualisiert...",
                processing: "Wird verarbeitet...",
                uploading: "Wird hochgeladen...",
                loadingDocument: "Dokument wird geladen...",

                // Actions
                addDocument: "Dokument hinzufügen",
                refresh: "Aktualisieren",
                tryAgain: "Erneut versuchen",
                cancel: "Abbrechen",
                delete: "Löschen",
                clearSearch: "Suche löschen",
                uploadFirst: "Laden Sie Ihr erstes Dokument hoch",
                deselectAll: "Auswahl aufheben",
                selectAll: "Alle auswählen",
                clearSelection: "Auswahl löschen",
                deleteSelected:
                    "{count} Dokument löschen | {count} Dokumente löschen",
                clickToView: "Klicken zum Anzeigen",
                clickToDownload: "Klicken zum Herunterladen",
                selectForDeletion: "Für Mehrfachlöschung auswählen",
                updateDocument: "Dokument aktualisieren",
                deleteDocument: "Dokument löschen",

                // Search and Filter
                searchPlaceholder: "Dokumente nach Titel durchsuchen...",
                searchMatch_plural:
                    "{count} von {total} Dokumenten entsprechen Ihrer Suche",
                available:
                    "{count} Dokument verfügbar | {count} Dokumente verfügbar",
                selected: "{count} ausgewählt",

                // Empty States
                noDocumentsTitle: "Keine Dokumente gefunden",
                noDocumentsDescription:
                    "Sie haben noch keinen Zugriff auf Dokumente. Laden Sie Ihr erstes Dokument hoch, um zu beginnen.",
                noResultsTitle: "Keine passenden Dokumente",
                noResultsDescription:
                    'Keine Dokumente gefunden, die mit "{query}" übereinstimmen. Versuchen Sie, Ihre Suchbegriffe anzupassen.',
                noContent: "Kein Inhalt verfügbar",

                // Properties
                documentId: "Dokumenten-ID",
                pages: "Seiten",
                page: "Seite",
                accessRoles: "Zugriffsrollen",
                file: "Datei",
                fileSize: "Dateigrösse",

                // Delete Modal
                deleteModalTitle:
                    "Dokument löschen | {count} Dokumente löschen",
                deleteModalMessage:
                    'Sind Sie sicher, dass Sie "{fileName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
                deleteModalMessage_plural:
                    "Sind Sie sicher, dass Sie {count} Dokumente löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",

                // Success Messages
                deleteSuccessTitle: "Dokument gelöscht",
                deleteSuccessDescription:
                    '"{fileName}" wurde erfolgreich gelöscht.',
                deleteMultipleSuccessTitle: "Dokumente gelöscht",
                deleteMultipleSuccessDescription:
                    "{count} Dokument erfolgreich gelöscht. | {count} Dokumente erfolgreich gelöscht.",
                deleteMultiplePartialSuccessTitle: "Teilweiser Erfolg",
                deleteMultiplePartialSuccessDescription:
                    "{successCount} Dokument erfolgreich gelöscht, {failedCount} fehlgeschlagen. | {successCount} Dokumente erfolgreich gelöscht, {failedCount} fehlgeschlagen.",
                downloadStarted: "Download gestartet",
                downloadInitiated:
                    'Der Download von "{fileName}" wurde gestartet.',
                uploadSuccessTitle: "Dokument erfolgreich hochgeladen",
                uploadSuccessDescription:
                    '"{fileName}" wurde erfolgreich hochgeladen.',
                updateSuccessTitle: "Dokument erfolgreich aktualisiert",
                updateSuccessDescription:
                    '"{fileName}" wurde aktualisiert. Änderungen werden innerhalb von 15 Minuten in der Anwendung sichtbar sein.',
                batchUploadSuccessTitle: "Dateien erfolgreich hochgeladen",
                batchUploadSuccessDescription:
                    "{successCount} von {totalCount} Dateien erfolgreich hochgeladen.",
                batchUploadPartialSuccessTitle:
                    "Upload teilweise abgeschlossen",
                batchUploadPartialSuccessDescription:
                    "{successCount} Dateien erfolgreich hochgeladen, {failedCount} fehlgeschlagen.",

                // Error Messages
                errorTitle: "Fehler beim Laden der Dokumente",
                refreshErrorTitle: "Aktualisierung fehlgeschlagen",
                refreshErrorDescription:
                    "Das Dokument wurde hochgeladen, aber die Liste konnte nicht aktualisiert werden. Bitte aktualisieren Sie manuell.",
                deleteErrorTitle: "Löschen fehlgeschlagen",
                deleteErrorDescription:
                    'Das Löschen von "{fileName}" ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
                deleteMultipleErrorTitle: "Löschen fehlgeschlagen",
                deleteMultipleErrorDescription:
                    "Das Löschen von {count} Dokument ist fehlgeschlagen. Bitte versuchen Sie es erneut. | Das Löschen von {count} Dokumenten ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
                failedToLoad: "Dokument konnte nicht geladen werden",
                unableToLoad:
                    'Konnte "{fileName}" nicht laden. Bitte versuchen Sie es erneut.',
                downloadFailed: "Download fehlgeschlagen",
                failedToDownload:
                    'Der Download von "{fileName}" ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
                operationFailed: "Operation fehlgeschlagen",
                failedTo:
                    'Konnte "{fileName}" nicht {operation}. Bitte versuchen Sie es erneut.',
                load: "laden",
                download: "herunterladen",
                validationError: "Validierungsfehler",
                validationErrorDescription:
                    "Bitte wählen Sie eine Datei und eine Zugriffsrolle vor dem Hochladen aus.",
                authError: "Authentifizierungsfehler",
                authErrorDescription:
                    "Bitte aktualisieren Sie die Seite und versuchen Sie es erneut.",
                uploadFailed: "Hochladen fehlgeschlagen",
                uploadErrorDescription:
                    "Das Hochladen des Dokuments ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
                uploadErrorWithDetails:
                    "Das Hochladen des Dokuments ist fehlgeschlagen: {details}",
                uploadErrorUnexpected:
                    "Beim Hochladen ist ein unerwarteter Fehler aufgetreten.",
                updateFailed: "Aktualisierung fehlgeschlagen",
                updateFailedDescription:
                    "Das Aktualisieren des Dokuments ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
                updateFailedWithDetails:
                    "Das Aktualisieren des Dokuments ist fehlgeschlagen: {details}",
                fileSizeError: "Datei zu gross",
                fileSizeErrorDescription:
                    "Die ausgewählte Datei ({fileSize}) überschreitet die maximal zulässige Grösse von {maxSize}.",
                zipExtractionError: "ZIP-Entpackung fehlgeschlagen",
                zipExtractionErrorDescription:
                    "Das Entpacken der Dateien aus dem ZIP-Archiv ist fehlgeschlagen. Bitte stellen Sie sicher, dass die Datei ein gültiges ZIP-Format hat.",
                batchUploadFailedTitle: "Upload fehlgeschlagen",
                batchUploadFailedDescription:
                    "Das Hochladen der Dateien ist fehlgeschlagen: {errorMessage}",

                // Upload/Update Form
                uploadTitle: "Neues Dokument hochladen",
                uploadDescription:
                    "Fügen Sie Ihrer Sammlung ein neues Dokument hinzu",
                updateTitle: "Dokument aktualisieren",
                updateDescription:
                    'Ersetzen Sie die Datei und aktualisieren Sie die Zugriffsrolle für "{fileName}"',
                selectFile: "Datei auswählen *",
                selectNewFile: "Neue Datei auswählen *",
                chooseFile: "Wählen Sie ein Dokument zum Hochladen",
                accessRole: "Zugriffsrolle *",
                selectAccessRole: "Wählen Sie eine Zugriffsrolle",
                availableOrganizations:
                    "Wählen Sie aus Ihren verfügbaren Organisationen",
                noOrganizations:
                    "Keine Organisationen für die Zugriffskontrolle verfügbar",
                uploadDocument: "Dokument hochladen",
                supportedFormats: "Unterstützte Dateiformate",
                maxFileSize: "Max. Grösse: {size}",

                // Batch Upload Progress
                progressExtracting: "ZIP-Datei wird entpackt...",
                progressPreparing: "Upload wird vorbereitet...",
                progressUploading: "Dateien werden hochgeladen...",
                progressCompleted: "Upload abgeschlossen",
                progressBatch: "Lade Batch {current} von {total} hoch",
                failedFilesList: "Fehlgeschlagene Dateien",
                andMore: "und {count} weitere",

                // PDF Viewer
                closeViewer: "PDF-Viewer schliessen",
                failedToLoadPdf: "PDF konnte nicht geladen werden",
                retry: "Erneut versuchen",
                zoomIn: "Vergrössern",
                zoomOut: "Verkleinern",
                resetZoom: "Zoom zurücksetzen",
                previous: "Zurück",
                next: "Weiter",
                pageOf: "Seite {currentPage} von {totalPages}",
            },
        },
    },
}));
