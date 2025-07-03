// Document types for documents page
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
