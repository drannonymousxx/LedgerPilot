"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { useOrg } from "@/lib/org-context";
import { CSVImportResponse } from "@/lib/types";

interface CSVImportDropzoneProps {
  onImportSuccess?: () => void;
}

export function CSVImportDropzone({ onImportSuccess }: CSVImportDropzoneProps) {
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
      const res = await api.importCSV(activeOrg.id, file);
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
    <div className="glass-panel p-8 max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">Import Transactions CSV</h2>
        <p className="text-xs text-slate-400">
          Upload a bank/credit card CSV export containing vendor, amount, date, and description.
        </p>
      </div>

      {/* File Dropzone */}
      <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center bg-slate-950/40 transition-colors">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-file-input"
        />
        <label htmlFor="csv-file-input" className="cursor-pointer block space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-semibold text-white">Click to select CSV file</span>
            <p className="text-xs text-slate-500 mt-0.5">sample_transactions.csv or custom export</p>
          </div>
        </label>

        {file && (
          <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg flex items-center justify-between text-xs text-indigo-300">
            <span className="font-mono truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            <button
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-white font-bold ml-2"
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
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading & Processing..." : "Upload & Run Gemini Categorization"}
        </button>
      </div>

      {/* Upload Result Feedback */}
      {result && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Import Complete!
          </div>
          <p className="text-xs text-slate-300">
            Successfully imported <strong className="text-white">{result.imported_count}</strong> rows. Skipped <strong className="text-white">{result.skipped_count}</strong> rows.
          </p>
          {result.errors.length > 0 && (
            <div className="mt-2 text-xs text-amber-400 space-y-1">
              <strong>Row Errors:</strong>
              <ul className="list-disc list-inside">
                {result.errors.map((err, idx) => (
                  <li key={idx}>Row {err.row}: {err.reason}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[11px] text-emerald-400/80 pt-1">
            Background Gemini categorization has been launched. Check the Review Queue to see AI suggestions.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
          <strong>Upload Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
