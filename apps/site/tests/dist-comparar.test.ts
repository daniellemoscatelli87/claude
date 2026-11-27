import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error módulo JavaScript sem tipos
import { compararDist } from "../scripts/comparar-dist.mjs";

let raiz = "";
afterEach(() => raiz && rmSync(raiz, { recursive: true, force: true }));
const escrever = (rel: string, t: string) => {
  mkdirSync(dirname(join(raiz, rel)), { recursive: true });
  writeFileSync(join(raiz, rel), t);
};

describe("comparação do dist", () => {
  it("aceita só a pasta site/ e as páginas publicadas como diferença", () => {
    raiz = mkdtempSync(join(tmpdir(), "comparar-"));
    for (const d of ["a", "b"]) {
      escrever(`${d}/index.html`, "igual");
      escrever(`${d}/404.html`, d);
    }
    escrever("b/site/assets/x.js", "novo");
    escrever("b/privacidade/index.html", "novo");
    const r = compararDist(join(raiz, "a"), join(raiz, "b"), ["404.html"]);
    expect(r).toEqual({ iguais: 1, diferentes: [], soAntes: [], soAgora: ["privacidade/index.html"], esperadas: ["404.html", "site/assets/x.js"] });
  });
});
