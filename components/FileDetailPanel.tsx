import React, { useState, useEffect } from "react";
import { FileEntry } from "@/lib/types";
import { getPreviewUrl } from "@/lib/api";
import { FileIcon } from "./FileIcon";
import { X, Download, Eye, Calendar, HardDrive, MapPin, FileType, ExternalLink } from "lucide-react";

interface FileDetailPanelProps {
  entry: FileEntry;
  path: string;
  onClose: () => void;
  onDownload: () => void;
}

const previewableImages = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"];
const previewableText = ["txt", "md", "log", "csv", "json", "xml", "yaml", "yml", "js", "ts", "tsx", "jsx", "py", "java", "c", "cpp", "h", "css", "html"];

export function FileDetailPanel({
  entry,
  path,
  onClose,
  onDownload,
}: FileDetailPanelProps) {
  const ext = entry.name.split(".").pop()?.toLowerCase() || "";
  const isImage = previewableImages.includes(ext);
  const isText = previewableText.includes(ext);
  const canPreview = isImage || isText;
  const [textContent, setTextContent] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    if (isText) {
      fetch(getPreviewUrl(path))
        .then((res) => res.text())
        .then((text) => setTextContent(text.slice(0, 5000)))
        .catch(() => setTextContent(null));
    } else {
      setTextContent(null);
    }
  }, [path, isText]);

  return (
    <div className="w-[400px] glass border border-white/60 rounded-2xl shadow-lg shadow-slate-200/50 flex-shrink-0 overflow-hidden animate-fade-in-right">
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50" />
        <div className="relative px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-700 text-sm tracking-wide uppercase">Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/80 rounded-lg transition-all duration-200 hover:shadow-sm"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* File identity */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <FileIcon type={entry.type} name={entry.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-slate-800 truncate leading-tight">
              {entry.name}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wider">
              {ext || "Unknown"} file
            </p>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetaCard
            icon={<HardDrive className="w-3.5 h-3.5" />}
            label="Size"
            value={formatBytes(entry.size)}
            color="blue"
          />
          <MetaCard
            icon={<Calendar className="w-3.5 h-3.5" />}
            label="Modified"
            value={new Date(entry.lastModified).toLocaleDateString()}
            color="purple"
          />
          <MetaCard
            icon={<FileType className="w-3.5 h-3.5" />}
            label="Type"
            value={(ext || "unknown").toUpperCase()}
            color="emerald"
          />
          <MetaCard
            icon={<MapPin className="w-3.5 h-3.5" />}
            label="Location"
            value={path.substring(0, path.lastIndexOf("/")) || "/"}
            color="amber"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={onDownload}
            className="flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          {canPreview && (
            <a
              href={getPreviewUrl(path)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:-translate-y-0.5 transition-all duration-200 text-sm font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          )}
        </div>

        {/* Image preview */}
        {isImage && (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)_50%/16px_16px]">
            {!imgLoaded && (
              <div className="h-48 animate-shimmer rounded-xl" />
            )}
            <img
              src={getPreviewUrl(path)}
              alt={entry.name}
              className={`w-full h-auto max-h-72 object-contain transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0 h-0"}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}

        {/* Text preview */}
        {isText && textContent !== null && (
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preview</span>
              <a
                href={getPreviewUrl(path)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
              >
                Full view
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <pre className="p-4 text-xs text-slate-600 overflow-auto max-h-72 bg-white font-mono leading-relaxed whitespace-pre-wrap break-all">
              {textContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "purple" | "emerald" | "amber";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-500",
    purple: "bg-purple-50 text-purple-500",
    emerald: "bg-emerald-50 text-emerald-500",
    amber: "bg-amber-50 text-amber-500",
  };

  return (
    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`p-1 rounded-md ${colorMap[color]}`}>{icon}</span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
