import React from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
} from "lucide-react";

interface FileIconProps {
  type: "file" | "directory";
  name: string;
  expanded?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-[18px] h-[18px]",
  md: "w-5 h-5",
  lg: "w-8 h-8",
};

const bgMap = {
  amber: "bg-amber-50 text-amber-500",
  emerald: "bg-emerald-50 text-emerald-500",
  purple: "bg-purple-50 text-purple-500",
  pink: "bg-pink-50 text-pink-500",
  sky: "bg-sky-50 text-sky-500",
  orange: "bg-orange-50 text-orange-500",
  green: "bg-green-50 text-green-600",
  slate: "bg-slate-50 text-slate-500",
  gray: "bg-slate-50 text-slate-400",
};

export function FileIcon({ type, name, expanded, size = "sm" }: FileIconProps) {
  const iconCls = sizeMap[size];

  if (size === "lg") {
    return <FileIconLarge type={type} name={name} expanded={expanded} />;
  }

  if (type === "directory") {
    return expanded ? (
      <FolderOpen className={`${iconCls} text-amber-500 flex-shrink-0`} />
    ) : (
      <Folder className={`${iconCls} text-amber-500 flex-shrink-0`} />
    );
  }

  const ext = name.split(".").pop()?.toLowerCase() || "";
  const { Icon, color } = getIconInfo(ext);
  return <Icon className={`${iconCls} ${color} flex-shrink-0`} />;
}

function FileIconLarge({ type, name, expanded }: { type: string; name: string; expanded?: boolean }) {
  if (type === "directory") {
    const FolderIcon = expanded ? FolderOpen : Folder;
    return (
      <div className={`p-2 rounded-xl ${bgMap.amber}`}>
        <FolderIcon className="w-7 h-7" />
      </div>
    );
  }

  const ext = name.split(".").pop()?.toLowerCase() || "";
  const { Icon, bg } = getIconInfo(ext);
  return (
    <div className={`p-2 rounded-xl ${bg}`}>
      <Icon className="w-7 h-7" />
    </div>
  );
}

function getIconInfo(ext: string) {
  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"];
  const videoExts = ["mp4", "avi", "mkv", "mov", "wmv", "flv"];
  const audioExts = ["mp3", "wav", "ogg", "flac", "aac"];
  const codeExts = ["js", "ts", "tsx", "jsx", "py", "java", "c", "cpp", "h", "css", "html", "json", "xml", "yaml", "yml"];
  const archiveExts = ["zip", "tar", "gz", "rar", "7z"];
  const spreadsheetExts = ["csv", "xls", "xlsx"];
  const textExts = ["txt", "md", "log", "rtf"];

  if (imageExts.includes(ext)) return { Icon: FileImage, color: "text-emerald-500", bg: bgMap.emerald };
  if (videoExts.includes(ext)) return { Icon: FileVideo, color: "text-purple-500", bg: bgMap.purple };
  if (audioExts.includes(ext)) return { Icon: FileAudio, color: "text-pink-500", bg: bgMap.pink };
  if (codeExts.includes(ext)) return { Icon: FileCode, color: "text-sky-500", bg: bgMap.sky };
  if (archiveExts.includes(ext)) return { Icon: FileArchive, color: "text-orange-500", bg: bgMap.orange };
  if (spreadsheetExts.includes(ext)) return { Icon: FileSpreadsheet, color: "text-green-600", bg: bgMap.green };
  if (textExts.includes(ext)) return { Icon: FileText, color: "text-slate-500", bg: bgMap.slate };
  return { Icon: File, color: "text-slate-400", bg: bgMap.gray };
}
