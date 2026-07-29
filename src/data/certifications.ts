export interface Certification {
  name: string;
  org: string;
  date: string;
  year: number;
  skills?: string;
}

// Full, unabbreviated list from "Licenças e certificados" (LinkedIn export).
export const certifications: Certification[] = [
  { name: 'Identificando viéses e armadilhas em análises', org: 'PM3', date: 'Out 2025', year: 2025 },
  { name: 'Design de Serviço', org: 'PM3', date: 'Out 2025', year: 2025 },
  { name: 'Introdução a protótipos com Lovable e IA', org: 'Tera', date: 'Jul 2025', year: 2025 },
  { name: 'Product Growth Training', org: 'PM3', date: 'Jan 2025', year: 2025, skills: 'Desenvolvimento de negócios, Estratégia de produtos' },
  { name: 'Gestão por Resultados', org: 'LinkedIn', date: 'Jan 2025', year: 2025 },
  { name: 'Product Design Training', org: 'PM3', date: 'Nov 2024', year: 2024, skills: 'UI Design, Design de frameworks +13' },
  { name: 'Product Management Training', org: 'PM3', date: 'Abr 2024', year: 2024, skills: 'Gestão de produto de software, Gestão de inovação +4' },
  { name: 'Product Leadership Training', org: 'PM3', date: 'Mar 2024', year: 2024, skills: 'Gestão de produto de software, Gestão de inovação +3' },
  { name: 'Product Analytics Training', org: 'PM3', date: 'Fev 2024', year: 2024, skills: 'Habilidades analíticas, Gestão de inovação +2' },
  { name: 'Product Marketing Training', org: 'PM3', date: 'Dez 2023', year: 2023, skills: 'Gestão de inovação, Insights de negócios' },
  { name: 'Product Discovery Training', org: 'PM3', date: 'Nov 2023', year: 2023, skills: 'Design de frameworks, Gestão de inovação +9' },
  { name: 'Masterclass in HEART and Jobs to be Done', org: 'Online UX Team', date: 'Jun 2023', year: 2023 },
  { name: 'Certification in Service Design', org: 'Livework Studio', date: 'Jun 2022', year: 2022, skills: 'Design de frameworks, Service Blueprinting +11' },
  { name: 'UX Research', org: 'How Bootcamps', date: 'Ago 2021', year: 2021 },
  { name: 'Online Training in Design System & Ops', org: 'Meiuca', date: 'Ago 2021', year: 2021, skills: 'UI Design, Design de frameworks +5' },
  { name: 'Product Design', org: 'How Bootcamps', date: 'Jan 2021', year: 2021, skills: 'UI Design, Design de frameworks +12' },
  { name: 'Product Master', org: 'PM3', date: 'Jan 2021', year: 2021, skills: 'Mapeamento de jornada do usuário' },
  { name: 'Data Driven Design', org: 'Guilherme Marques', date: 'Set 2020', year: 2020 },
  { name: 'Entrepreneurship: How to Break Barriers', org: 'EBANX', date: 'Set 2020', year: 2020 },
  { name: 'UX Writing', org: 'UXCOPY.CO', date: 'Ago 2020', year: 2020 },
  { name: 'Information Architecture and Usability', org: 'Product Arena', date: 'Mai 2020', year: 2020 },
  { name: 'Usability Testing in Practice 2020 + Hotjar and UX Research', org: 'Udemy', date: 'Jan 2020', year: 2020 },
  { name: 'Usability Laboratory', org: 'Mergo Escola de Design', date: 'Jul 2019', year: 2019 },
  { name: 'Design System', org: 'Mergo Escola de Design', date: 'Abr 2019', year: 2019, skills: 'UI Design, Design de frameworks +4' },
  { name: 'UX-PM', org: 'Mercedes Sanchez UX Research — MSUX', date: 'Jan 2018', year: 2018, skills: 'Mapeamento de jornada +7' },
  { name: 'Service Design', org: 'Echos Desirable Futures', date: 'Mai 2017', year: 2017, skills: 'Service Blueprinting +16' },
  { name: 'Ethnographic Research Focusing on Innovation', org: 'DesignThinkers Academy', date: 'Set 2015', year: 2015, skills: 'Etnografia +3' },
  { name: 'Business Analytics 3.0', org: 'CITS', date: 'Mar 2015', year: 2015 },
  { name: 'Interface Design for Mobile Devices', org: 'Lactec', date: 'Mai 2014', year: 2014 },
  { name: 'World Usability Day 2013', org: 'IxDA', date: 'Nov 2013', year: 2013 },
  { name: 'Interface Design for Mobile Devices', org: 'Instituto Faber-Ludens', date: 'Dez 2012', year: 2012 },
  { name: 'Workshop of Information Architecture', org: 'Aldeia.cc', date: 'Jul 2012', year: 2012 },
  { name: '5th Brazilian Meeting on Information Architecture', org: 'EBAI Congress', date: 'Out 2011', year: 2011 },
  { name: 'World Usability Day 2010', org: 'IxDA', date: 'Nov 2010', year: 2010 },
  { name: 'Certification in Usability Testing', org: 'Instituto Faber-Ludens', date: 'Jan 2010', year: 2010 },
  { name: 'Certification in Evaluation of Interfaces', org: 'Instituto Faber-Ludens', date: 'Jan 2010', year: 2010 },
];
