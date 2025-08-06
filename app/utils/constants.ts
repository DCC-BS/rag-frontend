/**
 * Application constants for the RAG Frontend
 * Centralized location for all hardcoded values to improve maintainability
 */

// ===== localStorage Keys =====
export const STORAGE_KEYS = {
    /** Key for storing selected document IDs on documents page */
    DOCUMENTS_SELECTION: "documents-selection",
    /** Key for storing selected documents for chat functionality */
    CHAT_SELECTED_DOCUMENTS: "chat-selected-documents",
} as const;

// ===== Document Selection Limits =====
export const SELECTION_LIMITS = {
    /** Maximum number of documents that can be selected for chat (useDocumentSelection) */
    MAX_CHAT_SELECTION: 5,
    /** Maximum number of document IDs to store in localStorage */
    MAX_SELECTION_COUNT: 50,
} as const;

// ===== File Upload Limits =====
export const FILE_LIMITS = {
    /** Maximum number of files that can be uploaded at once */
    MAX_FILES: 10,
    /** Maximum file size per individual file (50MB in bytes) */
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    /** Maximum total batch size for uploads (500MB in bytes) */
    MAX_BATCH_SIZE: 500 * 1024 * 1024,
} as const;

// ===== Search and Pagination Limits =====
export const SEARCH_LIMITS = {
    /** Default search results limit */
    DEFAULT_SEARCH_LIMIT: 10,
    /** Maximum search results limit enforced by API */
    MAX_SEARCH_LIMIT: 20,
    /** Items per page for grid view pagination */
    GRID_ITEMS_PER_PAGE: 12,
    /** Items per page for document selection drawer */
    DRAWER_ITEMS_PER_PAGE: 10,
    /** Items per page for search results in drawer */
    DRAWER_SEARCH_ITEMS_PER_PAGE: 20,
} as const;

// ===== File Types =====
export const FILE_TYPES = {
    /** Allowed file extensions for document upload */
    ALLOWED_EXTENSIONS: [".pdf", ".zip", ".docx", ".pptx", ".html"] as const,
} as const;

// ===== Storage Limits =====
export const STORAGE_LIMITS = {
    /** Maximum JSON string length for localStorage (~50KB) */
    MAX_STORAGE_SIZE: 50000,
} as const;

// ===== Error Display Limits =====
export const ERROR_LIMITS = {
    /** Maximum number of validation errors to show in toast */
    MAX_VALIDATION_ERRORS_DISPLAYED: 3,
} as const;

// ===== Timing Constants =====
export const TIMING = {
    /** Auto-scroll completion delay in milliseconds */
    AUTO_SCROLL_DELAY: 100,
    /** DOM update delay for scroll operations in milliseconds */
    DOM_UPDATE_DELAY: 10,
    /** Drawer animation completion delay in milliseconds */
    DRAWER_ANIMATION_DELAY: 150,
    /** Download popup timeout in milliseconds */
    DOWNLOAD_POPUP_TIMEOUT: 1000,
} as const;

// ===== UI Layout Constants =====
export const UI_LAYOUT = {
    /** Scroll threshold in pixels from bottom to trigger auto-scroll */
    SCROLL_THRESHOLD: 100,
    /** Default zoom level percentage for document viewer */
    DEFAULT_ZOOM_LEVEL: 100,
    /** Download popup window width */
    DOWNLOAD_POPUP_WIDTH: 800,
    /** Download popup window height */
    DOWNLOAD_POPUP_HEIGHT: 600,
} as const;

// ===== Processing Constants =====
export const PROCESSING = {
    /** Maximum files per batch for upload processing */
    MAX_FILES_PER_BATCH: 100,
    /** Kilobyte conversion factor */
    BYTES_PER_KB: 1024,
    /** Maximum filename length in characters */
    MAX_FILENAME_LENGTH: 255,
    /** ASCII control character range end */
    ASCII_CONTROL_CHAR_END: 32,
} as const;

// ===== Animation Constants =====
export const ANIMATION = {
    /** First dot animation delay in seconds */
    DOT_ANIMATION_DELAY_1: "0.2s",
    /** Second dot animation delay in seconds */
    DOT_ANIMATION_DELAY_2: "0.4s",
} as const;
