import React, { useState, useEffect, useCallback } from "react";
import { FileEntry } from "@/lib/types";
import { fetchDirectory, isCached } from "@/lib/api";
import { FileIcon } from "./FileIcon";
import {
  ChevronRight,
  ChevronDown,
  Loader2,
  FolderOpen,
  ServerCrash,
} from "lucide-react";

interface TreeViewProps {
  basePath: string;
  onFileSelect: (entry: FileEntry, fullPath: string) => void;
  onNavigate: (path: string) => void;
  checkedFiles: Set<string>;
  onCheck: (fullPath: string, checked: boolean) => void;
}

export function TreeView({
  basePath,
  onFileSelect,
  onNavigate,
  checkedFiles,
  onCheck,
}: TreeViewProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDirectory(basePath)
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [basePath]);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        </div>
        <p className="text-sm text-slate-400">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <ServerCrash className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-600">Connection Error</p>
        <p className="text-xs text-red-400 max-w-xs text-center">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center animate-float">
          <FolderOpen className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-400">Empty directory</p>
        <p className="text-xs text-slate-300">Upload files to get started</p>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div>
      {sorted.map((entry, i) => {
        const fullPath =
          basePath === "/" ? `/${entry.name}` : `${basePath}/${entry.name}`;
        return (
          <div key={entry.name} style={{ animationDelay: `${i * 30}ms` }} className="animate-fade-in">
            {entry.type === "directory" ? (
              <FolderNode
                entry={entry}
                fullPath={fullPath}
                onFileSelect={onFileSelect}
                onNavigate={onNavigate}
                checkedFiles={checkedFiles}
                onCheck={onCheck}
                depth={0}
              />
            ) : (
              <FileNode
                entry={entry}
                fullPath={fullPath}
                onFileSelect={onFileSelect}
                checkedFiles={checkedFiles}
                onCheck={onCheck}
                depth={0}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface FolderNodeProps {
  entry: FileEntry;
  fullPath: string;
  onFileSelect: (entry: FileEntry, fullPath: string) => void;
  onNavigate: (path: string) => void;
  checkedFiles: Set<string>;
  onCheck: (fullPath: string, checked: boolean) => void;
  depth: number;
}

function FolderNode({
  entry,
  fullPath,
  onFileSelect,
  onNavigate,
  checkedFiles,
  onCheck,
  depth,
}: FolderNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<FileEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    if (children !== null || isCached(fullPath)) {
      if (children === null) {
        try {
          const data = await fetchDirectory(fullPath);
          setChildren(data);
        } catch (err: any) {
          setError(err.message);
        }
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchDirectory(fullPath);
      setChildren(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [expanded, children, fullPath]);

  const paddingLeft = 20 + depth * 24;

  return (
    <div>
      <div
        data-test-id={`tree-folder-node-${entry.name}`}
        className={`file-row flex items-center gap-2.5 py-3 pr-5 cursor-pointer group transition-all duration-150 ${
          expanded ? "bg-blue-50/40" : "hover:bg-slate-50/80"
        }`}
        style={{ paddingLeft }}
        onClick={handleToggle}
      >
        <span className={`flex-shrink-0 transition-transform duration-200 ${expanded ? "text-blue-500" : "text-slate-400"}`}>
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        <span className="w-5 flex-shrink-0" />
        <FileIcon type="directory" name={entry.name} expanded={expanded} />
        <span className={`text-sm font-medium truncate flex-1 transition-colors ${
          expanded ? "text-blue-700" : "text-slate-700"
        }`}>
          {entry.name}
        </span>
        <span className="w-24 text-right text-xs text-slate-300 mr-4 font-mono">--</span>
        <span className="w-44 text-right text-xs text-slate-400 hidden sm:block">
          {formatDate(entry.lastModified)}
        </span>
      </div>

      {expanded && loading && (
        <div
          data-test-id={`tree-loading-${entry.name}`}
          className="flex items-center gap-2.5 py-3 text-slate-400 animate-fade-in"
          style={{ paddingLeft: paddingLeft + 52 }}
        >
          <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          </div>
          <span className="text-xs text-slate-400">Loading...</span>
        </div>
      )}

      {expanded && error && (
        <div
          className="py-2.5 text-xs text-red-500 animate-fade-in"
          style={{ paddingLeft: paddingLeft + 52 }}
        >
          {error}
        </div>
      )}

      {expanded && children !== null && !loading && (
        <div
          data-test-id={`tree-children-${entry.name}`}
          className="animate-slide-down"
        >
          <div
            className="border-l-2 border-slate-100 ml-0"
            style={{ marginLeft: paddingLeft + 7 }}
          >
            {children.length === 0 ? (
              <div
                className="py-3 text-xs text-slate-300 italic flex items-center gap-2"
                style={{ paddingLeft: 20 }}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Empty folder
              </div>
            ) : (
              [...children]
                .sort((a, b) => {
                  if (a.type !== b.type)
                    return a.type === "directory" ? -1 : 1;
                  return a.name.localeCompare(b.name);
                })
                .map((child) => {
                  const childPath = `${fullPath}/${child.name}`;
                  return child.type === "directory" ? (
                    <FolderNode
                      key={child.name}
                      entry={child}
                      fullPath={childPath}
                      onFileSelect={onFileSelect}
                      onNavigate={onNavigate}
                      checkedFiles={checkedFiles}
                      onCheck={onCheck}
                      depth={depth + 1}
                    />
                  ) : (
                    <FileNode
                      key={child.name}
                      entry={child}
                      fullPath={childPath}
                      onFileSelect={onFileSelect}
                      checkedFiles={checkedFiles}
                      onCheck={onCheck}
                      depth={depth + 1}
                    />
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FileNodeProps {
  entry: FileEntry;
  fullPath: string;
  onFileSelect: (entry: FileEntry, fullPath: string) => void;
  checkedFiles: Set<string>;
  onCheck: (fullPath: string, checked: boolean) => void;
  depth: number;
}

function FileNode({
  entry,
  fullPath,
  onFileSelect,
  checkedFiles,
  onCheck,
  depth,
}: FileNodeProps) {
  const isChecked = checkedFiles.has(fullPath);
  const paddingLeft = 20 + depth * 24;

  return (
    <div
      className={`file-row flex items-center gap-2.5 py-3 pr-5 cursor-pointer group transition-all duration-150 ${
        isChecked ? "bg-blue-50/60 selected" : "hover:bg-slate-50/80"
      }`}
      style={{ paddingLeft }}
      onClick={() => onFileSelect(entry, fullPath)}
    >
      <span className="w-4 flex-shrink-0" />
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => {
          e.stopPropagation();
          onCheck(fullPath, e.target.checked);
        }}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0"
      />
      <FileIcon type="file" name={entry.name} />
      <span className={`text-sm truncate flex-1 transition-colors ${
        isChecked ? "text-blue-700 font-medium" : "text-slate-600 group-hover:text-slate-800"
      }`}>
        {entry.name}
      </span>
      <span className="w-24 text-right text-xs text-slate-400 mr-4 font-mono">
        {formatSize(entry.size)}
      </span>
      <span className="w-44 text-right text-xs text-slate-400 hidden sm:block">
        {formatDate(entry.lastModified)}
      </span>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
