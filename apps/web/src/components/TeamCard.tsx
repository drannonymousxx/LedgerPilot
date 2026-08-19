"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";
import { TeamMember } from "@/lib/types";

export function TeamCard() {
  const { token, user } = useAuth();
  const { activeOrg } = useOrg();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMembers = useCallback(async () => {
    if (!activeOrg || !token) return;
    setLoading(true);
    try {
      const data = await api.getOrganizationMembers(activeOrg.id, token);
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    } finally {
      setLoading(false);
    }
  }, [activeOrg, token]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-black text-white border-black";
      case "admin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "accountant":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "viewer":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-black/10 p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10">
          <div>
            <h3 className="text-base font-extrabold text-[#111111] tracking-tight">Organization Team</h3>
            <p className="text-xs text-black/60 font-medium">
              {activeOrg?.name} • Real-time PostgreSQL Members
            </p>
          </div>
          <button
            onClick={fetchMembers}
            className="text-[11px] font-semibold text-black/60 hover:text-black bg-black/5 hover:bg-black/10 px-2.5 py-1 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-black/50">
            Loading organization team from database...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-xs text-black/50">
            No team members found.
          </div>
        ) : (
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {members.map((m) => {
              const isCurrentUser = user && (m.user_id === user.id || m.email.toLowerCase() === user.email.toLowerCase());
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] border border-black/5 hover:border-black/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white font-black text-xs flex items-center justify-center shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#111111] truncate flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-black/50 truncate font-mono">{m.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.is_pending ? (
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-2 py-0.5 rounded-full">
                        Pending Invite
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full capitalize ${getRoleBadgeStyle(
                          m.role
                        )}`}
                      >
                        {m.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-black/50">
        <span>Verified PostgreSQL Memberships</span>
        <span className="font-semibold text-black">{members.length} Total</span>
      </div>
    </div>
  );
}
