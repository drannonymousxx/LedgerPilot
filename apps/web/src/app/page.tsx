"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { HalftoneCanvas } from "@/components/HalftoneCanvas";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FinanceAnalyticsSection } from "@/components/FinanceAnalyticsSection";
import { ProductFeatureGrid } from "@/components/ProductFeatureGrid";
import { GlobalOperationsSection } from "@/components/GlobalOperationsSection";
import { SecurityTrustSection } from "@/components/SecurityTrustSection";
import { CustomerExperienceSection } from "@/components/CustomerExperienceSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-page-root min-h-screen bg-[#F4F3ED] text-[#111111] overflow-x-hidden selection:bg-[#111111] selection:text-white">
      {/* Sticky Scroll-Aware Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto min-h-screen flex flex-col justify-between">
        
        {/* Asymmetric Hero Composition */}
        <div className="relative w-full mt-4 lg:mt-6">
          
          {/* Headline - Occupies Top-Left Negative Space */}
          <div className="z-20 relative max-w-lg lg:max-w-xl mb-6 lg:mb-0 lg:absolute lg:top-4 lg:left-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-extrabold tracking-tight text-[#111111] leading-[1.04]">
              Finance
              <br />
              Operations,
              <br />
              Without The
              <br />
              Busywork
            </h1>
          </div>

          {/* Asymmetric Halftone Canvas Container */}
          <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] rounded-[32px] overflow-hidden shadow-sm border border-black/5">
            {/* Animated Monochrome Halftone Canvas */}
            <div className="absolute inset-0 z-0">
              <HalftoneCanvas />
            </div>

            {/* Desktop Top-Left Notch Cutout Mask (Animates from full canvas to exact hero shape on load) */}
            <div
              className={`hidden lg:block absolute top-0 left-0 bg-[#F4F3ED] z-10 rounded-br-[32px] transition-all duration-1200 cubic-bezier(0.16,1,0.3,1) ${
                isMounted ? "w-[42%] h-[54%] opacity-100" : "w-0 h-0 opacity-0"
              }`}
            />

            {/* Desktop Bottom-Right Notch Cutout Mask (Animates from full canvas to exact hero shape on load) */}
            <div
              className={`hidden lg:block absolute bottom-0 right-0 bg-[#F4F3ED] z-10 rounded-tl-[32px] transition-all duration-1200 cubic-bezier(0.16,1,0.3,1) delay-100 ${
                isMounted ? "w-[42%] h-[40%] opacity-100" : "w-0 h-0 opacity-0"
              }`}
            />
          </div>

          {/* Bottom-Right Description & CTA Block */}
          <div className="z-20 relative mt-6 lg:mt-0 lg:absolute lg:bottom-4 lg:right-4 max-w-md lg:max-w-[480px] p-2 sm:p-4">
            <p className="text-sm sm:text-base lg:text-[15px] font-medium text-[#111111]/80 leading-relaxed mb-5 max-w-md">
              Import your transactions, let AI categorize them, review the suggestions, and keep your company's finances organized in one place.
            </p>
            <div className="flex items-center gap-3.5 flex-wrap">
              <Link
                href="/auth"
                className="px-6 py-3 bg-[#111111] hover:bg-black text-white font-semibold text-sm rounded-full transition-all duration-200 shadow-sm active:scale-95"
              >
                Get Started
              </Link>
              <Link
                href="#how-it-works"
                className="px-6 py-3 bg-transparent hover:bg-black/5 text-[#111111] border border-black/30 font-semibold text-sm rounded-full transition-all duration-200 active:scale-95"
              >
                See How It Works
              </Link>
            </div>
          </div>

        </div>

        {/* Feature Section: How It Works */}
        <HowItWorksSection />

        {/* Analytics Section: Finance Analytics */}
        <FinanceAnalyticsSection />

        {/* Product Section: Everything your finance team needs */}
        <ProductFeatureGrid />

        {/* Global Operations Section: Animated Dotted 3D Globe */}
        <GlobalOperationsSection />

        {/* Security & Governance Section */}
        <SecurityTrustSection />

        {/* Customer Experience Section: Dual Infinite Marquee Photo Gallery */}
        <CustomerExperienceSection />

        {/* Pricing Section: 3-Tier Widescreen Rounded Cards */}
        <PricingSection />

        {/* Comprehensive Two-Panel Footer */}
        <Footer />

      </main>
    </div>
  );
}
