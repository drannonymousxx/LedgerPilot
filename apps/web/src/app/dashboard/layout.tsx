"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, activeOrg, loading: authLoading } = useAuth();
  const { loading: orgLoading, error } = useOrg();

  const loading = authLoading || orgLoading;

  useEffect(() => {
    if (!loading && (!session || !activeOrg)) {
      router.push("/auth");
    }
  }, [loading, session, activeOrg, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-[#F4F3ED]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold tracking-wide">Authenticating LedgerPilot Workspace...</span>
        </div>
      </div>
    );
  }

  if (!session || !activeOrg) {
    return null; // Will redirect via useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F3ED] flex items-center justify-center p-4 text-[#111111]">
        <div className="bg-white border border-black/10 p-6 rounded-[24px] max-w-md text-center shadow-lg">
          <h2 className="text-lg font-bold mb-2">Organization Access Error</h2>
          <p className="text-sm text-black/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white rounded-full text-sm font-semibold shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#111111] text-[#F4F3ED]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[#F4F3ED] text-[#111111]">
        <div className="max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
