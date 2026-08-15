"use client";

import React, { useState, useEffect } from "react";

export function ProductPreviewCard() {
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans text-xs transition-all duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[10px] text-slate-400 font-medium">ledgerpilot_preview.csv</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            MVP Engine
          </span>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-slate-800/80 bg-slate-900/60 text-[11px] font-medium text-slate-400">
        <button
          onClick={() => setActiveStep(1)}
          className={`py-2.5 px-2 text-center transition-colors border-b-2 ${
            activeStep === 1
              ? "border-indigo-500 text-indigo-400 font-semibold bg-slate-800/50"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          1. Import
        </button>
        <button
          onClick={() => setActiveStep(2)}
          className={`py-2.5 px-2 text-center transition-colors border-b-2 ${
            activeStep === 2
              ? "border-indigo-500 text-indigo-400 font-semibold bg-slate-800/50"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          2. AI Categorize
        </button>
        <button
          onClick={() => setActiveStep(3)}
          className={`py-2.5 px-2 text-center transition-colors border-b-2 ${
            activeStep === 3
              ? "border-indigo-500 text-indigo-400 font-semibold bg-slate-800/50"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          3. Review
        </button>
        <button
          onClick={() => setActiveStep(4)}
          className={`py-2.5 px-2 text-center transition-colors border-b-2 ${
            activeStep === 4
              ? "border-indigo-500 text-indigo-400 font-semibold bg-slate-800/50"
              : "border-transparent hover:text-slate-200"
          }`}
        >
          4. Overview
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="p-4 sm:p-5 min-h-[175px] flex flex-col justify-center">
        {activeStep === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200">Import Transactions</span>
              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">CSV Standard</span>
            </div>
            <div className="p-3 border border-dashed border-indigo-500/40 rounded-xl bg-indigo-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  📄
                </div>
                <div>
                  <div className="font-semibold text-slate-100 text-xs">q3_bank_statement.csv</div>
                  <div className="text-[10px] text-slate-400">1,247 transactions • 48.2 KB</div>
                </div>
              </div>
              <span className="badge-approved text-[10px]">Ready</span>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200">AI Normalization & Confidence</span>
              <span className="badge-edited text-[10px]">Gemini 3.6 Flash</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">AWS EMEA Web Services</span>
                  <span className="text-slate-500 font-mono text-[10px]">$124.50</span>
                </div>
                <span className="text-emerald-400 font-semibold font-mono text-[11px]">98% match</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Normalized Vendor: <strong className="text-slate-200">AWS</strong></span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-medium">Software / Cloud</span>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Human Review Queue</span>
              <span className="badge-pending text-[10px]">1 Pending Review</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-100 text-xs">OpenAI API Services</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  <span className="text-slate-200 font-mono font-medium">$84.00</span> • Suggested: <span className="text-indigo-400">Software / Cloud</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-[10px] transition-colors">
                  Approve
                </button>
                <button className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded text-[10px] transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Finance Dashboard Overview</span>
              <span className="text-slate-400 text-[10px]">Audit Log Verified</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Confirmed Spend</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5">$1,700.25</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Pending Reviews</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-base font-bold text-amber-400 font-mono">13</span>
                  <span className="badge-pending text-[9px]">Action Needed</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
