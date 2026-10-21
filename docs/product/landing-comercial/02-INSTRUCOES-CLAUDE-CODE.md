# Instrução para Claude Code — Landing comercial DM | Experience Intelligence

Leia `01-COPY-FINAL-E-ARQUITETURA-DA-LANDING.md` integralmente. Este documento orienta uma **landing pública de produto comercial** distinta da autenticação. O produto é um SaaS B2B de condução autônoma de desafios, centrado em experiências humanas nos ambientes físico e digital e em transformações operacionais e organizacionais. Não reduzir a proposta a chatbot, pesquisas de satisfação, dashboard ou UX de telas. A consultoria Dani Moscatelli | Experience Design Studio é complementar, sem obrigatoriedade.

**Antes de programar:**
1. Inspecione as rotas, componentes e tokens existentes na aplicação Next.js, a autenticação, o controle de convites e o deploy Netlify. Não altere nada ainda.
2. Compare o estado real do produto com as afirmações da copy; indique frases que exigem marcação ‘em desenvolvimento’. Não prometa metodologias/adaptações ou acompanhamento já disponíveis se ainda não estiverem implementados.
3. Apresente um mapa de seções, lista de componentes com reaproveitamento possível, proposta responsiva para celular, destinos dos CTAs (inclusive acesso antecipado e consultoria) e estratégia de implementação sem APIs adicionais.
4. Informe se existe lead capture e política de privacidade real. Caso não haja, proponha alternativa funcional/segura e solicite aprovação.
5. Apresente riscos, custo adicional (deve ser zero sem autorização), arquivos a modificar e testes a executar. **Aguarde aprovação antes de programar/publicar.**

**Na implementação futura aprovada:**
- Preservar segurança, banco, logins, convites, master, Gemini desligado/limites e todo o fluxo de desafios existente.
- Implementar landing leve e acessível: componentes recomendados com lucide-react, interfaces clicáveis reais sem IA na página pública, texto fornecido com ajustes apenas se aprovados.
- Fontes e datas de mercado no documento; confirmar que continuam corretas e que os links funcionam.
- Nunca gerar preços, depoimentos, certificações ou métricas do produto sem evidências.
- Manter a separação entre **visão de produto** e **funcionalidades atuais**.
- Registrar a decisão e o desenvolvimento no Decision Log, Product Backlog e Implementation Log.
- Orientar a usuária pelo celular, uma ação por vez; não fazer merge nem deploy sem autorização.
