import type { NeedDef } from '../types'

export const NEEDS: NeedDef[] = [
  {
    id: 'validar-usabilidade',
    title: 'Validar se o usuário consegue completar uma tarefa (usabilidade de fluxo ou protótipo)',
    when:
      'Use quando você tem um protótipo, ou um fluxo pré-lançamento, e precisa saber se as pessoas conseguem completá-lo sem ajuda, em quanto tempo e com quantos erros.',
    metricIds: ['tsr', 'tmt', 'er', 'seq'],
  },
  {
    id: 'medir-percepcao',
    title: 'Entender a percepção e satisfação do usuário com a solução',
    when:
      'Use quando você quer saber o que o usuário sente ou acha sobre a experiência — não apenas se ele completou a tarefa, mas o quão fácil e agradável ela pareceu.',
    metricIds: ['sus', 'csat', 'ces'],
  },
  {
    id: 'medir-engajamento',
    title: 'Entender engajamento e retenção no produto',
    when:
      'Use quando você quer saber se as pessoas voltam a usar o produto ou a funcionalidade ao longo do tempo, e se o hábito de uso está se consolidando.',
    metricIds: ['dau_mau', 'retention'],
  },
  {
    id: 'medir-conversao-negocio',
    title: 'Avaliar conversão e resultado de negócio',
    when:
      'Use quando você precisa provar o impacto financeiro/comercial de uma mudança de design — por exemplo em checkout, cadastro, ativação ou upgrade de plano.',
    metricIds: ['cr', 'churn', 'ltv', 'cac'],
  },
  {
    id: 'ouvir-feedback-atendimento',
    title: 'Coletar feedback direto, reclamações e satisfação geral dos usuários',
    when:
      'Use quando você quer entender dores relatadas espontaneamente pelos usuários, coletadas pelo time de atendimento/CS ou por pesquisas periódicas de relacionamento.',
    metricIds: ['nps', 'csat', 'ces'],
  },
]
