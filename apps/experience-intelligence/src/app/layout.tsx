import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session";

export const metadata: Metadata = {
  title: "DM | Experience Intelligence",
  description: "Transforme desafios em caminhos concretos de melhoria para clientes, pacientes, usuários, colaboradores e todas as pessoas que se relacionam com sua organização.",
  openGraph: {
    title: "DM | Experience Intelligence",
    description: "Experiências melhores começam quando entendemos o que precisa mudar.",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        {/* Com sessão salva, a landing não aparece enquanto a área logada carrega. */}
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('dm-ei-auth'))document.documentElement.classList.add('tem-sessao')}catch(e){}" }} />
      </head>
      <body><SessionProvider>{children}</SessionProvider></body>
    </html>
  );
}
