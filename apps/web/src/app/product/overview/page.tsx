import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Financial Overview Dashboard — LedgerPilot",
  description: "Real-time finance dashboard tracking confirmed spend, category breakdowns, pending reviews, and human corrections.",
  openGraph: {
    title: "Financial Overview Dashboard — LedgerPilot",
    description: "Real-time finance dashboard tracking confirmed spend, category breakdowns, and review queue progress.",
  },
};

export default function OverviewProductPage() {
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
          <span className="text-black font-semibold">Financial Overview</span>
        </div>

        {/* Hero */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            Real-Time Aggregates
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Clear financial visibility for startup founders & managers
          </h1>
          <p className="text-base sm:text-lg text-black/70 leading-relaxed">
            Gain immediate clarity over company expenditures. LedgerPilot aggregates confirmed spend, pending review workloads, category distributions, and human correction metrics into a unified dashboard.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#111111] hover:bg-black text-white text-sm font-semibold rounded-full shadow transition-all"
            >
              View Live Dashboard
            </Link>
            <Link
              href="/product/audit-controls"
              className="px-6 py-3 border border-black/20 hover:bg-black/5 text-sm font-semibold rounded-full transition-all"
            >
              Next: Audit & Control →
            </Link>
          </div>
        </div>

        {/* Visual Diagram */}
        <div className="bg-[#F8F7F2] border border-black/10 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-xs font-bold text-black/50 uppercase tracking-wider">
            Dashboard Data Pipeline (SQL Aggregated)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">KPI 1</div>
              <div className="font-bold text-black text-sm">Confirmed Spend</div>
              <p className="text-black/60 text-[11px] font-sans">Sum of all approved transaction amounts (`amount_cents`).</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">KPI 2</div>
              <div className="font-bold text-black text-sm">Pending Reviews</div>
              <p className="text-black/60 text-[11px] font-sans">Count of transactions awaiting human verification.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">KPI 3</div>
              <div className="font-bold text-black text-sm">Category Breakdown</div>
              <p className="text-black/60 text-[11px] font-sans">Spending distribution grouped by standardized categories.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">KPI 4</div>
              <div className="font-bold text-black text-sm">Human Corrections</div>
              <p className="text-black/60 text-[11px] font-sans">Track manual edits to evaluate AI accuracy over time.</p>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#111111]">Key Dashboard Features</h2>
            <ul className="space-y-3 text-sm text-black/70">
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>Pure SQL Aggregates:</strong> Aggregates are computed directly in Postgres queries, ensuring 100% mathematical accuracy without relying on LLM arithmetic.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>Category Weight Progress:</strong> Visual breakdown of major spend buckets (Software, Hosting, Operations).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>Multi-Tenant Filtering:</strong> Strict `organization_id` scoping guarantees data privacy across organizations.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#F8F7F2] p-6 rounded-2xl border border-black/10 space-y-3">
            <h3 className="font-bold text-lg text-[#111111]">Example Startup Use Case</h3>
            <p className="text-xs text-black/70 leading-relaxed">
              Before a monthly board meeting, a founder logs into LedgerPilot to inspect confirmed spend ($42,150.00) and sees that 94% of transactions were categorized by AI and verified by the team within minutes.
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
            <Link href="/product/audit-controls" className="hover:underline text-black">Audit & Control →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
