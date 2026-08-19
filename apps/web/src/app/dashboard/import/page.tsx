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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-black/10 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">Import Financial Activity</h1>
        <p className="text-sm text-black/60 font-medium mt-1">
          Upload bank statement CSV files to trigger background Gemini AI categorization
        </p>
      </div>

      {/* CSV Dropzone Component */}
      <CSVImportDropzone onImportSuccess={handleSuccess} />

      {/* Guidance Card */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 max-w-xl mx-auto space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-black/50 uppercase tracking-wider">Expected CSV Format</h3>
        <p className="text-xs text-black/70 font-medium">
          The uploaded CSV file must contain the following headers:
        </p>
        <div className="bg-[#F8F7F2] p-3 rounded-xl border border-black/10 text-xs font-mono text-[#111111]">
          vendor,amount,date,description
        </div>
        <ul className="text-xs text-black/60 font-medium list-disc list-inside space-y-1 pt-1">
          <li><strong>vendor</strong>: Merchant or vendor raw string (e.g. "AWS", "Uber")</li>
          <li><strong>amount</strong>: Dollar amount (e.g. "-1240.00" for expenses, "5000.00" for revenue)</li>
          <li><strong>date</strong>: YYYY-MM-DD format (e.g. "2026-08-01")</li>
          <li><strong>description</strong>: Optional details or memo string</li>
        </ul>
      </div>
    </div>
  );
}

