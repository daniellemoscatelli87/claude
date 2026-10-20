// Aviso de privacidade da fase de testes (D-026, P-007). Cada mudança de conteúdo exige nova versão:
// o aceite fica registrado no perfil com a versão. Requisitos em docs/legal/REQUISITOS_TERMOS_E_PRIVACIDADE.md.
// Não é a política definitiva: o texto jurídico final é obrigatório antes do lançamento comercial.

export const AVISO_VERSAO = "testes-2026-10-21";

export interface SecaoAviso { titulo: string; itens: string[] }

export const AVISO_TITULO = "Aviso de privacidade · fase de testes";

export const AVISO_SECOES: SecaoAviso[] = [
  { titulo: "Quem cuida dos seus dados", itens: [
    "Dani Moscatelli | Experience Design Studio, responsável pela DM | Experience Intelligence.",
    "Contato para qualquer pedido sobre seus dados: contato@danimoscatelli.com.br.",
  ] },
  { titulo: "O que coletamos", itens: [
    "Seus dados: nome completo, e-mail, telefone, estado e cidade, a declaração de que você tem 18 anos ou mais e o registro deste aceite.",
    "Dados da empresa ou negócio: nome, segmento, o que oferece, seu papel, tipo, porte e CNPJ, se você informar.",
    "O que você registrar na plataforma: desafios, respostas e informações das atividades.",
    "Registros de uso e de segurança, como data e hora das ações.",
    "Não coletamos CPF nem data de nascimento.",
  ] },
  { titulo: "Para que usamos", itens: [
    "Criar e proteger sua conta, falar com você e dar suporte (execução do contrato e procedimentos preliminares).",
    "Configurar o espaço de trabalho da sua empresa e adaptar as orientações ao seu contexto (execução do contrato).",
    "Conduzir a investigação dos desafios que você registrar (execução do contrato).",
    "Analisar o perfil dos clientes por estado e cidade, de forma agrupada, para melhorar o serviço (legítimo interesse).",
    "Segurança, prevenção de fraudes e controle de custos (legítimo interesse).",
  ] },
  { titulo: "Quem processa os dados para nós", itens: [
    "Supabase: banco de dados, login e e-mails de confirmação. O banco de dados fica no Brasil (São Paulo).",
    "Netlify: hospedagem do aplicativo, que pode passar por servidores fora do Brasil.",
    "Google (Gemini): inteligência artificial que organiza o desafio, quando estiver ligada. Nesta fase usamos o plano gratuito, em que o Google pode usar o conteúdo enviado para melhorar seus produtos e pessoas podem revisá-lo. Por isso, use apenas informações fictícias nos desafios.",
    "A equipe do estúdio pode acessar os projetos da sua empresa para suporte e qualidade. Cada acesso fica registrado no histórico da empresa.",
  ] },
  { titulo: "Cuidados nesta fase", itens: [
    "Não escreva nomes, documentos, contatos ou dados de saúde de outras pessoas nos desafios.",
    "A plataforma está em testes, com acesso por convite e sem garantia de disponibilidade.",
    "Seus dados ficam guardados enquanto a conta existir ou até você pedir a exclusão.",
  ] },
  { titulo: "Seus direitos", itens: [
    "Você pode pedir a qualquer momento confirmação, acesso, correção, exclusão, portabilidade e informações sobre com quem compartilhamos seus dados, pelo e-mail contato@danimoscatelli.com.br.",
    "Se este aviso mudar, vamos pedir um novo aceite.",
  ] },
];
