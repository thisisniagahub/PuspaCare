import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PUSPA — Sistem Pengurusan NGO",
  description: "Sistem Pengurusan Pertubuhan Urus Peduli Asnaf (PUSPA) KL & Selangor — Platform terpusat untuk pengurusan asnaf, program kebajikan, sumbangan, dan pematuhan regulasi.",
  keywords: ["PUSPA", "NGO", "asnaf", "zakat", "kebajikan", "Malaysia", "pengurusan"],
  authors: [{ name: "PUSPA" }],
  icons: {
    icon: "/puspa-logo-official.png",
    apple: "/puspa-logo-official.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
