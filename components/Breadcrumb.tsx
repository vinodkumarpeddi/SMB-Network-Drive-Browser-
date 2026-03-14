import React from "react";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const segments = path.split("/").filter((s) => s.length > 0);

  return (
    <nav
      data-test-id="breadcrumb-bar"
      className="flex items-center gap-1 mb-5 px-4 py-2.5 glass border border-white/60 rounded-2xl text-sm overflow-x-auto shadow-sm shadow-slate-200/50"
    >
      <button
        data-test-id="breadcrumb-link-root"
        onClick={() => onNavigate("/")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
          segments.length === 0
            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25 font-medium"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span>Root</span>
      </button>

      {segments.map((segment, index) => {
        const segmentPath = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <React.Fragment key={segmentPath}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            {isLast ? (
              <span
                data-test-id={`breadcrumb-link-${segment}`}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg shadow-md shadow-blue-500/25 flex-shrink-0"
              >
                {segment}
              </span>
            ) : (
              <button
                data-test-id={`breadcrumb-link-${segment}`}
                onClick={() => onNavigate(segmentPath)}
                className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-all duration-200 flex-shrink-0"
              >
                {segment}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
