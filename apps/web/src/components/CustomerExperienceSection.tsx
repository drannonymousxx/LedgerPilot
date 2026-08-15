"use client";

import React, { useState } from "react";

// Centralized image configuration arrays with verified stable Unsplash photos
const initialRow1Images = [
  {
    id: "r1-1",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    alt: "Finance team collaborating in a modern workspace",
  },
  {
    id: "r1-2",
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    alt: "Startup founders reviewing financial reports on laptops",
  },
  {
    id: "r1-3",
    src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
    alt: "Distributed team planning quarterly financial operations",
  },
  {
    id: "r1-4",
    src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
    alt: "Business manager analyzing financial transaction data",
  },
  {
    id: "r1-5",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    alt: "Finance operations specialist working in office",
  },
  {
    id: "r1-6",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    alt: "Team members in strategic finance planning session",
  },
  {
    id: "r1-7",
    src: "https://images.unsplash.com/photo-1542744836-5616c70e5a19?auto=format&fit=crop&w=800&q=80",
    alt: "Financial strategy meeting in modern conference room",
  },
  {
    id: "r1-8",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    alt: "Startup team reviewing financial oversight dashboards",
  },
];

const initialRow2Images = [
  {
    id: "r2-1",
    src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    alt: "Founder reviewing company expenditures",
  },
  {
    id: "r2-2",
    src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
    alt: "Distributed finance team in video conference meeting",
  },
  {
    id: "r2-3",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    alt: "Modern corporate office space for finance teams",
  },
  {
    id: "r2-4",
    src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    alt: "Executive analyzing monthly spending trends",
  },
  {
    id: "r2-5",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    alt: "Collaborative work session on financial software",
  },
  {
    id: "r2-6",
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
    alt: "Bookkeeper organizing monthly account statements",
  },
  {
    id: "r2-7",
    src: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=800&q=80",
    alt: "Startup operators working in modern bright workspace",
  },
];

export function CustomerExperienceSection() {
  const [row1, setRow1] = useState(initialRow1Images);
  const [row2, setRow2] = useState(initialRow2Images);

  const handleImageError = (id: string, isRow1: boolean) => {
    if (isRow1) {
      setRow1((prev) => prev.filter((img) => img.id !== id));
    } else {
      setRow2((prev) => prev.filter((img) => img.id !== id));
    }
  };

  const duplicatedRow1 = [...row1, ...row1];
  const duplicatedRow2 = [...row2, ...row2];

  return (
    <section
      id="customer-experience"
      className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto border-t border-black/5 overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        {/* Section Heading with Serif Accent */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight max-w-3xl mb-4">
          Built for teams that need{" "}
          <span className="font-serif italic font-normal text-[#111111]/90">
            financial clarity.
          </span>
        </h2>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-black/60 max-w-2xl leading-relaxed mb-4">
          From growing startups to distributed finance teams, LedgerPilot helps businesses turn fragmented financial activity into a clear, reviewable workflow.
        </p>

        {/* Supporting Stat Highlight */}
        <div className="text-xs sm:text-sm font-semibold text-black/80 tracking-wide bg-black/5 border border-black/10 px-4 py-1.5 rounded-full">
          Clearer workflows • Faster review • Better financial oversight
        </div>
      </div>

      {/* Dual Infinite Marquee Photo Gallery (Large Widescreen Rectangular Landscape Cards) */}
      <div className="relative w-full space-y-6 sm:space-y-8 my-8">
        {/* Soft edge gradient fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#F4F3ED] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#F4F3ED] to-transparent z-20" />

        {/* ROW 1: Right to Left continuous marquee */}
        <div className="w-full overflow-hidden">
          <div className="flex w-max gap-6 sm:gap-8 animate-marquee-left">
            {duplicatedRow1.map((img, idx) => (
              <div
                key={`r1-${img.id}-${idx}`}
                className="w-[340px] sm:w-[480px] lg:w-[580px] h-[220px] sm:h-[300px] lg:h-[360px] flex-shrink-0 rounded-[28px] overflow-hidden border border-black/10 shadow-sm bg-[#F8F7F2]"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  onError={() => handleImageError(img.id, true)}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ROW 2: Left to Right continuous marquee */}
        <div className="w-full overflow-hidden">
          <div className="flex w-max gap-6 sm:gap-8 animate-marquee-right">
            {duplicatedRow2.map((img, idx) => (
              <div
                key={`r2-${img.id}-${idx}`}
                className="w-[340px] sm:w-[480px] lg:w-[580px] h-[220px] sm:h-[300px] lg:h-[360px] flex-shrink-0 rounded-[28px] overflow-hidden border border-black/10 shadow-sm bg-[#F8F7F2]"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  onError={() => handleImageError(img.id, false)}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closing Statement */}
      <div className="mt-12 text-center">
        <p className="text-xs sm:text-sm text-black/60 font-medium tracking-tight">
          Financial operations should feel organized, transparent, and easy to review.
        </p>
      </div>
    </section>
  );
}
