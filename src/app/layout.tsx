import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./(components)/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShipNotes – AI Release Notes Generator",
  description: "Turn commit messages into polished release notes, markdown, and social posts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-neutral-900 dark:text-neutral-100`}
      >
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">
            {children}
          </main>
          <footer className="w-full text-center py-4 text-sm text-neutral-600 dark:text-neutral-400 border-t border-neutral-200/60 dark:border-neutral-800/60 bg-white/60 dark:bg-neutral-900/40 backdrop-blur">
            © 2025 ShipNotes
          </footer>
        </div>
      </body>
    </html>
  );
}
