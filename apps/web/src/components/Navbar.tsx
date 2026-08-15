"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { session, activeOrg, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 transition-all duration-300 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? "w-full max-w-[900px] h-12 px-5 py-2 bg-[#F4F3ED]/90 backdrop-blur-md rounded-full shadow-md border border-black/10 text-xs mt-1"
            : "w-full max-w-[1400px] h-16 px-6 py-4 bg-transparent text-sm"
        }`}
      >
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-[#111111] group">
            {/* Black Triangle Logo */}
            <svg
              className={`transition-all duration-300 ${scrolled ? "w-4 h-4" : "w-5 h-5"} text-[#111111]`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3L2 20h20L12 3z" />
            </svg>
            <span className={`font-extrabold tracking-tight transition-all duration-300 text-[#111111] ${scrolled ? "text-sm" : "text-base"}`}>
              LedgerPilot
            </span>
          </Link>

          <div className={`h-4 w-[1px] bg-black/20 ${scrolled ? "mx-1" : "mx-2"}`} />

          <div className="hidden md:flex items-center gap-6 font-semibold text-[#111111]/80">
            <Link href="#product" className="hover:text-black transition-colors">
              Product
            </Link>
            <Link href="#how-it-works" className="hover:text-black transition-colors">
              How It Works
            </Link>
            <Link href="#security" className="hover:text-black transition-colors">
              Security
            </Link>
            <Link href="#pricing" className="hover:text-black transition-colors">
              Pricing
            </Link>
          </div>
        </div>

        {/* Right Side: Auth / CTA Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {session && activeOrg ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-semibold text-black/80 hover:text-black transition-colors"
              >
                Dashboard ({activeOrg.name})
              </Link>

              <button
                type="button"
                onClick={() => signOut()}
                className="text-xs font-medium text-black/60 hover:text-black transition-colors px-2 py-1"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden sm:block text-xs sm:text-sm font-semibold text-[#111111]/80 hover:text-black transition-colors"
              >
                Sign In
              </Link>

              <div className="hidden sm:block h-4 w-[1px] bg-black/20" />

              <Link
                href="/auth"
                className={`font-semibold text-white bg-[#111111] hover:bg-black transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow active:scale-95 ${
                  scrolled
                    ? "px-3.5 py-1.5 text-xs rounded-full"
                    : "px-5 py-2 text-sm rounded-full"
                }`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
