import type { Metadata, Viewport } from "next";
// Design System Dani Moscatelli: fontes, Tailwind v4 e tokens (cópias sincronizadas, ver design-system/README.md).
import "@/styles/index.css";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SessionProvider } from "@/components/session";

// O Next descarta o @import url(...) externo do fonts.css do DS ao gerar o CSS. As fontes são carregadas por <link>,
// com o endereço lido da própria cópia do fonts.css na geração do site: muda junto quando a sincronização trouxer outro.
const FONTES_DS = /@import url\(['"]?([^'")]+)['"]?\)/.exec(readFileSync(join(process.cwd(), "src/styles/fonts.css"), "utf8"))?.[1];

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
        {FONTES_DS && <link href={FONTES_DS} rel="stylesheet" />}
      </head>
      <body className="flex min-h-dvh flex-col"><SessionProvider>{children}</SessionProvider></body>
    </html>
  );
}
