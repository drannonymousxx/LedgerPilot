import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OrganizationProvider } from "@/lib/org-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LedgerPilot — AI Finance Ops Platform",
  description: "AI-powered financial categorization and operations platform for startups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OrganizationProvider>{children}</OrganizationProvider>
      </body>
    </html>
  );
}
