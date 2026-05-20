import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Бюджет",
  },
  applicationName: "Семейный бюджет",
  description: "PWA для расходов, доходов, обязательных платежей и cashflow.",
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: "/icons/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
  title: {
    default: "Семейный бюджет",
    template: "%s · Семейный бюджет",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f8fafc",
  userScalable: false,
  viewportFit: "cover",
  width: "device-width",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
