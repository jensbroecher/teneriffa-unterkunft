import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EditModeProvider } from "@/components/EditModeContext";
import PageTransition from "../components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casa Tenerife – Ferienunterkunft",
  description:
    "Gemütliche Ferienunterkunft auf Teneriffa mit Buchungskalender und Kontakt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-zinc-900 min-h-screen flex flex-col`}>
        <EditModeProvider>
          <Navbar />
          <main className="flex-1 mx-auto max-w-6xl mt-6 px-4 py-8">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </EditModeProvider>
      </body>
    </html>
  );
}
