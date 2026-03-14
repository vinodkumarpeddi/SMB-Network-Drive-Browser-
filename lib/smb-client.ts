import SMB2 from "@marsaud/smb2";

export interface FileEntry {
  name: string;
  type: "file" | "directory";
  size: number;
  lastModified: string;
}

function sanitizePath(inputPath: string): string {
  // Normalize slashes to backslashes for SMB
  let normalized = (inputPath || "").replace(/\\/g, "/");
  // Remove any double slashes
  normalized = normalized.replace(/\/+/g, "/");
  // Resolve path traversal
  const parts = normalized.split("/");
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      resolved.pop();
    } else if (part !== "." && part !== "") {
      resolved.push(part);
    }
  }
  return resolved.join("\\");
}

export function getSMBClient(): SMB2 {
  const host = process.env.SMB_HOST || "localhost";
  const share = process.env.SMB_SHARE || "share";
  const port = parseInt(process.env.SMB_PORT || "445", 10);

  return new SMB2({
    share: `\\\\${host}\\${share}`,
    port,
    domain: "WORKGROUP",
    username: process.env.SMB_USERNAME || "",
    password: process.env.SMB_PASSWORD || "",
    autoCloseTimeout: 5000,
  });
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
  const client = getSMBClient();
  try {
    const smbPath = sanitizePath(path);
    const files = await client.readdir(smbPath, { stats: true });

    return (files as any[])
      .filter((f: any) => f.name !== "." && f.name !== ".." && !f.name.startsWith("."))
      .map((f: any) => ({
        name: f.name,
        type: f.isDirectory() ? ("directory" as const) : ("file" as const),
        size: Number(f.size || 0),
        lastModified: f.mtime
          ? new Date(f.mtime).toISOString()
          : new Date().toISOString(),
      }));
  } finally {
    client.disconnect();
  }
}

export async function readFileFromShare(
  path: string
): Promise<Buffer> {
  const client = getSMBClient();
  try {
    const smbPath = sanitizePath(path);
    if (!smbPath) throw new Error("Path is required");
    const content = await client.readFile(smbPath);
    return Buffer.isBuffer(content) ? content : Buffer.from(content);
  } finally {
    client.disconnect();
  }
}

export async function readFileStream(
  path: string
): Promise<{ stream: NodeJS.ReadableStream; client: SMB2 }> {
  const client = getSMBClient();
  const smbPath = sanitizePath(path);
  if (!smbPath) throw new Error("Path is required");
  const stream = await client.createReadStream(smbPath);
  return { stream, client };
}

export async function getFileStats(
  path: string
): Promise<{ size: number; mtime: Date }> {
  const client = getSMBClient();
  try {
    const smbPath = sanitizePath(path);
    if (!smbPath) throw new Error("Path is required");

    // List the parent directory to get stats for the file
    const parts = smbPath.split("\\");
    const fileName = parts.pop()!;
    const parentPath = parts.length > 0 ? parts.join("\\") : "";

    const files = await client.readdir(parentPath, { stats: true });
    const file = (files as any[]).find(
      (f: any) => f.name === fileName
    );

    if (!file) throw new Error("File not found");

    return {
      size: Number(file.size || 0),
      mtime: file.mtime ? new Date(file.mtime) : new Date(),
    };
  } finally {
    client.disconnect();
  }
}

export async function writeFileToShare(
  path: string,
  data: Buffer
): Promise<void> {
  const client = getSMBClient();
  try {
    const smbPath = sanitizePath(path);
    if (!smbPath) throw new Error("Path is required");
    await client.writeFile(smbPath, data);
  } finally {
    client.disconnect();
  }
}

export async function deleteFileFromShare(path: string): Promise<void> {
  const client = getSMBClient();
  try {
    const smbPath = sanitizePath(path);
    if (!smbPath) throw new Error("Path is required");
    await client.unlink(smbPath);
  } finally {
    client.disconnect();
  }
}

export function getSanitizedPath(path: string): string {
  return sanitizePath(path);
}

export function isAuthError(error: any): boolean {
  const msg = (error?.message || "").toLowerCase();
  const code = (error?.code || "").toUpperCase();
  return (
    msg.includes("status_logon_failure") ||
    msg.includes("authentication failed") ||
    msg.includes("logon failure") ||
    code === "STATUS_LOGON_FAILURE"
  );
}

export function isAccessDeniedError(error: any): boolean {
  const msg = (error?.message || "").toLowerCase();
  const code = (error?.code || "").toUpperCase();
  return (
    msg.includes("access denied") ||
    msg.includes("status_access_denied") ||
    code === "STATUS_ACCESS_DENIED"
  );
}

export function isNotFoundError(error: any): boolean {
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("status_object_name_not_found") ||
    msg.includes("status_no_such_file") ||
    msg.includes("not found") ||
    msg.includes("no_such_file") ||
    msg.includes("object_name_not_found") ||
    msg.includes("status_object_path_not_found") ||
    error?.code === "STATUS_OBJECT_NAME_NOT_FOUND" ||
    error?.code === "STATUS_NO_SUCH_FILE"
  );
}
