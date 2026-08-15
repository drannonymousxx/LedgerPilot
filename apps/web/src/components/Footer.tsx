"use client";

import React, { useState } from "react";
import Link from "next/link";

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ledgerscfo/?viewasmember=true",
    ariaLabel: "LedgerPilot on LinkedIn",
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.72a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
      </svg>
    ),
  },
  {
    name: "Website",
    href: "https://ledgerscfo.com/",
    ariaLabel: "LedgerPilot website",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/",
    ariaLabel: "LedgerPilot on X",
    icon: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/",
    ariaLabel: "LedgerPilot on Instagram",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#how-it-works" },
];

export function Footer() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && message) {
      setSubmitted(true);
    }
  };

  return (
    <footer className="w-full pt-16 pb-12 px-4 sm:px-6 lg:px-10 max-w-[1340px] mx-auto border-t border-black/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT PANEL: Compact Dark CTA Card (6 cols / 50% on desktop) */}
        <div className="lg:col-span-6 bg-[#111111] text-white rounded-[32px] p-8 sm:p-10 flex flex-col justify-between shadow-lg relative overflow-hidden group min-h-[380px]">
          {/* Subtle background glow effect */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full filter blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />

          {/* Brand Wordmark & Logo */}
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 20h20L12 3z" />
            </svg>
            <span className="font-extrabold text-xl tracking-tight text-white">
              LedgerPilot
            </span>
          </div>

          {/* Compact Headline & Body */}
          <div className="space-y-4 my-auto py-2">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.1] text-white max-w-lg">
              Financial operations,{" "}
              <br className="hidden sm:inline" />
              <span className="font-serif italic font-normal text-white/95">
                without the chaos.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-md">
              Bring transactions, AI categorization, human review, and financial oversight into one clear workflow.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-4 mt-auto">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center px-7 py-3 bg-white hover:bg-white/90 text-[#111111] font-bold text-sm rounded-full shadow transition-all duration-200 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Social Icons + Contact Navigation Panel (6 cols / 50% on desktop) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          
          {/* Top: 4 Larger Circular Social Buttons with Breathing Room */}
          <div className="flex items-center justify-start lg:justify-end gap-5">
            {socialLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.ariaLabel}
                className="w-14 h-14 rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-black hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
              >
                {item.icon}
              </a>
            ))}
          </div>

          {/* Bottom: Light Navigation & Contact Panel */}
          <div className="bg-[#F8F7F2] border border-black/10 rounded-[32px] p-8 sm:p-10 flex flex-col justify-between flex-1 shadow-sm space-y-6">
            
            {/* Top Navigation Items */}
            <nav aria-label="Footer Navigation">
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 font-semibold text-sm text-[#111111]">
                {navLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.href}
                      className="hover:text-black/60 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Divider */}
            <div className="border-t border-black/10" />

            {/* Contact Form Area */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#111111] tracking-tight">
                  Get in touch
                </h3>
                <p className="text-xs sm:text-sm text-black/60 font-medium pt-0.5">
                  Have a question about LedgerPilot? Send us a message and we'll get back to you.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 rounded-xl bg-black/5 border border-black/10 text-xs sm:text-sm font-semibold text-[#111111]">
                  ✓ Message sent! Thank you for reaching out to LedgerPilot.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-xs sm:text-sm text-[#111111] placeholder:text-black/40 focus:outline-none focus:border-black/30 transition-colors"
                    />
                  </div>
                  <div>
                    <textarea
                      rows={2}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you'd like to know..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 text-xs sm:text-sm text-[#111111] placeholder:text-black/40 focus:outline-none focus:border-black/30 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#111111] hover:bg-black text-white font-semibold text-xs sm:text-sm rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    Send message
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Divider */}
            <div className="border-t border-black/10" />

            {/* Copyright Notice */}
            <div className="text-xs text-black/50 font-medium">
              © {new Date().getFullYear()} LedgerPilot. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
