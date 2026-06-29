import type { Metadata } from "next";
import { Amiri, Cairo } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const sans = Cairo({
  variable: "--font-sans",
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "700"],
});

const display = Amiri({
  variable: "--font-display",
  subsets: ["latin", "arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Daam | Plateforme d’apprentissage guidée",
  description:
    "Une plateforme éducative soignée avec tests de placement, parcours de leçons structurés, quiz et outils d’administration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning className={`${sans.variable} ${display.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
