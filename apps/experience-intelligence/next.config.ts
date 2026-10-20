import type { NextConfig } from "next";

// Site estático (sem servidor): a segurança dos dados vem das regras de acesso do banco (RLS) e das
// funções do Supabase. Facilita publicar no Netlify como um segundo site.
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
