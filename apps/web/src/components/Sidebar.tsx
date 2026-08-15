"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { activeOrg, organizations, selectOrganization } = useOrg();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: "Review Queue",
      href: "/dashboard/transactions",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      name: "CSV Import",
      href: "/dashboard/import",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-[#111111] text-[#F4F3ED] border-r border-white/10 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white text-[#111111] flex items-center justify-center font-black text-sm">
              L
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight">LedgerPilot</h1>
              <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider block">
                Finance Operations
              </span>
            </div>
          </Link>
        </div>

        {/* Organization Switcher */}
        <div className="px-4 py-4 border-b border-white/10">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5 px-1">
            Active Workspace
          </label>
          <select
            value={activeOrg?.id || ""}
            onChange={(e) => selectOrganization(e.target.value)}
            className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id} className="bg-[#111111] text-white">
                {org.name} ({org.role})
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-[#111111] shadow-sm font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Authenticated User Profile & Sign Out Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs text-white/70">
          <div className="truncate max-w-[140px]">
            <p className="font-bold text-white truncate">{user?.full_name || "User"}</p>
            <p className="text-[10px] text-white/50 truncate font-mono">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="text-[11px] font-semibold text-white/60 hover:text-white px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
            title="Sign out of LedgerPilot"
          >
            Log Out
          </button>
        </div>
      </div>
    </aside>
  );
}
