import "~/styles/globals.css";
import "~/styles/exchange-global.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "~/context/AuthContext";
import { ChatProvider } from "~/context/ChatContext";

export const metadata: Metadata = {
  title: {
    default: "Addies Exchange",
    template: "%s | Addies Exchange",
  },
  description:
    "Addies Exchange — Buy & sell anything, anywhere. Lakhs of pre-loved items: mobiles, vehicles, property & more.",
  keywords: ["Addies Exchange", "buy sell", "marketplace", "pre-loved", "second hand India"],
  authors: [{ name: "Addies Exchange Team" }],
  creator: "Addies Exchange",
  publisher: "Addies Exchange",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <AuthProvider>
              <ChatProvider>{children}</ChatProvider>
            </AuthProvider>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
