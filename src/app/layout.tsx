import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { AppProvider } from "./provider";

const fontSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Walias.io",
  description: "Manage your Lightning Domains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontSans.className
        )}
      >
        <Toaster position='top-right' duration={1000} />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
