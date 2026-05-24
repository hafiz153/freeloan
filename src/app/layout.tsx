import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth/auth-context';
import { I18nProvider } from '@/lib/i18n';
import { Navbar } from '@/components/layout/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FreeLoan - Interest-Free Loan Management",
  description: "Free Loan Management System - Manage donations and distribute interest-free loans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>
          <I18nProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Toaster position="top-right" />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
