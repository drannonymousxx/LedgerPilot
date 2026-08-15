"use client";

import React from "react";
import Link from "next/link";
import { DottedGlobe } from "./DottedGlobe";

export function GlobalOperationsSection() {
  const points = [
    {
      number: "01",
      title: "Global-ready operations",
      description: "Keep financial activity organized across teams, vendors, and markets.",
    },
    {
      number: "02",
      title: "One financial picture",
      description: "Turn fragmented transaction data into a clear, reviewable financial overview.",
    },
    {
      number: "03",
      title: "AI with human control",
      description: "Let AI handle repetitive categorization while people remain responsible for final decisions.",
    },
  ];

  return (
    <section
      id="global-operations"
      className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto border-t border-black/5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Text & Value Propositions (55% width on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-8">
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight max-w-xl">
            Financial clarity,{" "}
            <span className="font-serif italic font-normal text-[#111111]/90">
              wherever business happens.
            </span>
          </h2>

          {/* Body Description */}
          <p className="text-sm sm:text-base text-black/70 max-w-lg leading-relaxed">
            From growing startups to distributed teams, LedgerPilot brings transactions, AI categorization, human review, and financial oversight into one organized workflow.
          </p>

          {/* 3 Supporting Points */}
          <div className="w-full space-y-6 pt-2 border-t border-black/5">
            {points.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-4 group">
                <span className="text-xs font-mono font-bold text-black/40 group-hover:text-black transition-colors pt-0.5">
                  {pt.number}
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-[#111111] tracking-tight">
                    {pt.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-black/60 leading-relaxed max-w-md">
                    {pt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-[#111111] hover:bg-black text-white font-semibold text-sm rounded-full shadow-sm hover:shadow active:scale-95 transition-all duration-200"
            >
              Explore LedgerPilot
            </Link>
          </div>
        </div>

        {/* Right Column: 3D Dotted Globe (45-50% width on desktop) */}
        <div className="lg:col-span-5 flex items-center justify-center relative w-full overflow-hidden">
          <DottedGlobe className="w-full max-w-[480px] lg:max-w-[540px]" />
        </div>
      </div>
    </section>
  );
}
