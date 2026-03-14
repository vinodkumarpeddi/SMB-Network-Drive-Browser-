export interface FileEntry {
  name: string;
  type: "file" | "directory";
  size: number;
  lastModified: string;
}
