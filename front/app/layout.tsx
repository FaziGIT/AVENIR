import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ClientProviders from "@/components/client-providers";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AVENIR - Banking Application",
  description: "Modern banking application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <WebSocketProvider>
            {children}
            <Toaster />
            <ClientProviders />
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
