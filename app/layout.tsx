import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Street Mint",
  description: "Own a piece of the streets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWalletProvider>
          {/* <CandyMachineProvider>{children}</CandyMachineProvider> */}
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
