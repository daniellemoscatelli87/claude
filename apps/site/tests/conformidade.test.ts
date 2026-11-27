// Conformidade com o Design System Dani Moscatelli (D-053): regras, catraca e o app em zero.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error módulo JavaScript sem tipos
import { analisarTexto, comparar, executar, lerSincronizados, semComentarios } from "../scripts/conformidade/verificar.mjs";

type Ocorrencia = { regra: string; linha: number; trecho: string };
const regras = (texto: string, caminho = "x.tsx", nomes: string[] = []) => (analisarTexto(texto, caminho, nomes) as Ocorrencia[]).map((o) => o.regra);

describe("regras", () => {
  it("pega cor solta, mas não token, entidade HTML nem âncora", () => {
    expect(regras('const a = "#ffffff"; const b = "#FFF";')).toEqual(["cor-solta", "cor-solta"]);
    expect(regras('style={{ color: "rgb(var(--primary))" }}')).toEqual([]);
    expect(regras('<p>&#123;</p> href="#emails"')).toEqual([]);
  });

  it("ignora comentários", () => {
    expect(regras("// #fff\n/* text-[13px] */")).toEqual([]);
    expect(semComentarios("a /* b\nc */ d")).toBe("a     \n     d");
  });

  it("separa os valores arbitrários do Tailwind e aceita token", () => {
    expect(regras('className="text-[13px] rounded-[10px] shadow-[0_0_2px] p-[3px] bg-[#fff]"')).toEqual(["tw-texto", "tw-raio", "tw-sombra", "tw-espaco", "tw-cor"]);
    expect(regras('className="bg-[var(--primary-muted)] max-w-(--content-wide) grid-cols-[auto_1fr]"')).toEqual([]);
  });

  it("proíbe as paletas do Tailwind, inclusive pink; aceita graphite e crimson", () => {
    expect(regras('className="text-gray-500 bg-pink-50 border-blue-600"')).toEqual(["cor-paleta-tailwind", "cor-paleta-tailwind", "cor-paleta-tailwind"]);
    expect(regras('className="bg-graphite-100 text-crimson-500 bg-primary"')).toEqual([]);
  });

  it("proíbe sombra parada, mas aceita sombra no hover e no foco (D-041)", () => {
    expect(regras('className="rounded-xl shadow-sm"')).toEqual(["sombra-parada"]);
    expect(regras('className="shadow border"')).toEqual(["sombra-parada"]);
    expect(regras('className="hover:shadow-xs focus-visible:shadow-sm shadow-none"')).toEqual([]);
    expect(regras("const shadowRoot = el.shadowRoot;")).toEqual([]);
  });

  it("pega elementos HTML soltos só em arquivos com JSX", () => {
    expect(regras('<button>a</button><input /><select></select><textarea />')).toEqual(["html-button", "html-input", "html-select", "html-textarea"]);
    expect(regras("<Button /><Input />")).toEqual([]);
    expect(regras("button { }", "x.css")).toEqual([]);
  });

  it("pega peça feita à mão que o DS tem e componente com o nome de um do DS", () => {
    expect(regras("function Toast() {}\n<Toast />")).toEqual(["componente-duplicado", "componente-duplicado"]);
    expect(regras("export function Card() {}\nconst CardDoProduto = 1;", "x.tsx", ["Card"])).toEqual(["componente-duplicado"]);
  });
});

describe("arquivos sincronizados", () => {
  it("lê pastas inteiras e arquivos avulsos; ignora exclusões", () => {
    const s = lerSincronizados("src/styles/theme.css apps/site/src/styles/theme.css\nsrc/app/components/ui/ apps/site/src/components/ui/\nexcluir src/app/components/ui/calendar.tsx\n");
    expect(s.inclui("apps/site/src/components/ui/card.tsx")).toBe(true);
    expect(s.inclui("apps/site/src/styles/theme.css")).toBe(true);
    expect(s.inclui("apps/site/src/paginas/Inicio.tsx")).toBe(false);
  });
});

describe("catraca", () => {
  it("piorou quando sobe ou arquivo novo traz desvio; melhorou quando desce", () => {
    expect(comparar({ "a.tsx": { "tw-texto": 1 } }, { "b.tsx": { "tw-raio": 1 } })).toEqual({
      piorou: [{ arquivo: "b.tsx", regra: "tw-raio", antes: 0, agora: 1 }],
      melhorou: [{ arquivo: "a.tsx", regra: "tw-texto", antes: 1, agora: 0 }],
    });
  });

  let raiz = "";
  afterEach(() => raiz && rmSync(raiz, { recursive: true, force: true }));
  const escrever = (rel: string, texto: string) => {
    mkdirSync(dirname(join(raiz, rel)), { recursive: true });
    writeFileSync(join(raiz, rel), texto);
  };

  it("em zero, qualquer desvio falha; a base nunca sobe", () => {
    raiz = mkdtempSync(join(tmpdir(), "conformidade-"));
    escrever("design-system/arquivos.txt", "src/app/components/ui/ apps/site/src/components/ui/\n");
    escrever("apps/site/src/components/ui/card.tsx", 'export function Card() { return <div className="shadow-sm text-[13px]" /> }');
    escrever("apps/site/src/paginas/Ok.tsx", '<p className="text-sm">a</p>');
    expect(executar(raiz, ["--atualizar"]).codigo).toBe(0);
    expect(JSON.parse(readFileSync(join(raiz, "apps/site/conformidade-base.json"), "utf8")).arquivos).toEqual({});
    expect(executar(raiz).codigo).toBe(0);

    escrever("apps/site/src/paginas/Nova.tsx", '<div className="shadow-md" />\nfunction Card() {}');
    const r = executar(raiz);
    expect(r.codigo).toBe(1);
    expect(r.saida).toContain("apps/site/src/paginas/Nova.tsx (arquivo novo)");
    expect(r.saida).toContain("Sombra parada");
    expect(r.saida).toContain("já existe no DS");
    expect(executar(raiz, ["--atualizar"]).codigo).toBe(1);
  });

  it("o site em React está em zero", () => {
    const r = executar(fileURLToPath(new URL("../../..", import.meta.url)));
    expect(r.saida).toContain("OK: dentro da base");
    expect(r.codigo).toBe(0);
    expect(r.saida).toMatch(/Total\s+0\s+0/);
  });
});
