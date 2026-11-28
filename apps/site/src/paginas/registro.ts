// Componente de cada página em React, pelo id de src/rotas.json. Usado pelo build para gravar o HTML pronto
// (src/servidor.tsx); no navegador, cada página carrega só a própria entrada (src/paginas/<id>/entrada.tsx).
import type { ComponentType } from "react";
import { Descadastro } from "./descadastro/Descadastro";
import { Erro404 } from "./erro-404/Erro404";
import { Inicio } from "./inicio/Inicio";
import { Privacidade } from "./privacidade/Privacidade";
import { ProjetoPiloto } from "./projeto-piloto/ProjetoPiloto";
import { RedeDeParceiros } from "./rede-parceiros/RedeDeParceiros";
import { CadastroDeParceiro } from "./rede-parceiros-cadastro/CadastroDeParceiro";
import { PesquisaModa } from "./pesquisa-moda/PesquisaModa";

export const PAGINAS: Record<string, ComponentType> = {
  privacidade: Privacidade,
  descadastro: Descadastro,
  "erro-404": Erro404,
  "projeto-piloto": ProjetoPiloto,
  inicio: Inicio,
  "rede-parceiros": RedeDeParceiros,
  "rede-parceiros-cadastro": CadastroDeParceiro,
  "pesquisa-moda": PesquisaModa,
};
