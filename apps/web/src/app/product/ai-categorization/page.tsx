import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AI Transaction Categorization — LedgerPilot",
  description: "Automated transaction categorization powered by Gemini 3.6 Flash. Pydantic-validated schema output with confidence scores.",
  openGraph: {
    title: "AI Transaction Categorization — LedgerPilot",
    description: "Automated transaction categorization powered by Gemini 3.6 Flash with confidence scores.",
  },
};

export default function AICategorizationProductPage() {
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
          <span className="text-black font-semibold">AI Categorization</span>
        </div>

        {/* Hero */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
            Gemini 3.6 Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Turn raw transactions into organized financial insights
          </h1>
          <p className="text-base sm:text-lg text-black/70 leading-relaxed">
            LedgerPilot leverages Gemini 3.6 Flash to automatically assign standardized accounting categories to normalized vendor transactions. Each classification comes with a calculated confidence score and rationale.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Link
              href="/dashboard/import"
              className="px-6 py-3 bg-[#111111] hover:bg-black text-white text-sm font-semibold rounded-full shadow transition-all"
            >
              Test AI Categorization
            </Link>
            <Link
              href="/product/review"
              className="px-6 py-3 border border-black/20 hover:bg-black/5 text-sm font-semibold rounded-full transition-all"
            >
              Next: Human Review Queue →
            </Link>
          </div>
        </div>

        {/* Visual Diagram */}
        <div className="bg-[#F8F7F2] border border-black/10 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-xs font-bold text-black/50 uppercase tracking-wider">
            AI Processing & Schema Enforcement Loop
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">INPUT</div>
              <div className="font-bold text-black text-sm">Normalized Vendor</div>
              <p className="text-black/60 text-[11px] font-sans">"AWS" • $124.50 • Recurring Cloud Infrastructure</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">PROMPT</div>
              <div className="font-bold text-black text-sm">Gemini 3.6 Engine</div>
              <p className="text-black/60 text-[11px] font-sans">Structured Pydantic schema enforcement with organizational taxonomy.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">OUTPUT</div>
              <div className="font-bold text-black text-sm">Suggested Category</div>
              <p className="text-black/60 text-[11px] font-sans font-bold">"Software / Cloud"</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-black/5 space-y-2">
              <div className="text-black/40 text-[10px]">CONFIDENCE</div>
              <div className="font-bold text-black text-sm">98% Match Score</div>
              <p className="text-black/60 text-[11px] font-sans">Dispatched to Human Review Queue for final verification.</p>
            </div>
          </div>
        </div>

        {/* Deep Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#111111]">Key AI Safety & Architecture Rules</h2>
            <ul className="space-y-3 text-sm text-black/70">
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>Structured Pydantic Output:</strong> All AI suggestions are strictly validated server-side before being written to the database.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>AI vs Human Column Separation:</strong> AI suggested categories (`ai_suggested_category_id`) are stored in distinct database columns from human-final approved values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-black">•</span>
                <span><strong>No Raw Math in LLM:</strong> Financial totals and sums are strictly computed via SQL queries. The LLM only categorizes and explains.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#F8F7F2] p-6 rounded-2xl border border-black/10 space-y-3">
            <h3 className="font-bold text-lg text-[#111111]">Example Startup Use Case</h3>
            <p className="text-xs text-black/70 leading-relaxed">
              When a new subscription charge from "Figma Inc" appears in your bank feed, LedgerPilot's AI categorization engine instantly routes it to "Software / Subscriptions" with 99% confidence, freeing your finance manager from repetitive manual tagging.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <span className="text-black/50">Explore other capabilities:</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/product/transactions" className="hover:underline text-black">← Transaction Intelligence</Link>
            <Link href="/product/review" className="hover:underline text-black">Human Review Queue →</Link>
            <Link href="/product/overview" className="hover:underline text-black">Financial Overview →</Link>
            <Link href="/product/audit-controls" className="hover:underline text-black">Audit & Control →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
