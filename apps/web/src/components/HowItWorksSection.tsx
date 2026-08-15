"use client";

import React from "react";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto">
      {/* Section Intro */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        {/* Section Heading with Serif Accent matching reference */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight max-w-2xl mb-4">
          The power of your data{" "}
          <span className="font-serif italic font-normal text-[#111111]/90">
            with LedgerPilot
          </span>
        </h2>

        {/* Supporting Subtitle */}
        <p className="text-sm sm:text-base text-black/60 max-w-xl leading-relaxed">
          Keep your business account needs safely organized under one roof, manage financial operations quickly, easily & efficiently.
        </p>
      </div>

      {/* 2 x 2 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* CARD 1: CSV Import */}
        <div className="bg-[#F8F7F2] border border-black/5 rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
          {/* Uniform Subtle Partial Circle Background Watermark (Clipped by card border) */}
          <div className="absolute -top-12 -right-12 w-44 h-44 pointer-events-none text-black/[0.05] group-hover:text-black/[0.09] transition-colors">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
            </svg>
          </div>

          <div>
            {/* Top Icon Badge */}
            <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-sm mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mb-2">
              Import your transactions
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-black/70 leading-relaxed max-w-md">
              Upload your transaction CSV and bring your company's financial data into LedgerPilot.
            </p>
          </div>
        </div>

        {/* CARD 2: AI Categorization */}
        <div className="bg-[#F8F7F2] border border-black/5 rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
          {/* Uniform Subtle Partial Circle Background Watermark (Clipped by card border) */}
          <div className="absolute -top-12 -right-12 w-44 h-44 pointer-events-none text-black/[0.05] group-hover:text-black/[0.09] transition-colors">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
            </svg>
          </div>

          <div>
            {/* Top Icon Badge */}
            <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-sm mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mb-2">
              AI-powered categorization
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-black/70 leading-relaxed max-w-md">
              Let Gemini categorize transactions and normalize vendors automatically with confidence scores.
            </p>
          </div>
        </div>

        {/* CARD 3: Review with confidence */}
        <div className="bg-[#F8F7F2] border border-black/5 rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
          {/* Uniform Subtle Partial Circle Background Watermark (Clipped by card border) */}
          <div className="absolute -top-12 -right-12 w-44 h-44 pointer-events-none text-black/[0.05] group-hover:text-black/[0.09] transition-colors">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
            </svg>
          </div>

          <div>
            {/* Top Icon Badge */}
            <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-sm mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mb-2">
              Review with confidence
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-black/70 leading-relaxed max-w-md">
              Review AI suggestions, approve accurate categories, or correct them before they become confirmed data.
            </p>
          </div>
        </div>

        {/* CARD 4: See your finances clearly */}
        <div className="bg-[#F8F7F2] border border-black/5 rounded-[28px] p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
          {/* Uniform Subtle Partial Circle Background Watermark (Clipped by card border) */}
          <div className="absolute -top-12 -right-12 w-44 h-44 pointer-events-none text-black/[0.05] group-hover:text-black/[0.09] transition-colors">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" />
            </svg>
          </div>

          <div>
            {/* Top Icon Badge */}
            <div className="w-11 h-11 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-sm mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mb-2">
              See your finances clearly
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-black/70 leading-relaxed max-w-md">
              Track confirmed spend, pending reviews, category breakdowns, and human corrections in one place.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
