import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/SessionProvider";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Nordic Football Betting | Free Live Betting Game",
  description: "Free-to-play Nordic football betting with Finnish and Swedish leagues. Live betting, enhanced odds, and diamond rewards system.",
  keywords: "Nordic football, Finnish football, Swedish football, free betting, live betting, Veikkausliiga, Allsvenskan",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen antialiased`}>
        <Providers>
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
