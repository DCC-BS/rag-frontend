# rag-frontend

[![Build & Test](https://github.com/DCC-BS/rag-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/DCC-BS/rag-frontend/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/DCC-BS/rag-frontend/graph/badge.svg?token=BYAB6V1C8B)](https://codecov.io/gh/DCC-BS/rag-frontend)

# RAG Frontend

A modern Vue.js/Nuxt.js frontend for document management and RAG (Retrieval-Augmented Generation) functionality.

## Features

### Document Upload
- **Single PDF Upload**: Upload individual PDF documents
- **Bulk ZIP Upload**: Upload multiple PDF files at once by packaging them in a ZIP archive
  - Automatically extracts and processes each PDF file in the ZIP
  - Provides detailed feedback on upload success/failure for each file
  - Supports nested folders within ZIP archives
  - Validates each file to ensure it's a valid PDF

### Document Management
- View, download, and manage uploaded documents
- Access control with organization-based permissions
- Document metadata and search functionality

## Bulk Upload Usage

1. **Prepare your documents**: Package multiple PDF files into a ZIP archive
2. **Upload the ZIP**: Select the ZIP file in the upload modal
3. **Monitor progress**: The system will extract and upload each PDF individually
4. **Review results**: Get detailed feedback on successful uploads and any failures

### Supported File Types
- **PDF**: Individual PDF documents
- **ZIP**: Archives containing multiple PDF files

## Technical Implementation

The bulk upload feature works by:
1. Frontend detects ZIP files and uses the bulk upload endpoint
2. Server-side extraction using `adm-zip` library
3. Each PDF is validated and uploaded individually to the backend
4. Comprehensive error handling and progress reporting

## Dependencies

- **Frontend**: Vue.js, Nuxt.js, TypeScript
- **Backend Processing**: Node.js with `adm-zip` for ZIP extraction
- **Authentication**: Nuxt Auth for session management
- **UI**: Nuxt UI components with Tailwind CSS
