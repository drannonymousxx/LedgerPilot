"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { CSVImportResponse } from "@/lib/types";

interface CSVImportDropzoneProps {
  onImportSuccess?: () => void;
}

export function CSVImportDropzone({ onImportSuccess }: CSVImportDropzoneProps) {
  const { token } = useAuth();
  const { activeOrg } = useOrg();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CSVImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !activeOrg) return;
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.importCSV(activeOrg.id, file, token);
      setResult(res);
      setFile(null);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload CSV");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-8 max-w-xl mx-auto space-y-6 shadow-sm">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-extrabold text-[#111111] tracking-tight">Import Transactions CSV</h2>
        <p className="text-xs text-black/60 font-medium">
          Upload a bank/credit card CSV export containing vendor, amount, date, and description.
        </p>
      </div>

      {/* File Dropzone */}
      <div className="border-2 border-dashed border-black/20 hover:border-black rounded-xl p-8 text-center bg-[#F8F7F2] transition-colors">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />
        <label htmlFor="csv-file-input" className="cursor-pointer block space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#111111] text-white mx-auto flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-[#111111]">Click to select CSV file</span>
            <p className="text-xs text-black/50 font-medium mt-0.5">sample_transactions.csv or custom export</p>
          </div>
        </label>

        {file && (
          <div className="mt-4 p-3 bg-white border border-black/15 rounded-xl flex items-center justify-between text-xs text-[#111111] shadow-sm">
            <span className="font-mono truncate font-semibold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            <button
              onClick={() => setFile(null)}
              className="text-black/50 hover:text-black font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={handleUpload}
          disabled={!file || uploading || !activeOrg}
          className="w-full py-3.5 px-4 bg-[#111111] hover:bg-black text-white font-extrabold text-sm rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading & Processing..." : "Upload & Run Gemini Categorization"}
        </button>
      </div>

      {/* Upload Result Feedback */}
      {result && (
        <div className="p-4 bg-[#F8F7F2] border border-black/15 rounded-xl space-y-2 text-[#111111]">
          <div className="flex items-center gap-2 font-extrabold text-sm">
            <svg className="w-5 h-5 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Import Complete!
          </div>
          <p className="text-xs text-black/70 font-medium">
            Successfully imported <strong className="text-[#111111]">{result.imported_count}</strong> rows. Skipped <strong className="text-[#111111]">{result.skipped_count}</strong> rows.
          </p>
          {result.errors.length > 0 && (
            <div className="mt-2 text-xs text-black/80 space-y-1">
              <strong>Row Errors:</strong>
              <ul className="list-disc list-inside">
                {result.errors.map((err, idx) => (
                  <li key={idx}>Row {err.row}: {err.reason}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[11px] text-black/60 pt-1 font-medium">
            Background Gemini categorization has been launched. Check the Review Queue to see AI suggestions.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-black/5 border border-black/15 rounded-xl text-[#111111] text-xs font-semibold">
          <strong>Upload Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

