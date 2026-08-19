"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { api } from "@/lib/api";
import { ChatMessage } from "@/lib/types";

export function CommunityChat() {
  const { token, user } = useAuth();
  const { activeOrg } = useOrg();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const chatFeedRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!activeOrg || !token) return;
    try {
      const data = await api.getOrganizationMessages(activeOrg.id, token);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load community chat messages:", err);
    } finally {
      setLoading(false);
    }
  }, [activeOrg, token]);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
    // Poll every 5 seconds for reliable real-time database syncing
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    // Scroll only internal container, NEVER window
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeOrg || !token || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const sentMsg = await api.sendOrganizationMessage(activeOrg.id, textToSend, token);
      setMessages((prev) => [...prev, sentMsg]);
    } catch (err) {
      console.error("Failed to send chat message:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-[#111111] text-white";
      case "admin":
        return "bg-black/10 text-[#111111] border border-black/15 font-bold";
      case "accountant":
        return "bg-[#F8F7F2] text-[#111111] border border-black/15 font-semibold";
      default:
        return "bg-[#F8F7F2] text-black/70 border border-black/10 font-medium";
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-black/10 p-6 shadow-sm flex flex-col justify-between h-full min-h-[380px]">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/10">
          <div>
            <h3 className="text-base font-extrabold text-[#111111] tracking-tight">Organization Chat</h3>
            <p className="text-xs text-black/60 font-medium">
              Private Channel for <strong>{activeOrg?.name}</strong> Members
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#111111] bg-[#F8F7F2] border border-black/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-pulse"></span>
            Tenant Isolated
          </div>
        </div>

        {/* Message Feed Container */}
        <div ref={chatFeedRef} className="space-y-3 h-[240px] overflow-y-auto pr-1">
          {loading && messages.length === 0 ? (
            <div className="text-center py-12 text-xs text-black/50">
              Loading organization messages from database...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 space-y-1">
              <p className="text-xs font-bold text-[#111111]">No messages yet</p>
              <p className="text-[11px] text-black/50">
                Start the discussion with team members of <strong>{activeOrg?.name}</strong>.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = user && (msg.sender_user_id === user.id || msg.sender_email.toLowerCase() === user.email.toLowerCase());
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-black/50 mb-0.5">
                    <span className="font-bold text-black">{msg.sender_name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold capitalize ${getRoleBadgeStyle(msg.sender_role)}`}>
                      {msg.sender_role}
                    </span>
                    <span>• {formatTimestamp(msg.created_at)}</span>
                  </div>
                  <div
                    className={`max-w-[85%] text-xs px-3.5 py-2 rounded-2xl leading-relaxed ${
                      isOwn
                        ? "bg-[#111111] text-white rounded-br-none"
                        : "bg-[#F8F7F2] text-[#111111] border border-black/10 rounded-bl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>


      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-black/10 flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${activeOrg?.name || "team"}...`}
          className="flex-1 bg-[#F8F7F2] border border-black/15 rounded-xl px-3.5 py-2 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-[#111111] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-40 shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
