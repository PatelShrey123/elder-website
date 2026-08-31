import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import CursedEnergyBackground from "@/components/CursedEnergyBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elder Clan — Kirka.io Applications",
  description: "Apply to join Elder, a top Kirka.io clan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-[#07050c] text-gray-100 min-h-screen flex flex-col relative selection:bg-purple-500 selection:text-white`}>
        <Providers>
          <CursedEnergyBackground />
          <Header />
          <main className="flex-grow flex flex-col relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
