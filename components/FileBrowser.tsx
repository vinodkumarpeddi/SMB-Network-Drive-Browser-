import React, { useState, useCallback } from "react";
import { FileEntry } from "@/lib/types";
import { TreeView } from "./TreeView";
import { Breadcrumb } from "./Breadcrumb";
import { FileDetailPanel } from "./FileDetailPanel";
import { UploadArea } from "./UploadArea";
import { downloadFile, downloadZip, deleteFile, invalidateCache } from "@/lib/api";
import { Download, Trash2, X, AlertTriangle, Package } from "lucide-react";

export default function FileBrowser() {
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedFile, setSelectedFile] = useState<{
    entry: FileEntry;
    path: string;
  } | null>(null);
  const [checkedFiles, setCheckedFiles] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigate = useCallback((path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
  }, []);

  const handleFileSelect = useCallback(
    (entry: FileEntry, fullPath: string) => {
      setSelectedFile({ entry, path: fullPath });
    },
    []
  );

  const handleCheck = useCallback((fullPath: string, checked: boolean) => {
    setCheckedFiles((prev) => {
      const next = new Set(prev);
      if (checked) next.add(fullPath);
      else next.delete(fullPath);
      return next;
    });
  }, []);

  const handleDownloadSelected = useCallback(async () => {
    if (checkedFiles.size === 0) return;
    try {
      setError(null);
      await downloadZip(Array.from(checkedFiles));
      setCheckedFiles(new Set());
    } catch (err: any) {
      setError(err.message);
    }
  }, [checkedFiles]);

  const handleDeleteSelected = useCallback(async () => {
    if (checkedFiles.size === 0) return;
    if (!confirm(`Delete ${checkedFiles.size} file(s)?`)) return;
    try {
      setError(null);
      for (const path of checkedFiles) {
        await deleteFile(path);
      }
      setCheckedFiles(new Set());
      invalidateCache();
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(err.message);
    }
  }, [checkedFiles]);

  const handleUploadComplete = useCallback(() => {
    invalidateCache();
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div data-test-id="file-browser-container" className="flex gap-6 animate-fade-in">
      <div className="flex-1 min-w-0">
        <Breadcrumb path={currentPath} onNavigate={handleNavigate} />

        {/* Error banner */}
        {error && (
          <div className="mb-5 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/80 rounded-2xl flex items-start gap-3 shadow-sm animate-fade-in">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">Something went wrong</p>
              <p className="text-sm text-red-600/80 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}

        {/* Selection toolbar */}
        {checkedFiles.size > 0 && (
          <div className="mb-5 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/60 rounded-2xl shadow-sm shadow-blue-100/50 animate-fade-in">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/30">
              {checkedFiles.size}
            </div>
            <span className="text-sm font-medium text-blue-800 flex-1">
              file{checkedFiles.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleDownloadSelected}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Package className="w-3.5 h-3.5" />
              Download ZIP
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              onClick={() => setCheckedFiles(new Set())}
              className="p-2 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <X className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        )}

        {/* File table */}
        <div className="bg-white/80 glass border border-white/60 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50">
          {/* Column headers */}
          <div className="px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-slate-50/40">
            <div className="flex items-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="w-6" />
              <span className="w-5 ml-1" />
              <span className="flex-1 ml-3">Name</span>
              <span className="w-24 text-right mr-4">Size</span>
              <span className="w-44 text-right hidden sm:block">Modified</span>
            </div>
          </div>
          <TreeView
            key={refreshKey}
            basePath="/"
            onFileSelect={handleFileSelect}
            onNavigate={handleNavigate}
            checkedFiles={checkedFiles}
            onCheck={handleCheck}
          />
        </div>

        <UploadArea
          currentPath={currentPath}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      {selectedFile && (
        <FileDetailPanel
          entry={selectedFile.entry}
          path={selectedFile.path}
          onClose={() => setSelectedFile(null)}
          onDownload={() => downloadFile(selectedFile.path)}
        />
      )}
    </div>
  );
}
