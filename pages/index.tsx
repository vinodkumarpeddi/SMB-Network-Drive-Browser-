import dynamic from "next/dynamic";
import Head from "next/head";
import { HardDrive } from "lucide-react";

const FileBrowser = dynamic(() => import("../components/FileBrowser"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <HardDrive className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="w-48 h-2 bg-slate-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-shimmer" />
        </div>
        <p className="text-slate-400 text-sm mt-4">Connecting to share...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <>
      <Head>
        <title>SMB File Explorer</title>
        <meta name="description" content="Web-based SMB/CIFS network share explorer" />
      </Head>
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute top-1/3 -left-20 w-60 h-60 bg-indigo-100 rounded-full opacity-30 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-50 rounded-full opacity-40 blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative glass border-b border-white/50 shadow-sm shadow-slate-200/50 sticky top-0 z-50">
          <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl opacity-75 blur group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <HardDrive className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  SMB Explorer
                </h1>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
                  Network File Browser
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </div>
              <span className="text-xs font-medium text-emerald-700">Connected</span>
            </div>
          </div>
        </header>

        <main className="relative max-w-screen-2xl mx-auto p-6">
          <FileBrowser />
        </main>
      </div>
    </>
  );
}
