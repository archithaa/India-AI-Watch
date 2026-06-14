import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "India AI Watch — AI policy promises, held to account",
  description:
    "A civic accountability project tracking what Indian state governments promise on AI, what they actually do, and who gets left out.",
  openGraph: {
    title: "India AI Watch",
    description: "India's AI policy promises, tracked and held to account.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <Nav />
        <main>{children}</main>
        <footer className="mt-24 border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">India AI Watch</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Made in Bengaluru
              </p>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <a href="/methodology" className="hover:text-slate-800">Methodology</a>
              <a href="/data" className="hover:text-slate-800">Open Data</a>
              <a href="/fork" className="hover:text-slate-800">Fork This</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">GitHub ↗</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
