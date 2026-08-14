import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">LedgerPilot</h1>
      <p className="mb-4">Welcome to LedgerPilot.</p>
      <Link href="/dashboard" className="text-blue-600 underline">
        Go to Dashboard
      </Link>
    </main>
  );
}
