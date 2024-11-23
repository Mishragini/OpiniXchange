import type { Metadata } from "next";
import { Work_Sans } from 'next/font/google';
import "./globals.css";
import { MarketsProvider } from "./_components/MarketsProvider";
import { AuthProvider } from "./_components/AuthProvider";
import { Appbar } from "./_components/Appbar";
import Footer from "./_components/Footer";
import { Category } from "./dashboard/_components/Categories";
import { CategoryProvider } from "./_components/CategoryProvider";
import { WebSocketProvider } from "./dashboard/_components/WebsocketProvider";
import { Toaster } from "@/components/ui/toaster";

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
      <body
        className={`${workSans.className} antialiased`}
      >

        <MarketsProvider>
          {children}
          <Toaster />
          <Footer />

        </MarketsProvider>

      </body>
    </html>
  );
}
