import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Audit & Control Traceability — LedgerPilot",
  description: "Complete decision audit logs for startup finance operations. Traceable human approvals, edits, and AI state transitions.",
  openGraph: {
    title: "Audit & Control Traceability — LedgerPilot",
    description: "Complete decision audit logs for traceable human approvals, edits, and AI state transitions.",
  },
};

export default function AuditControlsProductPage() {
  return (
    <div className="landing-page-root min-h-screen bg-[#F4F3ED] text-[#111111] selection:bg-[#111111] selection:text-white">
      <Navbar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-[1100px] mx-auto space-y-16">
        {/* Breadcrumb */}
        <div className="text-xs text-black/50 flex items-center gap-2 font-medium">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <span>Product</span>
          <span>/</span>
          <span className="text-black font-semibold">Audit & Control</span>
        </div>

        {/* Hero */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            Traceable Decision Governance
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Maintain complete audit trails for every financial action
          </h1>
          <p className="text-base sm:text-lg text-black/70 leading-relaxed">
            In finance operations, accountability is paramount. LedgerPilot automatically writes immutable audit log records for every state-changing action on an AI-touched transaction (approve, edit, or reject), establishing complete traceability.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#111111] hover:bg-black text-white text-sm font-semibold rounded-full shadow transition-all"
            >
              Get Started with Audit Controls
            </Link>
            <Link
              href="/product/transactions"
              className="px-6 py-3 border border-black/20 hover:bg-black/5 text-sm font-semibold rounded-full transition-all"
            >
              Back to Transactions →
            </Link>
          </div>
        </div>

        {/* Visual Diagram */}
        <div className="bg-[#F8F7F2] border border-black/10 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-xs font-bold text-black/50 uppercase tracking-wider">
            Audit Trail Governance Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">EVENT TRIGGER</div>
              <div className="font-bold text-black text-sm">Human Action</div>
              <p className="text-black/60 text-[11px] font-sans">Operator approves, edits category, or rejects AI suggestion.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">AUDIT LOG ROW</div>
              <div className="font-bold text-black text-sm">Database Record</div>
              <p className="text-black/60 text-[11px] font-sans">Writes entity ID, user ID, previous category ID, new category ID, and timestamp.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">IMMUTABILITY</div>
              <div className="font-bold text-black text-sm">Historical Trace</div>
              <p className="text-black/60 text-[11px] font-sans">Guarantees verifiable compliance during annual financial audits.</p>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#111111]">Key Audit Capabilities</h2>
            <ul className="space-y-3 text-sm text-black/70">
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>Mandatory Audit Writing:</strong> Every state change on AI-touched entities automatically inserts a structured row into `audit_logs`.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>Original AI Context Preserved:</strong> AI suggested values (`ai_suggested_category_id`) are never overwritten by human overrides.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>Org Boundary Enforcement:</strong> All audit queries filter strictly by `organization_id`.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#F8F7F2] p-6 rounded-2xl border border-black/10 space-y-3">
            <h3 className="font-bold text-lg text-[#111111]">Example Startup Use Case</h3>
            <p className="text-xs text-black/70 leading-relaxed">
              During a Series A financial due diligence audit, investors verify who categorized a $15,000 vendor line item. LedgerPilot shows the exact timestamp, the AI's initial 95% confidence suggestion, and the finance manager who confirmed it.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <span className="text-black/50">Explore other capabilities:</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/product/transactions" className="hover:underline text-black">Transaction Intelligence →</Link>
            <Link href="/product/ai-categorization" className="hover:underline text-black">AI Categorization →</Link>
            <Link href="/product/review" className="hover:underline text-black">Human Review Queue →</Link>
            <Link href="/product/overview" className="hover:underline text-black">Financial Overview →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
