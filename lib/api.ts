import { FileEntry } from "./types";

const directoryCache = new Map<string, FileEntry[]>();

export async function fetchDirectory(path: string): Promise<FileEntry[]> {
  const cacheKey = path || "/";

  if (directoryCache.has(cacheKey)) {
    return directoryCache.get(cacheKey)!;
  }

  const params = new URLSearchParams({ path: cacheKey });
  const res = await fetch(`/api/smb/list?${params}`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to list directory (${res.status})`);
  }

  const entries: FileEntry[] = await res.json();
  directoryCache.set(cacheKey, entries);
  return entries;
}

export function invalidateCache(path?: string) {
  if (path) {
    directoryCache.delete(path);
  } else {
    directoryCache.clear();
  }
}

export function isCached(path: string): boolean {
  return directoryCache.has(path || "/");
}

export function downloadFile(path: string) {
  const params = new URLSearchParams({ path });
  const a = document.createElement("a");
  a.href = `/api/smb/download?${params}`;
  a.download = path.split("/").pop() || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadZip(paths: string[]) {
  const res = await fetch("/api/smb/download-zip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to download ZIP");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "archive.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function uploadFile(
  file: File,
  destPath: string,
  onProgress?: (percent: number) => void
): Promise<{ filePath: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/smb/upload?path=${encodeURIComponent(destPath)}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 201) {
        const data = JSON.parse(xhr.responseText);
        invalidateCache(destPath);
        resolve(data);
      } else {
        const data = JSON.parse(xhr.responseText || "{}");
        reject(new Error(data.error || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

export async function deleteFile(path: string): Promise<void> {
  const params = new URLSearchParams({ path });
  const res = await fetch(`/api/smb/delete?${params}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete file");
  }

  // Invalidate parent directory cache
  const parentPath = path.substring(0, path.lastIndexOf("/")) || "/";
  invalidateCache(parentPath);
}

export function getPreviewUrl(path: string): string {
  const params = new URLSearchParams({ path });
  return `/api/smb/preview?${params}`;
}
