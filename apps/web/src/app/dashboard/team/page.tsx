"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";
import { TeamMember } from "@/lib/types";

export default function OrganizationTeamPage() {
  const { session, user, refreshAuth } = useAuth();
  const { activeOrg } = useOrg();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Owner Password Form State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<string | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Owner Invite Member Form State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("accountant");
  const [invitingMember, setInvitingMember] = useState(false);

  const token = session?.access_token;
  const isOwner = activeOrg?.role === "owner";

  const fetchMembers = async () => {
    if (!activeOrg?.id || !token) return;
    try {
      setLoading(true);
      const data = await api.getOrganizationMembers(activeOrg.id, token);
      setMembers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeOrg?.id, token]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg?.id || !token || !newPasswordInput.trim()) return;
    try {
      setUpdatingPassword(true);
      setPasswordStatusMsg(null);
      await api.setOrganizationPassword(activeOrg.id, newPasswordInput.trim(), token);
      await refreshAuth();
      setPasswordStatusMsg("Organization password updated successfully!");
      setNewPasswordInput("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStatusMsg(null);
      }, 1200);
    } catch (err: any) {
      setPasswordStatusMsg(err.message || "Failed to set organization password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg?.id || !token || !inviteEmail.trim()) return;
    try {
      setInvitingMember(true);
      setError(null);
      await api.inviteOrganizationMember(
        activeOrg.id,
        inviteEmail.trim(),
        inviteName.trim() || undefined,
        inviteRole,
        token
      );
      setInviteEmail("");
      setInviteName("");
      setInviteRole("accountant");
      setShowInviteModal(false);
      await fetchMembers();
    } catch (err: any) {
      setError(err.message || "Failed to send member invitation.");
    } finally {
      setInvitingMember(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
            Organization Team
          </h1>
          <p className="text-sm text-black/60 font-medium mt-1">
            Manage active members, team credentials, and invitations for{" "}
            <span className="font-bold text-[#111111]">{activeOrg?.name}</span>.
          </p>
        </div>

        {/* Actions for Owner */}
        {isOwner && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2.5 bg-white border border-black/15 text-[#111111] hover:bg-black/5 font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-95"
            >
              Security & Password
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 bg-[#111111] hover:bg-black text-white font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <span>+ Invite Member</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-black/5 border border-black/15 text-xs font-semibold text-[#111111] flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-black/40 hover:text-black">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Left Column (Your Profile & Credentials) + Right Column (Member Roster) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Current User Profile & Org Credentials */}
        <div className="space-y-6 lg:col-span-1">
          {/* User Profile Card */}
          <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-black/50 uppercase tracking-wider mb-4">
              Your Authenticated Profile
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#111111] text-white font-extrabold flex items-center justify-center text-lg">
                {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <h3 className="font-extrabold text-[#111111] text-base truncate">
                  {user?.full_name || "User"}
                </h3>
                <p className="text-xs text-black/60 font-mono truncate">{user?.email}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-black/5 flex items-center justify-between">
              <span className="text-xs text-black/60 font-medium">Your Organization Role:</span>
              <span className="px-2.5 py-1 rounded-md bg-[#111111] text-white text-[11px] font-extrabold uppercase tracking-wide">
                {activeOrg?.role || "Member"}
              </span>
            </div>
          </div>

          {/* Owner Credentials Card (Visible only to Owner) */}
          {isOwner && (
            <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-black/50 uppercase tracking-wider">
                Organization Controls (Owner Only)
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-black/60 uppercase tracking-wider mb-1">
                  Invite Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeOrg?.invite_code || "N/A"}
                    className="w-full bg-[#F8F7F2] border border-black/10 rounded-lg px-3 py-2 text-xs font-mono text-[#111111]"
                  />
                  <button
                    onClick={() => {
                      if (activeOrg?.invite_code) {
                        navigator.clipboard.writeText(activeOrg.invite_code);
                        alert("Invite code copied to clipboard!");
                      }
                    }}
                    className="px-3 py-2 bg-black/5 hover:bg-black/10 text-xs font-semibold text-[#111111] rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-black/60 uppercase tracking-wider mb-1">
                  Organization Password
                </label>
                <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-black/10 flex items-center justify-between text-xs font-medium">
                  {activeOrg?.has_password ? (
                    <>
                      <span className="font-mono text-sm tracking-widest text-[#111111]">••••••••</span>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white font-semibold text-xs rounded-lg transition-all shadow-sm"
                      >
                        Change Password
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-black/60 font-medium">Not set</span>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white font-semibold text-xs rounded-lg transition-all shadow-sm"
                      >
                        Set Password
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real PostgreSQL Member Roster */}
        <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-[#111111]">Team Members & Invitations</h2>
                <p className="text-xs text-black/60 font-medium">
                  {members.length} registered member{members.length !== 1 ? "s" : ""} & pending invite{members.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-black/50">
                Loading team roster...
              </div>
            ) : members.length === 0 ? (
              <div className="py-12 text-center text-xs text-black/50">
                No organization members found.
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {members.map((m) => {
                  const isCurrentUser = m.email.toLowerCase() === user?.email?.toLowerCase();
                  return (
                    <div key={m.id} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F8F7F2] border border-black/10 flex items-center justify-center font-bold text-xs text-[#111111]">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-[#111111]">
                              {m.name}
                            </span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-extrabold text-[#111111]">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-black/60 font-mono">{m.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-[#F8F7F2] border border-black/10 text-[11px] font-semibold text-[#111111] capitalize">
                          {m.role}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                            m.is_pending
                              ? "bg-black/5 text-black/60 border border-black/10"
                              : "bg-[#111111] text-white"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Owner Set/Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-black/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#111111]">
                {activeOrg?.has_password ? "Change Organization Password" : "Set Organization Password"}
              </h3>
              <p className="text-xs text-black/60 font-medium mt-1">
                Enter a new password for members joining <span className="font-bold text-[#111111]">{activeOrg?.name}</span>.
              </p>
            </div>

            {passwordStatusMsg && (
              <div className="p-3 rounded-xl bg-black/5 border border-black/15 text-xs font-semibold text-[#111111]">
                {passwordStatusMsg}
              </div>
            )}

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F8F7F2] border border-black/15 rounded-xl px-4 py-2.5 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black focus:outline-none"
                    aria-label={showPasswordText ? "Hide password" : "Show password"}
                    title={showPasswordText ? "Hide password" : "Show password"}
                  >
                    {showPasswordText ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 013.682-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243m4.243 4.243L3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-black/60 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white font-semibold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {updatingPassword ? "Updating Password..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-black/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-[#111111]">Invite Team Member</h3>
              <p className="text-xs text-black/60 font-medium mt-1">
                Send a real team invitation to join <span className="font-bold text-[#111111]">{activeOrg?.name}</span>.
              </p>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="w-full bg-[#F8F7F2] border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#F8F7F2] border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] mb-1.5">
                  Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-[#F8F7F2] border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="accountant">Accountant (Transaction review & CSV import)</option>
                  <option value="viewer">Viewer (Read-only financial overview)</option>
                  <option value="admin">Admin (Manage members & finance operations)</option>
                </select>
                <p className="text-[11px] text-black/50 mt-1">
                  Note: Owner role cannot be assigned through invitations.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-black/60 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={invitingMember}
                  className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white font-semibold text-xs rounded-xl shadow-sm disabled:opacity-50"
                >
                  {invitingMember ? "Creating Invitation..." : "Create Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
