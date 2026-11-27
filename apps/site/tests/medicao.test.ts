// Medição de acessos: as mesmas regras de public/analytics.js.
import { beforeEach, describe, expect, it } from "vitest";
import { _reiniciarMedicao, apagarCookiesDeMedicao, GA_ID, instalarEventos, ligarMedicao, medicaoLigada } from "../src/compartilhado/medicao";

type Falsa = { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; dmEvento?: (n: string, p?: object) => void };
const documentoFalso = () => {
  const scripts: { async?: boolean; src?: string }[] = [];
  return { scripts, d: { createElement: () => ({}), head: { appendChild: (s: object) => scripts.push(s) } } as unknown as Document };
};

beforeEach(() => _reiniciarMedicao());

describe("medição", () => {
  it("só carrega o Google depois de ligar, uma vez só, com anúncios negados", () => {
    const w: Falsa = {};
    const { scripts, d } = documentoFalso();
    instalarEventos(w as Window);
    w.dmEvento!("teste");
    expect(w.dataLayer).toBeUndefined();
    ligarMedicao(w as Window, d);
    ligarMedicao(w as Window, d);
    expect(medicaoLigada()).toBe(true);
    expect(scripts).toEqual([{ async: true, src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}` }]);
    const chamadas = (w.dataLayer as IArguments[]).map((a) => [...a]);
    expect(chamadas[0]).toEqual(["consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }]);
    expect(chamadas[2]).toEqual(["config", GA_ID]);
    w.dmEvento!("contato_enviado", { pagina: "x" });
    expect([...(w.dataLayer as IArguments[]).at(-1)!]).toEqual(["event", "contato_enviado", { pagina: "x" }]);
  });
  it("ao recusar depois de aceitar, apaga os cookies _ga do domínio", () => {
    const gravados: string[] = [];
    const d = { get cookie() { return "_ga=1; outro=2; _ga_FTVGXQRJQ6=3"; }, set cookie(v: string) { gravados.push(v); } } as unknown as Document;
    apagarCookiesDeMedicao(d, "www.danimoscatelli.com.br");
    expect(gravados).toEqual([
      "_ga=; Max-Age=0; path=/", "_ga=; Max-Age=0; path=/; domain=.danimoscatelli.com.br", "_ga=; Max-Age=0; path=/; domain=www.danimoscatelli.com.br",
      "_ga_FTVGXQRJQ6=; Max-Age=0; path=/", "_ga_FTVGXQRJQ6=; Max-Age=0; path=/; domain=.danimoscatelli.com.br", "_ga_FTVGXQRJQ6=; Max-Age=0; path=/; domain=www.danimoscatelli.com.br",
    ]);
  });
});
