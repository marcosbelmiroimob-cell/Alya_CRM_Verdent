import { aiGenerate } from './aiRouter.js'

interface Lead {
  nome: string
  telefone: string | null
  email: string | null
  origem: string | null
  perfilComprador: any
  observacoes: string | null
  negociacoes: Array<{
    etapaKanban: string
    imovel: {
      valor: any
      tipoNegocio: string
    } | null
  }>
}

interface ResultadoQualificacao {
  score: number
  nivel: 'FRIO' | 'MORNO' | 'QUENTE' | 'MUITO_QUENTE'
  analise: string
  recomendacoes: string[]
  sinaisPositivos: string[]
  sinaisNegativos: string[]
}

export async function qualificadorLeads(lead: Lead): Promise<ResultadoQualificacao> {
  const prompt = `Você é um especialista em qualificação de leads para o mercado imobiliário brasileiro.
Analise o lead e retorne uma avaliação em formato JSON.

CRITÉRIOS DE ANÁLISE:
1. Capacidade Financeira (baseado em imóveis de interesse, origem do lead)
2. Urgência (tempo no funil, frequência de interações)
3. Fit com Produto (perfil vs imóveis disponíveis)
4. Engajamento (respostas, visitas, propostas)
5. Sinais de Compra (perguntas sobre financiamento, documentação, etc)

NÍVEIS:
- FRIO (0-25): Pouco engajamento, baixa probabilidade
- MORNO (26-50): Algum interesse, precisa nurturing
- QUENTE (51-75): Alto interesse, prioridade média
- MUITO_QUENTE (76-100): Pronto para fechar, prioridade máxima

DADOS DO LEAD:

Nome: ${lead.nome}
Telefone: ${lead.telefone || 'Não informado'}
Email: ${lead.email || 'Não informado'}
Origem: ${lead.origem || 'Não informada'}
${lead.observacoes ? `Observações: ${lead.observacoes}` : ''}
${lead.perfilComprador ? `Perfil do Comprador: ${JSON.stringify(lead.perfilComprador)}` : ''}

HISTÓRICO DE NEGOCIAÇÕES:
${lead.negociacoes.length > 0 
  ? lead.negociacoes.map(n => `- Etapa: ${n.etapaKanban}${n.imovel ? `, Imóvel: R$ ${Number(n.imovel.valor).toLocaleString('pt-BR')} (${n.imovel.tipoNegocio})` : ''}`).join('\n')
  : 'Nenhuma negociação ainda'}

Retorne APENAS o JSON no formato:
{
  "score": número de 0 a 100,
  "nivel": "FRIO" | "MORNO" | "QUENTE" | "MUITO_QUENTE",
  "analise": "análise breve em 2-3 frases",
  "recomendacoes": ["ação 1", "ação 2", "ação 3"],
  "sinaisPositivos": ["sinal 1", "sinal 2"],
  "sinaisNegativos": ["sinal 1", "sinal 2"]
}`

  try {
    const response = await aiGenerate(prompt, {
      temperature: 0.3,
      maxTokens: 500,
      jsonOutput: true,
    })

    console.log(`[Qualificador] Provider: ${response.provider}, Model: ${response.model}`)

    const resultado = JSON.parse(response.content) as ResultadoQualificacao
    resultado.score = Math.max(0, Math.min(100, resultado.score))
    
    return resultado
  } catch (error) {
    console.error('Erro ao qualificar lead:', error)
    return {
      score: 0,
      nivel: 'FRIO',
      analise: 'Não foi possível analisar o lead automaticamente.',
      recomendacoes: ['Preencha mais informações sobre o lead', 'Registre atividades de interação'],
      sinaisPositivos: [],
      sinaisNegativos: ['Dados insuficientes para análise'],
    }
  }
}
