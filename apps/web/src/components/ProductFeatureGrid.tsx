"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export function ProductFeatureGrid() {
  const cards = [
    {
      title: "Transaction Intelligence",
      description: "Import transaction data, normalize vendors, and turn raw financial activity into structured records.",
      cta: "Explore Transactions",
      href: "/product/transactions",
      imageSrc: "/how it works/image.png",
      alt: "LedgerPilot transaction intelligence workflow showing transaction data being structured",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M4 7L12 3l8 4M4 7l8 4 8-4" />
        </svg>
      ),
    },
    {
      title: "AI Categorization",
      description: "Let Gemini categorize transactions and surface confident suggestions before they reach human review.",
      cta: "Explore AI Categorization",
      href: "/product/ai-categorization",
      imageSrc: "/how it works/image copy.png",
      alt: "LedgerPilot AI transaction categorization interface showing an AI category suggestion",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Human Review",
      description: "Keep people in control with a focused review queue for approving, editing, or rejecting AI suggestions.",
      cta: "Explore Review",
      href: "/product/review",
      imageSrc: "/how it works/image copy 2.png",
      alt: "LedgerPilot human review workflow showing transaction approval controls",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Financial Overview",
      description: "See confirmed spend, category activity, approval progress, and financial trends from one clear dashboard.",
      cta: "Explore Overview",
      href: "/product/overview",
      imageSrc: "/how it works/image copy 3.png",
      alt: "LedgerPilot financial overview dashboard showing confirmed spending data",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Audit & Control",
      description: "Maintain a clear history of important financial decisions with traceable human actions and audit records.",
      cta: "Explore Controls",
      href: "/product/audit-controls",
      imageSrc: "/how it works/image copy 4.png",
      alt: "LedgerPilot audit and control interface showing traceable financial activity",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];


  return (
    <section id="how-it-works" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto border-t border-black/5 scroll-mt-24">

      {/* Section Intro */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight max-w-3xl mb-4">
          Everything your finance team needs
        </h2>

        <p className="text-sm sm:text-base text-black/60 max-w-2xl leading-relaxed">
          From transaction imports to AI-powered categorization and human review, LedgerPilot brings your core finance operations into one workflow.
        </p>
      </div>

      {/* 5-Card Product Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className="group bg-[#F8F7F2] border border-black/10 rounded-[24px] p-6 flex flex-col justify-between transition-all duration-300 hover:border-black/40 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
          >
            {/* Top Area: Icon & Navigation Arrow */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-sm">
                  {card.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-black/5 text-[#111111] flex items-center justify-center group-hover:bg-[#111111] group-hover:text-white transition-colors">
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-extrabold text-[#111111] tracking-tight mb-2">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-black/70 leading-relaxed mb-6">
                {card.description}
              </p>
            </div>

            {/* Bottom Area: Visual Image & CTA */}
            <div className="mt-auto pt-2 flex flex-col justify-between space-y-4">
              <div className="relative w-full h-[140px] flex items-center justify-center overflow-hidden rounded-xl">
                <img
                  src={card.imageSrc}
                  alt={card.alt}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="pt-2 border-t border-black/5 text-[11px] font-bold text-[#111111] flex items-center gap-1 group-hover:underline">
                <span>{card.cta}</span>
                <span className="text-xs">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

