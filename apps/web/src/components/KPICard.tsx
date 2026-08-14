import React from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: "pending" | "approved" | "edited" | "rejected" | "neutral";
  icon?: React.ReactNode;
}

export function KPICard({ title, value, subtitle, badgeText, badgeVariant = "neutral", icon }: KPICardProps) {
  const getBadgeClass = () => {
    switch (badgeVariant) {
      case "pending":
        return "badge-pending";
      case "approved":
        return "badge-approved";
      case "edited":
        return "badge-edited";
      case "rejected":
        return "badge-rejected";
      default:
        return "bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-xs";
    }
  };

  return (
    <div className="glass-panel p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
          {badgeText && <span className={getBadgeClass()}>{badgeText}</span>}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
