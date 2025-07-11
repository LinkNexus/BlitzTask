import { PageInfosProvider } from "@/components/custom/page-infos-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppStoreProvider } from "@/store/store-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="apple-mobile-web-app-title" content="Blitz-Task" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppStoreProvider>
          <PageInfosProvider>
            {children}
            <Toaster />
          </PageInfosProvider>
        </AppStoreProvider>
      </body>
    </html>
  );
}
