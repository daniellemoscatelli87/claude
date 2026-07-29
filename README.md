# Danielle Moscatelli — Experience Design Studio

Site profissional de Danielle Moscatelli: currículo vivo, portfólio e site
corporativo em um só lugar, com versão bilíngue PT‑BR (mercado brasileiro) e
EN (mercado europeu/irlandês).

## Estrutura de conteúdo

Todo o conteúdo factual vive em `src/data/*.ts`, com pares `{ pt, en }` para
tudo que muda de framing entre os dois mercados (hero, sobre, trajetória,
cases). Nada foi inventado: cada dado vem dos documentos compartilhados
(CV, licenças/certificados, projetos, recomendações, reconhecimentos).

- `profile.ts` — hero, sobre, formação, idiomas, ferramentas
- `timeline.ts` — trajetória profissional (fase, tag, título de impacto, palavras-chave)
- `cases.ts` — cases flagship (deep-dive), arquivo completo e "Cofre de Inovação" (NDA)
- `testimonials.ts`, `certifications.ts`, `awards.ts`, `expertise.ts`, `clients.ts`, `articles.ts`

## Gaps conhecidos (placeholders prontos para receber o real)

- **Logo**: nenhum arquivo de logo foi enviado — `src/components/Logo.tsx` usa
  um wordmark de texto ("DM") até a logo oficial (branca para dark mode) ser
  fornecida.
- **Paleta de cores**: os tokens em `src/index.css` (`--color-graphite-*`,
  `--color-blood-*`) foram calibrados visualmente a partir da referência de
  design system compartilhada. Se houver um export exato de tokens (Figma/JSON),
  é só substituir os valores hexadecimais.
- **Logos de clientes**: `src/data/clients.ts` lista os nomes reais dos clientes
  como wordmarks de texto até as logos oficiais chegarem.
- **Matérias**: `src/data/articles.ts` está vazio de propósito — nenhuma matéria
  foi compartilhada ainda.
- **Artefatos visuais dos cases**: cada case lista os artefatos que foram
  realmente produzidos (personas, blueprints, BMC, etc.) como "sob solicitação"
  — nenhuma imagem foi inventada. Basta anexar as imagens reais por case.
- **Cofre de Inovação (NDA)**: o gate de acesso em `VaultSection.tsx` é um
  controle de front-end (não substitui um NDA jurídico) que libera o conteúdo
  localmente e abre um e-mail pré-preenchido para `daniellemoscatelli87@gmail.com`.
- **Formulário de contato**: usa `mailto:` como fallback funcional sem backend.
  Para captura real de leads, integrar com um serviço (Formspree, EmailJS, etc.).

## Rodando localmente

```bash
npm install
npm run dev
```

## Stack

React + TypeScript + Vite + Tailwind CSS v4 + React Router + Zustand + lucide-react.
