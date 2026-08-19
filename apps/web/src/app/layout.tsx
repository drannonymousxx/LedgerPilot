import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { OrganizationProvider } from "@/lib/org-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LedgerPilot | AI Finance Operations",
  description: "AI-powered financial categorization and operations platform for startups",
  icons: {
    icon: "/logo/logoblack.png",
    shortcut: "/logo/logoblack.png",
    apple: "/logo/logoblack.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AuthProvider>
          <OrganizationProvider>{children}</OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

