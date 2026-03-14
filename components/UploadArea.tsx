import React, { useState, useCallback, useRef } from "react";
import { uploadFile } from "@/lib/api";
import { Upload, CheckCircle, AlertCircle, CloudUpload, Sparkles } from "lucide-react";

interface UploadAreaProps {
  currentPath: string;
  onUploadComplete: () => void;
}

export function UploadArea({ currentPath, onUploadComplete }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setUploading(true);
      setProgress(0);
      setStatus("idle");

      try {
        for (let i = 0; i < files.length; i++) {
          await uploadFile(files[i], currentPath, (pct) => {
            setProgress(pct);
          });
        }
        setStatus("success");
        setStatusMessage(`${files.length} file(s) uploaded successfully`);
        onUploadComplete();
        setTimeout(() => setStatus("idle"), 4000);
      } catch (err: any) {
        setStatus("error");
        setStatusMessage(err.message || "Upload failed");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [currentPath, onUploadComplete]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleUpload(e.dataTransfer.files);
    },
    [handleUpload]
  );

  return (
    <div className="mt-5">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.01] shadow-xl shadow-blue-100/50"
            : uploading
            ? "border-blue-300 bg-blue-50/30"
            : "border-slate-200 bg-white/60 hover:border-blue-300 hover:bg-slate-50/80 hover:shadow-md"
        }`}
      >
        {/* Decorative gradient blobs */}
        {isDragging && (
          <>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-200 rounded-full opacity-20 blur-2xl" />
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />

        {uploading ? (
          <div className="relative animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <Upload className="w-7 h-7 text-blue-600 animate-bounce" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              Uploading files...
            </p>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              {progress}%
            </p>
            <div className="w-56 mx-auto bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300 ease-out progress-glow"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragging
                ? "bg-gradient-to-br from-blue-200 to-indigo-200 scale-110"
                : "bg-gradient-to-br from-slate-100 to-slate-50"
            }`}>
              <CloudUpload className={`w-7 h-7 transition-colors duration-300 ${
                isDragging ? "text-blue-600" : "text-slate-400"
              }`} />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">
              {isDragging ? "Release to upload" : "Drop files here to upload"}
            </p>
            <p className="text-xs text-slate-400">
              or{" "}
              <span className="text-blue-500 font-semibold hover:text-blue-600 underline underline-offset-2 decoration-blue-200">
                browse your computer
              </span>
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 rounded-full">
              <MapPinIcon />
              <span className="text-[11px] font-medium text-slate-400">
                Uploading to <span className="font-mono text-slate-500">{currentPath}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div className="mt-3 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl text-sm text-emerald-700 font-medium animate-fade-in shadow-sm">
          <div className="p-1 bg-emerald-100 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          {statusMessage}
          <Sparkles className="w-4 h-4 text-emerald-400 ml-auto" />
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-xl text-sm text-red-700 font-medium animate-fade-in shadow-sm">
          <div className="p-1 bg-red-100 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          {statusMessage}
        </div>
      )}
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
