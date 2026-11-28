// Conteúdo da Rede de Parceiros (rede-parceiros/index.html e src/rede-parceiros-inicio.ts), com os mesmos textos.
// Pessoas da simulação: fictícias (fotos geradas por IA), como na página de HTML.
import {
  AppWindow, Banknote, Building2, Bus, ChartColumn, CodeXml, Factory, GraduationCap, HandHeart, Heart, HeartPulse, Hotel,
  Landmark, Laptop, Leaf, Lightbulb, Megaphone, MessageCircle, PenTool, Search, ShoppingBag, ShoppingCart, Sparkle,
  TrendingUp, UserPlus,
} from "lucide-react";
import type { Pilar } from "@/components/ui/lista-de-pilares";
import { EmailDoEstudio } from "@/compartilhado/EmailDoEstudio";

export const CADASTRO = "/rede-parceiros/cadastro/";
export const AVATAR = (n: number) => `/rede-parceiros/avatares/avatar-${n}.webp`;

export const PILARES: Pilar[] = [
  { icone: <MessageCircle />, titulo: "Contato", texto: "Toda parceria começa com uma conversa e com a troca sobre o que cada um faz." },
  { icone: <Heart />, titulo: "Relacionamento", texto: "A confiança cresce com o tempo, a cada projeto e a cada troca." },
  { icone: <UserPlus />, titulo: "Indicação", texto: "Quem conhece o seu trabalho conecta você às oportunidades certas." },
];

// As especialidades da roda do ecossistema, na ordem e com os ícones da página de HTML (equivalentes do Lucide).
export const ESPECIALIDADES = [
  { nome: "Design", Icone: PenTool },
  { nome: "Dev", Icone: CodeXml },
  { nome: "Dados", Icone: ChartColumn },
  { nome: "Marketing", Icone: Megaphone },
  { nome: "Inovação", Icone: Lightbulb },
  { nome: "Negócios", Icone: TrendingUp },
  { nome: "IA", Icone: Sparkle },
  { nome: "Pesquisa", Icone: Search },
  { nome: "UX/UI", Icone: AppWindow },
];

export const SETORES = [
  { nome: "Saúde", Icone: HeartPulse },
  { nome: "Hospitalidade e Turismo", Icone: Hotel },
  { nome: "Educação", Icone: GraduationCap },
  { nome: "Varejo", Icone: ShoppingBag },
  { nome: "Serviços Financeiros", Icone: Banknote },
  { nome: "Indústria", Icone: Factory },
  { nome: "Tecnologia", Icone: Laptop },
  { nome: "Bens de Consumo", Icone: ShoppingCart },
  { nome: "Mobilidade e Logística", Icone: Bus },
  { nome: "Energia e Sustentabilidade", Icone: Leaf },
  { nome: "Setor Público", Icone: Landmark },
  { nome: "Terceiro Setor", Icone: HandHeart },
];
// Ícone da empresa no topo da tela simulada
export const IconeDaRede = Building2;

export type Pessoa = { nome: string; area: string; nivel: string; foto?: number; iniciais?: string };
export const TALENTOS: Pessoa[] = [
  { nome: "Rafael Costa", area: "Service Design", nivel: "Pleno", foto: 2 },
  { nome: "Camila Rocha", area: "IA aplicada", nivel: "Especialista", foto: 1 },
  { nome: "Diego Moreira", area: "Dados", nivel: "Sênior", foto: 4 },
  { nome: "Juliana Prado", area: "Product Design", nivel: "Pleno", foto: 3 },
  { nome: "Lucas Ferreira", area: "Front-end", nivel: "Júnior", iniciais: "LF" },
  { nome: "Marina Alves", area: "UX Research", nivel: "Sênior", foto: 5 },
];

export const RANKING = [
  { pos: "1º", nome: "Marina Alves", foto: 5, pct: "94%", estado: "Sem disponibilidade no momento", tom: "neutro" as const },
  { pos: "2º", nome: "Juliana Prado", foto: 3, pct: "81%", estado: "Convite enviado", tom: "sucesso" as const, nota: "Próxima do ranking" },
  { pos: "3º", nome: "Rafael Costa", foto: 2, pct: "62%", estado: "Na fila", tom: "neutro" as const },
  { pos: "4º", nome: "Diego Moreira", foto: 4, pct: "54%", estado: "Na fila", tom: "neutro" as const },
];

export const QUADRO = [
  { id: "convites", titulo: "Convites", tom: "info" as const, pessoas: [
    { nome: "Lucas Ferreira", iniciais: "LF", cargo: "Desenvolvedor Front-end", tag: "Convite" },
    { nome: "Beatriz Lima", iniciais: "BL", cargo: "Service Designer", tag: "Convite" },
  ] },
  { id: "colaboracao", titulo: "Em colaboração", tom: "marca" as const, pessoas: [
    { nome: "Rafael Costa", foto: 2, cargo: "UX Researcher", tag: "Pesquisa" },
    { nome: "Camila Rocha", foto: 1, cargo: "UX/UI Designer", tag: "Prototipação" },
    { nome: "Ana Souza", iniciais: "AS", cargo: "Especialista em CX", tag: "VoC" },
  ] },
  { id: "concluidas", titulo: "Concluídas", tom: "sucesso" as const, pessoas: [
    { nome: "Diego Moreira", foto: 4, cargo: "Analista de Dados", tag: "Indicadores" },
    { nome: "Pedro Alves", iniciais: "PA", cargo: "Especialista em IA", tag: "Automação" },
  ] },
];

export const PERGUNTAS: { numero: string; pergunta: string; resposta: React.ReactNode }[] = [
  {
    numero: "01",
    pergunta: "Preciso preencher todo o cadastro?",
    resposta: <p>Preencha os campos obrigatórios e compartilhe o máximo de informações relevantes sobre sua experiência. Um perfil completo ajuda a identificar oportunidades mais alinhadas às suas competências.</p>,
  },
  {
    numero: "02",
    pergunta: "Fazer parte da rede garante projetos?",
    resposta: <p>Não. O cadastro permite que seu perfil seja considerado para futuras colaborações, conforme as demandas do Studio, a compatibilidade profissional e sua disponibilidade.</p>,
  },
  {
    numero: "03",
    pergunta: "Posso me conectar com outros profissionais?",
    resposta: (
      <p>
        A rede também busca incentivar a troca de conhecimentos, experiências e oportunidades entre seus integrantes. Essas interações podem acontecer por meio das iniciativas e dos canais disponibilizados pelo Studio, como o{" "}
        <a href="https://chat.whatsapp.com/BEg1Jxdjyg4E6HU5Rd3sNt" target="_blank" rel="noopener noreferrer">grupo no WhatsApp</a>. No cadastro, você também pode autorizar a exibição do seu perfil na galeria do site. Assim, outros integrantes conseguem conhecer sua trajetória e você também pode acessar o perfil de quem já faz parte da rede.
      </p>
    ),
  },
  {
    numero: "04",
    pergunta: "Como meus dados serão utilizados?",
    resposta: (
      <p>
        Seus dados serão utilizados para gerenciar sua participação, analisar a compatibilidade com projetos e entrar em contato sobre possíveis colaborações. O tratamento seguirá a{" "}
        <a href="/privacidade/">Política de Privacidade</a> e a LGPD. Você poderá solicitar acesso, correção ou exclusão pelo e-mail{" "}
        <EmailDoEstudio link />.
      </p>
    ),
  },
];
