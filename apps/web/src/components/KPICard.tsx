import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: "pending" | "approved" | "edited" | "rejected" | "neutral";
  icon?: React.ReactNode;
}

export function KPICard({ title, value, subtitle, badgeText, icon }: KPICardProps) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm hover:border-black/20 transition-all flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-black/50 uppercase tracking-wider">{title}</span>
        {icon && <div className="text-black/40">{icon}</div>}
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">{value}</span>
          {badgeText && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#F8F7F2] border border-black/10 text-xs font-semibold text-[#111111]">
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-black/60 font-medium mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

