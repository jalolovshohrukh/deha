import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { t } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: t.appName,
  description: t.appTagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111315",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tg" className={inter.variable}>
      <body className="refresh font-sans antialiased">{children}</body>
    </html>
  );
}
