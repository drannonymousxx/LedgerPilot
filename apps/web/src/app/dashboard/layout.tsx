"use client";

import { Sidebar } from "@/components/Sidebar";
import { useOrg } from "@/lib/org-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, error } = useOrg();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Initializing LedgerPilot Organization...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-rose-400">
        <div className="glass-panel p-6 max-w-md text-center">
          <h2 className="text-lg font-bold mb-2">Connection Error</h2>
          <p className="text-sm text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
