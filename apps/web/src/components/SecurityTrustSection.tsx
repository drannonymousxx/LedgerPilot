"use client";

import React from "react";
import Link from "next/link";

export function SecurityTrustSection() {
  const cards = [
    {
      title: "Human Approval",
      value: "100%",
      description: "Final financial categorization decisions remain under human control.",
    },
    {
      title: "Traceable Decisions",
      value: "Audit Ready",
      description: "Important review and approval actions are recorded for accountability.",
    },
    {
      title: "AI + Human Control",
      value: "2-Step",
      description: "AI suggestions are surfaced first, then reviewed by people before confirmation.",
    },
    {
      title: "Organization Scoped",
      value: "Isolated",
      description: "Financial records are organized within their respective organization workspace.",
    },
  ];

  return (
    <section
      id="security"
      className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto border-t border-black/5 scroll-mt-24"
    >

      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        {/* Section Heading with Serif Accent */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight max-w-3xl mb-4">
          Security built into{" "}
          <span className="font-serif italic font-normal text-[#111111]/90">
            every financial workflow.
          </span>
        </h2>

        {/* Supporting Copy */}
        <p className="text-sm sm:text-base text-black/60 max-w-2xl leading-relaxed mb-8">
          LedgerPilot keeps financial activity organized, reviewable, and traceable while giving teams control over how transactions are categorized, approved, and recorded.
        </p>

        {/* Dotted Pill Button matching reference CTA style */}
        <Link
          href="/product/audit-controls"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-dashed border-black/40 hover:border-black text-[#111111] font-semibold text-xs sm:text-sm transition-all duration-200 hover:bg-black/5 active:scale-95"
        >
          Explore Security Controls
        </Link>
      </div>

      {/* 4 Security Metric Cards (Interconnected horizontally matching reference layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-5">
        {cards.map((card, idx) => (
          <div key={idx} className="relative">
            {/* Card Main Container */}
            <div className="bg-[#111111] text-white rounded-[28px] p-7 sm:p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group min-h-[250px] z-10">
              {/* Subtle background glow effect on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full filter blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />

              {/* Top Title */}
              <div>
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-4">
                  {card.title}
                </span>
              </div>

              {/* Middle & Bottom: Metric Value + Description */}
              <div className="space-y-3 mt-auto">
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                  {card.value}
                </div>
                <p className="text-xs text-white/70 leading-relaxed pt-1">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Interlocking Connector Bridge (Visually links adjacent cards together horizontally on desktop) */}
            {idx < cards.length - 1 && (
              <div className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none w-5 h-16">
                <svg
                  className="w-full h-full text-[#111111]"
                  viewBox="0 0 24 64"
                  fill="currentColor"
                  preserveAspectRatio="none"
                >
                  <path d="M 0 14 C 4 14, 8 20, 12 20 C 16 20, 20 14, 24 14 L 24 50 C 20 50, 16 44, 12 44 C 8 44, 4 50, 0 50 Z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
