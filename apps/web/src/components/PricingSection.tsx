"use client";

import React from "react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "STARTER",
    price: "$0",
    period: "/month",
    description: "For early-stage teams getting started",
    ctaText: "Start Free",
    ctaHref: "/auth",
    isPopular: false,
    features: [
      "Transaction imports",
      "AI transaction categorization",
      "Human review queue",
      "Basic financial dashboard",
    ],
  },
  {
    name: "GROWTH",
    price: "$49",
    period: "/month",
    description: "For growing finance teams scaling ops",
    ctaText: "Start Free Trial",
    ctaHref: "/auth",
    isPopular: true,
    features: [
      "Everything in Starter",
      "Higher transaction limits",
      "Advanced AI categorization",
      "Approval workflows",
      "Full audit trail & logging",
      "Financial oversight insights",
    ],
  },
  {
    name: "SCALE",
    price: "Custom",
    period: "",
    description: "For finance teams with complex workflows",
    ctaText: "Get Started",
    ctaHref: "/auth",
    isPopular: false,
    features: [
      "Everything in Growth",
      "Custom transaction volume",
      "Multiple organizations/workspaces",
      "Advanced enterprise controls",
      "Priority dedicated support",
      "Custom system integrations",
    ],
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto border-t border-black/5"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight max-w-3xl mb-4">
          Simple pricing for{" "}
          <span className="font-serif italic font-normal text-[#111111]/90">
            clearer financial operations.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-black/60 max-w-xl leading-relaxed">
          Choose the right plan to bring AI efficiency and human review into your finance workflow.
        </p>
      </div>

      {/* 3 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {pricingPlans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-[32px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
              plan.isPopular
                ? "bg-white border-2 border-black/80 shadow-xl ring-1 ring-black/5 lg:-translate-y-2"
                : "bg-white border border-black/10 shadow-sm hover:shadow-md hover:border-black/20"
            }`}
          >
            {/* Top Inner Rounded Header Box (Matching reference layout) */}
            <div>
              <div
                className={`rounded-[24px] p-6 mb-6 flex flex-col justify-between transition-colors ${
                  plan.isPopular
                    ? "bg-[#111111] text-white"
                    : "bg-[#F8F7F2] text-[#111111]"
                }`}
              >
                {/* Badge & Optional Popular Tag */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase ${
                      plan.isPopular
                        ? "bg-white/15 text-white border border-white/20"
                        : "bg-white border border-black/10 text-[#111111]"
                    }`}
                  >
                    {plan.name}
                  </span>
                  {plan.isPopular && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm font-semibold ${
                        plan.isPopular ? "text-white/70" : "text-black/60"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-black/70 font-medium mb-6 px-1">
                {plan.description}
              </p>

              {/* CTA Button */}
              <Link
                href={plan.ctaHref}
                className={`w-full py-3.5 px-6 rounded-full font-bold text-sm text-center block transition-all duration-200 active:scale-95 shadow-sm mb-8 ${
                  plan.isPopular
                    ? "bg-[#111111] hover:bg-black text-white"
                    : "bg-[#111111] hover:bg-black text-white"
                }`}
              >
                {plan.ctaText}
              </Link>
            </div>

            {/* Features Checklist */}
            <div className="border-t border-black/5 pt-6 mt-auto">
              <span className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-4">
                What&apos;s Included
              </span>
              <ul className="space-y-3">
                {plan.features.map((feature, fIdx) => (
                  <li
                    key={fIdx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-[#111111]/80 font-medium"
                  >
                    <svg
                      className="w-4 h-4 text-[#111111] flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
