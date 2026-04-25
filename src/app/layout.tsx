import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

const manrope = Manrope({
  variable: "--font-manrope",
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
        className={`${manrope.variable} font-sans antialiased bg-[#101415] text-[#e0e3e4] relative min-h-screen`}
      >
        {/* Global Premium Background Gradient - Aligned with DESIGN.md */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#101415] via-[#1c2021] to-[#0b0f10] opacity-100 z-[-1]" />
        
        {/* Ambient Glows */}
        <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ecb2ff]/5 blur-[120px] pointer-events-none z-[-1]" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00fbfb]/5 blur-[120px] pointer-events-none z-[-1]" />
        
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
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
