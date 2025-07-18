export interface UserDocument {
    id: number;
    file_name: string;
    document_path: string;
    mime_type: string;
    num_pages: number;
    created_at: string;
    access_roles: string[];
    page?: number;
}

export interface DocumentsResponse {
    documents: UserDocument[];
    total_count: number;
}

export interface DocumentUploadResponse {
    message: string;
    document_id?: string;
    file_name?: string;
    additional_info?: {
        success: number;
        failed: number;
        failed_files?: string[];
    };
}
