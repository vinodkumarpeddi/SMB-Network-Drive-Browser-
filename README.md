# SMB File Explorer

A web-based SMB/CIFS network share explorer built with Next.js. Browse, upload, download, preview, and delete files on SMB network shares through your browser.

## Features

- **Directory Browsing**: Lazy-loading tree view with on-demand folder expansion
- **File Downloads**: Single file download with proper MIME types and streaming
- **ZIP Downloads**: Select multiple files and download as a ZIP archive
- **File Upload**: Drag-and-drop upload with progress tracking
- **File Preview**: In-browser preview for images and text files
- **File Deletion**: Delete files from the share
- **Breadcrumb Navigation**: Navigate directory hierarchy easily
- **Client-side Caching**: Directory listings are cached to avoid redundant API calls
- **Path Traversal Protection**: Server-side path sanitization prevents directory traversal attacks
- **SSR-safe**: File browser loads client-side only to prevent hydration errors

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for the test SMB server)

## Quick Start

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd smb-explorer
npm install
```

### 2. Start the SMB test server

```bash
docker-compose up -d samba
```

Wait for the samba service to become healthy:

```bash
docker-compose ps
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your SMB server credentials. The defaults work with the provided Docker Compose setup:

```ini
SMB_HOST=localhost
SMB_PORT=445
SMB_SHARE=share
SMB_USERNAME=user
SMB_PASSWORD=pass
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Compose Setup

The `docker-compose.yml` includes two services:

- **samba**: A Samba server with a pre-configured user and share, includes a healthcheck
- **app**: The Next.js application (optional, for containerized deployment)

To run everything in Docker:

```bash
docker-compose up -d
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/smb/list?path=/` | GET | List directory contents |
| `/api/smb/download?path=/file.txt` | GET | Download a single file |
| `/api/smb/download-zip` | POST | Download multiple files as ZIP (body: `{ "paths": [...] }`) |
| `/api/smb/upload?path=/` | POST | Upload a file (multipart/form-data) |
| `/api/smb/delete?path=/file.txt` | DELETE | Delete a file |
| `/api/smb/preview?path=/file.txt` | GET | Preview a file inline |

## Error Handling

- **401/403**: Authentication failures return `{ "error": "Authentication failed. Please check your credentials." }`
- **404**: Missing files/paths return `{ "error": "Path not found." }`
- **500**: Server errors return descriptive error messages

## Project Structure

```
├── components/          # React UI components
│   ├── FileBrowser.tsx  # Main file browser container
│   ├── TreeView.tsx     # Lazy-loading directory tree
│   ├── Breadcrumb.tsx   # Breadcrumb navigation
│   ├── FileDetailPanel.tsx  # File info side panel
│   ├── FileIcon.tsx     # File type icons
│   └── UploadArea.tsx   # Drag-and-drop upload
├── lib/
│   ├── smb-client.ts    # Server-side SMB client wrapper
│   ├── api.ts           # Client-side API helpers with caching
│   └── types.ts         # Shared TypeScript types
├── pages/
│   ├── api/smb/         # API routes
│   │   ├── list.ts
│   │   ├── download.ts
│   │   ├── download-zip.ts
│   │   ├── upload.ts
│   │   ├── delete.ts
│   │   └── preview.ts
│   ├── _app.tsx
│   └── index.tsx        # Main page (dynamic import, SSR disabled)
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

## Security

- All file paths are sanitized on the server to prevent path traversal attacks
- SMB credentials are stored in environment variables, never exposed to the client
- The `.env.local` file is gitignored to prevent credential leaks

## Tech Stack

- **Next.js 14** (Pages Router)
- **TypeScript**
- **Tailwind CSS** for styling
- **@marsaud/smb2** for SMB protocol
- **archiver** for ZIP generation
- **formidable** for file upload parsing
- **lucide-react** for icons
