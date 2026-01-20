import { aiChat } from './aiRouter.js'

interface Negociacao {
  etapaKanban: string
  valorProposta: any
  observacoes: string | null
  proximoContato: Date | null
  lead: {
    nome: string
    telefone: string | null
    email: string | null
    perfilComprador: any
    scoreQualificacao: number
  }
  imovel: {
    titulo: string
    valor: any
    tipoNegocio: string
    descricao: string | null
    endereco: string | null
    caracteristicas: any
  } | null
  atividades: Array<{
    tipo: string
    descricao: string
    dataAtividade: Date
  }>
  historicosIA: Array<{
    prompt: string
    resposta: string
  }>
}

const ETAPAS_CONTEXTO: Record<string, string> = {
  NOVO_LEAD: 'O lead acabou de entrar. Foco em criar conexão e entender necessidades.',
  PRIMEIRO_CONTATO: 'Aguardando resposta do primeiro contato. Foco em follow-up estratégico.',
  QUALIFICADO: 'Lead qualificado com interesse real. Foco em apresentar imóveis compatíveis.',
  VISITA_AGENDADA: 'Visita marcada. Foco em preparação e dicas de apresentação.',
  PROPOSTA_ENVIADA: 'Proposta em análise. Foco em negociação e tratamento de objeções.',
  FECHAMENTO: 'Fase final. Foco em fechamento e documentação.',
  VENDIDO: 'Venda concluída. Foco em pós-venda e indicações.',
}

export async function alyaCoach(negociacao: Negociacao, mensagemUsuario: string): Promise<string> {
  const contextoEtapa = ETAPAS_CONTEXTO[negociacao.etapaKanban] || ''
  
  const historicoRecente = negociacao.historicosIA
    .slice(0, 3)
    .map(h => `Corretor: ${h.prompt}\nAlya: ${h.resposta}`)
    .reverse()
    .join('\n\n')

  const atividadesRecentes = negociacao.atividades
    .slice(0, 3)
    .map(a => `- ${a.tipo}: ${a.descricao} (${new Date(a.dataAtividade).toLocaleDateString('pt-BR')})`)
    .join('\n')

  const systemPrompt = `Você é Alya, uma consultora especialista em vendas imobiliárias de alto padrão no Brasil.

PERSONALIDADE:
- Empática, profissional e direta ao ponto
- Usa linguagem brasileira natural e acessível
- Especialista em psicologia de vendas e gatilhos mentais
- Conhece profundamente a rotina do corretor de imóveis
- Sempre oferece ações práticas e acionáveis

SEU PAPEL:
- Ajudar o corretor a fechar mais vendas
- Dar dicas de abordagem e tratamento de objeções
- Sugerir o momento ideal para cada ação
- Analisar o perfil do cliente e adaptar estratégias
- Motivar e orientar em momentos difíceis

REGRAS:
- Seja concisa (máximo 3 parágrafos por resposta)
- Sempre termine com uma sugestão de ação clara
- Use técnicas como: escassez, prova social, reciprocidade, autoridade
- Adapte o tom ao momento: mais técnico em negociação, mais empático em dificuldades
- Nunca seja robótica ou genérica`

  const userPrompt = `CONTEXTO DA NEGOCIAÇÃO:

Lead: ${negociacao.lead.nome}
${negociacao.lead.telefone ? `Telefone: ${negociacao.lead.telefone}` : ''}
Score de Qualificação: ${negociacao.lead.scoreQualificacao}/100
${negociacao.lead.perfilComprador ? `Perfil: ${JSON.stringify(negociacao.lead.perfilComprador)}` : ''}

Imóvel: ${negociacao.imovel ? `${negociacao.imovel.titulo} - R$ ${Number(negociacao.imovel.valor).toLocaleString('pt-BR')} (${negociacao.imovel.tipoNegocio})` : 'Nenhum imóvel vinculado ainda'}

Etapa Atual: ${negociacao.etapaKanban.replace(/_/g, ' ')}
${contextoEtapa}

${negociacao.valorProposta ? `Valor da Proposta: R$ ${Number(negociacao.valorProposta).toLocaleString('pt-BR')}` : ''}
${negociacao.proximoContato ? `Próximo Contato: ${new Date(negociacao.proximoContato).toLocaleDateString('pt-BR')}` : ''}

${atividadesRecentes ? `ATIVIDADES RECENTES:\n${atividadesRecentes}` : ''}

${historicoRecente ? `CONVERSA ANTERIOR:\n${historicoRecente}` : ''}

---

PERGUNTA DO CORRETOR:
${mensagemUsuario}`

  try {
    const response = await aiChat(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 500,
    })

    console.log(`[Alya Coach] Provider: ${response.provider}, Model: ${response.model}`)
    return response.content
  } catch (error) {
    console.error('Erro ao chamar IA:', error)
    return 'Estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.'
  }
}
