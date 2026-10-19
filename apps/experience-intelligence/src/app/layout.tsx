import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session";

export const metadata: Metadata = {
  title: "DM | Experience Intelligence",
  description: "Conte o que você quer melhorar e seja guiado, passo a passo, a entender a situação.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body><SessionProvider>{children}</SessionProvider></body>
    </html>
  );
}
