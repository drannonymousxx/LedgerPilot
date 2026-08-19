"use client";

import React from "react";
import { useOrg } from "@/lib/org-context";
import { CommunityChat } from "@/components/CommunityChat";

export default function OrganizationChatPage() {
  const { activeOrg } = useOrg();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-black/10 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
          Organization Community Chat
        </h1>
        <p className="text-sm text-black/60 font-medium mt-1">
          Real-time organization-scoped chat for{" "}
          <span className="font-bold text-[#111111]">{activeOrg?.name}</span>.
        </p>
      </div>

      {/* Community Chat Component */}
      <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden p-6">
        <CommunityChat />
      </div>
    </div>
  );
}
