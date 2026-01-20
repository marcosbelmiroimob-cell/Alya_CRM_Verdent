import { aiChat } from './aiRouter.js'
import { prisma } from '../../utils/prisma.js'

interface ContextoAssistente {
  usuarioId: number
  pagina: string
  contexto: string
}

const SYSTEM_PROMPT = `Voce e Alya, uma assistente virtual especializada em vendas imobiliarias. Voce ajuda corretores a vender mais e melhor.

PERSONALIDADE:
- Amigavel, profissional e direta
- Usa linguagem brasileira natural
- Respostas concisas (maximo 3 paragrafos)
- Sempre oferece acoes praticas

CAPACIDADES:
- Dar dicas de vendas e negociacao
- Sugerir abordagens para leads
- Analisar perfis de clientes
- Responder duvidas sobre o CRM
- Ajudar com estrategias de follow-up
- Sugerir imoveis baseado em perfil

REGRAS:
- Seja util e pratica
- Nunca invente dados que nao tem
- Se nao souber algo, diga que pode ajudar de outra forma
- Termine com uma sugestao de acao quando possivel`

export async function assistenteChat(
  mensagem: string,
  contexto: ContextoAssistente
): Promise<string> {
  const dadosCRM = await coletarDadosContextuais(contexto)

  const userPrompt = `CONTEXTO DO USUARIO:
Pagina atual: ${contexto.pagina}
Contexto: ${contexto.contexto}

DADOS DO CRM:
${JSON.stringify(dadosCRM, null, 2)}

PERGUNTA DO CORRETOR:
${mensagem}`

  try {
    const response = await aiChat(SYSTEM_PROMPT, userPrompt, {
      temperature: 0.7,
      maxTokens: 400,
    })

    return response.content
  } catch (error) {
    console.error('Erro no assistente:', error)
    return 'Opa, tive um problema aqui. Tenta de novo?'
  }
}

async function coletarDadosContextuais(contexto: ContextoAssistente) {
  const dados: any = {}

  try {
    const leadsRecentes = await prisma.lead.count({
      where: {
        usuarioId: contexto.usuarioId,
        criadoEm: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    })
    dados.leadsUltimaSemana = leadsRecentes

    const negociacoesPendentes = await prisma.negociacao.count({
      where: {
        usuarioId: contexto.usuarioId,
        etapaKanban: { notIn: ['VENDIDO', 'PERDIDO'] },
      },
    })
    dados.negociacoesPendentes = negociacoesPendentes

    const followUpsPendentes = await prisma.negociacao.count({
      where: {
        usuarioId: contexto.usuarioId,
        etapaKanban: { notIn: ['VENDIDO', 'PERDIDO'] },
        proximoContato: { lte: new Date() },
      },
    })
    dados.followUpsPendentes = followUpsPendentes

    if (contexto.contexto === 'dashboard') {
      const vendasMes = await prisma.negociacao.count({
        where: {
          usuarioId: contexto.usuarioId,
          etapaKanban: 'VENDIDO',
          atualizadoEm: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      })
      dados.vendasMesAtual = vendasMes
    }

  } catch (error) {
    console.error('Erro ao coletar dados contextuais:', error)
  }

  return dados
}

export async function buscarDadosCRM(
  query: string,
  usuarioId: number
): Promise<any> {
  const queryLower = query.toLowerCase()

  if (/lead|cliente/i.test(queryLower)) {
    const nomeMatch = queryLower.match(/lead\s+([a-zA-Z\s]+)|cliente\s+([a-zA-Z\s]+)/i)
    if (nomeMatch) {
      const nome = (nomeMatch[1] || nomeMatch[2]).trim()
      const leads = await prisma.lead.findMany({
        where: {
          usuarioId,
          nome: { contains: nome },
        },
        take: 5,
        include: {
          negociacoes: {
            take: 1,
            orderBy: { criadoEm: 'desc' },
          },
        },
      })
      return { tipo: 'leads', dados: leads }
    }
  }

  if (/quantos|total|numero/i.test(queryLower) && /lead/i.test(queryLower)) {
    const periodo = /semana/i.test(queryLower) ? 7 : /mes/i.test(queryLower) ? 30 : null
    const where: any = { usuarioId }
    if (periodo) {
      where.criadoEm = { gte: new Date(Date.now() - periodo * 24 * 60 * 60 * 1000) }
    }
    const count = await prisma.lead.count({ where })
    return { tipo: 'contagem', dados: { leads: count, periodo: periodo ? `ultimos ${periodo} dias` : 'total' } }
  }

  if (/imovel|apartamento|casa/i.test(queryLower) && /disponivel|livre/i.test(queryLower)) {
    const unidadesDisponiveis = await prisma.unidade.count({
      where: {
        status: 'DISPONIVEL',
        torre: { empreendimento: { usuarioId } },
      },
    })
    return { tipo: 'contagem', dados: { unidadesDisponiveis } }
  }

  return null
}
