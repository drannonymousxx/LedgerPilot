"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const router = useRouter();
  const { session, user, hasOrg, loading, signInWithGoogle, createOrg, joinOrg } = useAuth();

  const [onboardingMode, setOnboardingMode] = useState<"create" | "join">("create");
  const [createStep, setCreateStep] = useState<1 | 2>(1);

  // Profile setup for missing display name
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");

  // Create Org fields
  const [orgName, setOrgName] = useState("");
  const [orgPassword, setOrgPassword] = useState("");
  
  // Team invitation fields (Phase 5)
  const [member1Name, setMember1Name] = useState("");
  const [member1Email, setMember1Email] = useState("");
  const [member1Role, setMember1Role] = useState("accountant");
  const [member2Name, setMember2Name] = useState("");
  const [member2Email, setMember2Email] = useState("");
  const [member2Role, setMember2Role] = useState("viewer");

  // Join Org fields (Phase 7)
  const [joinIdentifier, setJoinIdentifier] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joinRole, setJoinRole] = useState("accountant");

  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check if profile setup is required (missing full_name)
  useEffect(() => {
    if (!loading && session && hasOrg) {
      if (!user?.full_name || user.full_name.trim() === "" || user.full_name.includes("@")) {
        setShowProfileSetup(true);
      } else {
        router.push("/dashboard");
      }
    }
  }, [loading, session, hasOrg, user, router]);

  const handleNextCreateStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setActionError("Please enter an organization name");
      return;
    }
    if (!orgPassword || orgPassword.length < 4) {
      setActionError("Please enter an organization password (at least 4 characters)");
      return;
    }
    setActionError(null);
    setCreateStep(2);
  };

  const handleFinalizeCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const initialInvitations = [];
    if (member1Name.trim() && member1Email.trim()) {
      initialInvitations.push({
        name: member1Name.trim(),
        email: member1Email.trim(),
        role: member1Role,
      });
    }
    if (member2Name.trim() && member2Email.trim()) {
      initialInvitations.push({
        name: member2Name.trim(),
        email: member2Email.trim(),
        role: member2Role,
      });
    }

    try {
      await createOrg(orgName.trim(), orgPassword, initialInvitations);
      router.push("/dashboard");
    } catch (err: any) {
      setActionError(err.message || "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinIdentifier.trim()) {
      setActionError("Please enter an organization name or invite code");
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      await joinOrg(joinIdentifier.trim(), joinPassword || undefined, joinRole);
      router.push("/dashboard");
    } catch (err: any) {
      setActionError(err.message || "Failed to join organization. Please check details.");
    } finally {
      setSubmitting(false);
    }
  };

  const showOnboarding = Boolean(session && !hasOrg);

  return (
    <div className="min-h-screen bg-[#F4F3ED] text-[#111111] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#111111] selection:text-white">
      {/* Header Bar */}
      <header className="max-w-[1240px] w-full mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/logoblack.png"
            alt="LedgerPilot"
            width={130}
            height={34}
            priority
            className="object-contain h-8 w-auto"
          />
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-black/60 hover:text-black transition-colors px-3 py-1.5 rounded-full border border-black/10 hover:border-black/30"
        >
          ← Back to Website
        </Link>
      </header>

      {/* Main Split-Panel Interaction Container */}
      <main className="max-w-[1100px] w-full mx-auto my-auto py-8">
        <div className="relative w-full min-h-[580px] bg-white rounded-[32px] border border-black/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          
          {/* LEFT PANEL: Auth / Onboarding Form Container */}
          <div
            className={`p-8 sm:p-12 flex flex-col justify-between transition-all duration-500 ease-in-out ${
              showOnboarding ? "lg:order-2" : "lg:order-1"
            }`}
          >
            {!showOnboarding ? (
              /* AUTH STATE: Single Sign In with Google OAuth */
              <div className="my-auto max-w-md w-full mx-auto space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mb-2">
                    Sign In to LedgerPilot
                  </h1>
                  <p className="text-xs sm:text-sm text-black/60 leading-relaxed font-normal">
                    Access your AI transaction categorization, human review, and financial oversight dashboard.
                  </p>
                </div>

                {/* Primary Google OAuth Action */}
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[#111111] hover:bg-black text-white font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-black/10 w-full" />
                  <span className="bg-white px-3 text-[11px] font-semibold text-black/40 uppercase tracking-wider absolute">
                    Single Authentication Provider
                  </span>
                </div>

                {/* Non-functional Email/Password Form (Retained for Visual Parity with Reference Video) */}
                <div className="opacity-60 space-y-4 pointer-events-none">
                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      placeholder="name@company.com"
                      className="w-full bg-[#F8F7F2] border border-black/10 rounded-xl px-4 py-2.5 text-sm text-black/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-black/70 mb-1">Password</label>
                    <input
                      type="password"
                      disabled
                      placeholder="••••••••"
                      className="w-full bg-[#F8F7F2] border border-black/10 rounded-xl px-4 py-2.5 text-sm text-black/40"
                    />
                  </div>
                  <p className="text-[11px] text-black/50 text-center font-medium">
                    Google OAuth is enabled for your organization domain.
                  </p>
                </div>
              </div>
            ) : (
              /* ONBOARDING STATE: Hello {Name} -> Create or Join Org */
              <div className="my-auto max-w-md w-full mx-auto space-y-6">
                <div>
                  <div className="inline-block px-3 py-1 bg-black/5 border border-black/10 rounded-full text-xs font-semibold text-[#111111] mb-3">
                    Account Connected
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] mb-2">
                    Hello, {user?.full_name || user?.email?.split("@")[0] || "User"}
                  </h1>
                  <p className="text-xs sm:text-sm text-black/60 leading-relaxed font-normal">
                    You're signed in with Google. Select an option below to set up your LedgerPilot workspace.
                  </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex bg-[#F4F3ED] p-1 rounded-xl border border-black/5">
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingMode("create");
                      setActionError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      onboardingMode === "create" ? "bg-white text-[#111111] shadow-sm" : "text-black/60 hover:text-black"
                    }`}
                  >
                    Create Organization
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingMode("join");
                      setActionError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      onboardingMode === "join" ? "bg-white text-[#111111] shadow-sm" : "text-black/60 hover:text-black"
                    }`}
                  >
                    Join Organization
                  </button>
                </div>

                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    {actionError}
                  </div>
                )}

                {onboardingMode === "create" ? (
                  createStep === 1 ? (
                    <form onSubmit={handleNextCreateStep} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          required
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          placeholder="e.g. Acme Financial Systems"
                          className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                          Organization Password (Joining Credential)
                        </label>
                        <input
                          type="password"
                          required
                          value={orgPassword}
                          onChange={(e) => setOrgPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <p className="text-[11px] text-black/50 mt-1">
                          Secured with bcrypt. Required for team members joining your workspace.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#111111] hover:bg-black text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md text-xs sm:text-sm"
                      >
                        Next: Build your finance team →
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleFinalizeCreateOrg} className="space-y-4">
                      <div className="border-b border-black/10 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-[#111111]">Build your finance team</h3>
                          <p className="text-[11px] text-black/60">Invite two initial team members to <strong>{orgName}</strong></p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCreateStep(1)}
                          className="text-xs text-black/60 hover:text-black underline"
                        >
                          ← Back
                        </button>
                      </div>

                      {/* Member 1 */}
                      <div className="bg-[#F8F7F2] p-3 rounded-xl border border-black/10 space-y-2">
                        <div className="text-[11px] font-semibold text-black/70">Team Member 1</div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Name (e.g. Rahul)"
                            value={member1Name}
                            onChange={(e) => setMember1Name(e.target.value)}
                            className="bg-white border border-black/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                          />
                          <input
                            type="email"
                            placeholder="Email (e.g. rahul@company.com)"
                            value={member1Email}
                            onChange={(e) => setMember1Email(e.target.value)}
                            className="bg-white border border-black/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                          />
                        </div>
                        <select
                          value={member1Role}
                          onChange={(e) => setMember1Role(e.target.value)}
                          className="w-full bg-white border border-black/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                        >
                          <option value="accountant">Accountant (Finance Operations)</option>
                          <option value="admin">Admin (Manage Members & Finance)</option>
                          <option value="viewer">Viewer (Read-Only Access)</option>
                        </select>
                      </div>

                      {/* Member 2 */}
                      <div className="bg-[#F8F7F2] p-3 rounded-xl border border-black/10 space-y-2">
                        <div className="text-[11px] font-semibold text-black/70">Team Member 2</div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Name (e.g. Ananya)"
                            value={member2Name}
                            onChange={(e) => setMember2Name(e.target.value)}
                            className="bg-white border border-black/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                          />
                          <input
                            type="email"
                            placeholder="Email (e.g. ananya@company.com)"
                            value={member2Email}
                            onChange={(e) => setMember2Email(e.target.value)}
                            className="bg-white border border-black/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                          />
                        </div>
                        <select
                          value={member2Role}
                          onChange={(e) => setMember2Role(e.target.value)}
                          className="w-full bg-white border border-black/15 rounded-lg px-2.5 py-1.5 text-xs text-[#111111]"
                        >
                          <option value="viewer">Viewer (Read-Only Access)</option>
                          <option value="accountant">Accountant (Finance Operations)</option>
                          <option value="admin">Admin (Manage Members & Finance)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#111111] hover:bg-black text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-xs sm:text-sm"
                      >
                        {submitting ? "Creating Workspace..." : "Create Organization & Continue →"}
                      </button>
                    </form>
                  )
                ) : (
                  <form onSubmit={handleJoinOrg} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                        Organization Name or Invite Code
                      </label>
                      <input
                        type="text"
                        required
                        value={joinIdentifier}
                        onChange={(e) => setJoinIdentifier(e.target.value)}
                        placeholder="e.g. Acme Financial Systems or 09897215a0fa"
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                        Organization Password
                      </label>
                      <input
                        type="password"
                        required
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                        Requested Role
                      </label>
                      <select
                        value={joinRole}
                        onChange={(e) => setJoinRole(e.target.value)}
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="accountant">Accountant (Transaction review & CSV import)</option>
                        <option value="viewer">Viewer (Read-only financial overview)</option>
                        <option value="admin">Admin (Full administrative & finance access)</option>
                      </select>
                      <p className="text-[11px] text-black/50 mt-1">
                        Note: Owner role cannot be self-assigned.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#111111] hover:bg-black text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {submitting ? "Joining Workspace..." : "Join Organization →"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Footer note */}
            <div className="pt-6 border-t border-black/5 text-[11px] text-black/40 text-center">
              Protected by Supabase JWT Authentication & Organization Authorization
            </div>
          </div>

          {/* RIGHT PANEL: Dark Branding & Value Proposition Container */}
          <div
            className={`bg-[#111111] text-[#F4F3ED] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-500 ease-in-out ${
              showOnboarding ? "lg:order-1" : "lg:order-2"
            }`}
          >
            {/* Subtle background partial circle decoration */}
            <div className="absolute -top-16 -right-16 w-64 h-64 border border-white/10 rounded-full pointer-events-none" />

            <div className="relative z-10 my-auto space-y-6 sm:space-y-8">
              {/* Brand Logo */}
              <div>
                <Image
                  src="/logo/logowhite.png"
                  alt="LedgerPilot"
                  width={140}
                  height={36}
                  priority
                  className="object-contain h-8 sm:h-9 w-auto"
                />
              </div>

              {/* Main Messaging & Short Description */}
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white">
                  Financial operations,{" "}
                  <br />
                  <span className="font-serif italic font-normal text-white/95">
                    without the chaos.
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm font-normal">
                  AI-powered transaction intelligence and human-controlled financial workflows in one place.
                </p>
              </div>

              {/* Concise Value Points */}
              <div className="border-t border-white/10 pt-6">
                <ul className="space-y-3 text-xs sm:text-sm text-white/85 font-medium">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                    <span>AI Categorization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                    <span>Human Review</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                    <span>Organization-Level Control</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Secondary Information */}
            <div className="relative z-10 pt-6 text-[11px] text-white/40 border-t border-white/10 flex justify-between items-center font-mono">
              <span>LedgerPilot Core v0.1.0</span>
              <span>AI Finance Operations</span>
            </div>
          </div>

        </div>
      </main>

      <footer className="max-w-[1240px] w-full mx-auto text-center py-4 text-xs text-black/40">
        © {new Date().getFullYear()} LedgerPilot Inc. All rights reserved.
      </footer>
    </div>
  );
}
