"use client";

import React, { useEffect, useRef, useState } from "react";

export function FinanceAnalyticsSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto border-t border-black/5"
    >
      {/* 3-Column Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

        {/* CARD 1: Finance Overview */}
        <div className="flex flex-col h-full group">
          {/* Floating UI Visual Container - Fixed height for identical alignment */}
          <div className="w-full h-[310px] bg-[#F8F7F2] border border-black/5 rounded-[28px] p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#111111]" />
                <span className="font-semibold text-xs text-[#111111] uppercase tracking-wider">
                  Confirmed Spend
                </span>
              </div>
              <span className="text-[11px] font-medium text-black/50 bg-black/5 px-2.5 py-0.5 rounded-full">
                This Month
              </span>
            </div>

            {/* Spend Amount & Trend Badge */}
            <div className="mb-4">
              <div className="text-3xl font-extrabold text-[#111111] tracking-tight font-mono">
                $1,700.25
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-black/60 font-medium">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-black/10 text-[#111111] font-mono font-bold">
                  +12.4%
                </span>
                <span>vs previous period</span>
              </div>
            </div>

            {/* Animated SVG Line Chart */}
            <div className="w-full h-24 relative mt-auto flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 280 80">
                {/* Subtle Grid Lines */}
                <line x1="0" y1="20" x2="280" y2="20" stroke="#111111" strokeOpacity="0.06" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="280" y2="50" stroke="#111111" strokeOpacity="0.06" strokeDasharray="3 3" />
                
                {/* Secondary Trend Line (Gray) */}
                <path
                  d="M 10 65 Q 60 55, 110 60 T 210 40 T 270 45"
                  fill="none"
                  stroke="#111111"
                  strokeOpacity="0.25"
                  strokeWidth="2"
                  strokeDasharray="400"
                  strokeDashoffset={isVisible ? 0 : 400}
                  className="transition-all duration-[3000ms] ease-in-out"
                />

                {/* Primary Trend Line (Black) */}
                <path
                  d="M 10 55 Q 60 20, 110 38 T 210 18 T 270 25"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="400"
                  strokeDashoffset={isVisible ? 0 : 400}
                  className="transition-all duration-[3500ms] ease-in-out delay-300"
                />

                {/* Static End Point Marker */}
                {isVisible && <circle cx="270" cy="25" r="4" fill="#111111" />}
              </svg>
            </div>
          </div>

          {/* Heading & Description - Aligned strictly across columns */}
          <div className="mt-6 flex flex-col justify-start">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mb-2 min-h-[56px] flex items-center">
              See where your money goes
            </h3>
            <p className="text-sm sm:text-base text-black/70 leading-relaxed">
              Track confirmed spend and category-level activity from one clear financial overview.
            </p>
          </div>
        </div>

        {/* CARD 2: AI Categorization */}
        <div className="flex flex-col h-full group">
          {/* Floating UI Visual Container - Fixed height for identical alignment */}
          <div className="w-full h-[310px] bg-[#F8F7F2] border border-black/5 rounded-[28px] p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-4">
              <span className="font-semibold text-xs text-[#111111] uppercase tracking-wider">
                AI Normalization
              </span>
              <span className="text-[11px] font-semibold text-[#111111] bg-black/10 px-2.5 py-0.5 rounded-full font-mono">
                98% Match
              </span>
            </div>

            {/* Vendor Transaction Item */}
            <div className="bg-white rounded-xl p-3.5 border border-black/5 shadow-2xl mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm text-[#111111]">AWS EMEA</div>
                <div className="font-mono font-bold text-sm text-[#111111]">$124.50</div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-black/60">Suggested Category:</span>
                <span className="font-medium bg-black text-white px-2 py-0.5 rounded text-[11px]">
                  Software / Cloud
                </span>
              </div>
            </div>

            {/* Animated Category Breakdown Bars */}
            <div className="mt-auto space-y-2">
              <div className="text-[11px] font-medium text-black/50 flex justify-between">
                <span>Category Weight</span>
                <span>Software / Cloud (64%)</span>
              </div>

              {/* Bar 1 */}
              <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#111111] rounded-full transition-all duration-[3000ms] ease-in-out"
                  style={{ width: isVisible ? "64%" : "0%" }}
                />
              </div>

              {/* Bar 2 */}
              <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black/40 rounded-full transition-all duration-[3000ms] ease-in-out delay-200"
                  style={{ width: isVisible ? "26%" : "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Heading & Description - Aligned strictly across columns */}
          <div className="mt-6 flex flex-col justify-start">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mb-2 min-h-[56px] flex items-center">
              Turn transactions into insight
            </h3>
            <p className="text-sm sm:text-base text-black/70 leading-relaxed">
              LedgerPilot uses AI to categorize transactions and normalize vendors before human review.
            </p>
          </div>
        </div>

        {/* CARD 3: Review & Approval */}
        <div className="flex flex-col h-full group">
          {/* Floating UI Visual Container - Fixed height for identical alignment */}
          <div className="w-full h-[310px] bg-[#F8F7F2] border border-black/5 rounded-[28px] p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-4">
              <span className="font-semibold text-xs text-[#111111] uppercase tracking-wider">
                Review Queue
              </span>
              <span className="text-[11px] font-semibold text-[#111111] bg-black/10 px-2.5 py-0.5 rounded-full font-mono">
                Human-in-Loop
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white p-3 rounded-xl border border-black/5 text-center">
                <div className="text-2xl font-black text-[#111111] font-mono">13</div>
                <div className="text-[10px] text-black/60 font-medium">Pending</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-black/5 text-center">
                <div className="text-2xl font-black text-[#111111] font-mono">12</div>
                <div className="text-[10px] text-black/60 font-medium">AI Match</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-black/5 text-center">
                <div className="text-2xl font-black text-[#111111] font-mono">1</div>
                <div className="text-[10px] text-black/60 font-medium">Corrected</div>
              </div>
            </div>

            {/* Animated Workflow Progress Bar */}
            <div className="mt-auto bg-white p-3 rounded-xl border border-black/5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#111111]">Review Progress</span>
                <span className="font-mono text-black/60 font-bold">92%</span>
              </div>
              <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#111111] rounded-full transition-all duration-[3500ms] ease-in-out delay-300"
                  style={{ width: isVisible ? "92%" : "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Heading & Description - Aligned strictly across columns */}
          <div className="mt-6 flex flex-col justify-start">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mb-2 min-h-[56px] flex items-center">
              Keep humans in control
            </h3>
            <p className="text-sm sm:text-base text-black/70 leading-relaxed">
              Review AI suggestions, approve accurate categories, and correct anything that needs attention.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
