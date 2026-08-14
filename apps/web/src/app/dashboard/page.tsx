"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [status, setStatus] = useState<string>("loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setStatus(data.status || JSON.stringify(data));
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="border p-4 rounded max-w-md">
        <h2 className="text-lg font-semibold mb-2">API Connection Status</h2>
        <p>
          Status: <span className="font-mono">{status}</span>
        </p>
        {error && (
          <p className="text-red-500 text-sm mt-2">Error: {error}</p>
        )}
      </div>
    </main>
  );
}
