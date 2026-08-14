"use client";

import { useRouter } from "next/navigation";
import { CSVImportDropzone } from "@/components/CSVImportDropzone";

export default function CSVImportPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Small delay to allow background categorization to launch, then navigate
    setTimeout(() => {
      router.push("/dashboard/transactions");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Import Financial Activity</h1>
        <p className="text-sm text-slate-400">
          Upload bank statement CSV files to trigger background Gemini AI categorization
        </p>
      </div>

      {/* CSV Dropzone Component */}
      <CSVImportDropzone onImportSuccess={handleSuccess} />

      {/* Guidance Card */}
      <div className="glass-panel p-6 max-w-xl mx-auto space-y-3 bg-slate-950/60 border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300">Expected CSV Format</h3>
        <p className="text-xs text-slate-400">
          The uploaded CSV file must contain the following headers:
        </p>
        <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono text-indigo-300">
          vendor,amount,date,description
        </div>
        <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 pt-1">
          <li><strong>vendor</strong>: Merchant or vendor raw string (e.g. "AWS", "Uber")</li>
          <li><strong>amount</strong>: Dollar amount (e.g. "-1240.00" for expenses, "5000.00" for revenue)</li>
          <li><strong>date</strong>: YYYY-MM-DD format (e.g. "2026-08-01")</li>
          <li><strong>description</strong>: Optional details or memo string</li>
        </ul>
      </div>
    </div>
  );
}
