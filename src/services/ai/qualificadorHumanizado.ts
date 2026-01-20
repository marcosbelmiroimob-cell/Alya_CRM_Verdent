import { aiChat } from './aiRouter.js'
import { prisma } from '../../utils/prisma.js'

interface ContextoQualificacao {
  nomeCorretor: string
  nomeImobiliaria?: string
  historicoMensagens: Array<{ remetente: string; conteudo: string }>
  perfilColetado: any
  imovelInteresse?: any
}

const SYSTEM_PROMPT = `Voce e uma assistente virtual de uma imobiliaria chamada Alya. Seu objetivo e qualificar leads de forma natural e humanizada, como se fosse uma atendente real.

PERSONALIDADE:
- Simpatica, educada e profissional
- Usa linguagem brasileira natural e acessivel
- Responde de forma concisa (1-3 frases por mensagem)
- Nunca parece robotica ou usa linguagem de formulario
- Usa emojis com moderacao quando apropriado

OBJETIVO:
Coletar informacoes do lead de forma conversacional:
1. Nome completo (se ainda nao tiver)
2. O que esta procurando (tipo de imovel, regiao)
3. Finalidade (morar, investir, alugar)
4. Quantidade de pessoas/familia
5. Faixa de investimento/orcamento
6. Urgencia (quando pretende decidir)
7. Forma de contato preferida

REGRAS:
- Faca UMA pergunta por vez, de forma natural
- Adapte-se ao estilo do lead (formal/informal)
- Se o lead perguntar algo, responda primeiro antes de continuar qualificando
- Quando tiver informacoes suficientes, ofereca agendar visita ou falar com corretor
- Nunca pressione ou seja insistente
- Se o lead nao quiser continuar, seja educada e deixe a porta aberta

FORMATO DE RESPOSTA:
Responda apenas com a mensagem para o lead, sem explicacoes ou metadados.`

export async function qualificarLead(
  mensagemLead: string,
  contexto: ContextoQualificacao
): Promise<{ resposta: string; perfilAtualizado: any; qualificacaoCompleta: boolean }> {
  const historicoFormatado = contexto.historicoMensagens
    .slice(-10)
    .map(m => `${m.remetente === 'lead' ? 'Lead' : 'Alya'}: ${m.conteudo}`)
    .join('\n')

  const userPrompt = `CONTEXTO:
Corretor: ${contexto.nomeCorretor}
${contexto.nomeImobiliaria ? `Imobiliaria: ${contexto.nomeImobiliaria}` : ''}
${contexto.imovelInteresse ? `Imovel de interesse: ${JSON.stringify(contexto.imovelInteresse)}` : ''}

PERFIL COLETADO ATE AGORA:
${JSON.stringify(contexto.perfilColetado || {}, null, 2)}

HISTORICO DA CONVERSA:
${historicoFormatado || '(primeira mensagem)'}

NOVA MENSAGEM DO LEAD:
${mensagemLead}

Responda de forma natural e continue a qualificacao se necessario.`

  try {
    const response = await aiChat(SYSTEM_PROMPT, userPrompt, {
      temperature: 0.8,
      maxTokens: 300,
    })

    const perfilAtualizado = extrairInformacoes(mensagemLead, contexto.perfilColetado || {})
    const qualificacaoCompleta = verificarQualificacaoCompleta(perfilAtualizado)

    return {
      resposta: response.content,
      perfilAtualizado,
      qualificacaoCompleta,
    }
  } catch (error) {
    console.error('Erro na qualificacao:', error)
    return {
      resposta: 'Desculpa, tive um probleminha aqui. Pode repetir?',
      perfilAtualizado: contexto.perfilColetado || {},
      qualificacaoCompleta: false,
    }
  }
}

function extrairInformacoes(mensagem: string, perfilAtual: any): any {
  const perfil = { ...perfilAtual }
  const mensagemLower = mensagem.toLowerCase()

  if (/\d{2}[\s.-]?\d{4,5}[\s.-]?\d{4}/.test(mensagem)) {
    const telefone = mensagem.match(/\d{2}[\s.-]?\d{4,5}[\s.-]?\d{4}/)?.[0]
    if (telefone) perfil.telefone = telefone.replace(/\D/g, '')
  }

  if (/@/.test(mensagem) && /\.\w{2,}/.test(mensagem)) {
    const email = mensagem.match(/[\w.-]+@[\w.-]+\.\w{2,}/)?.[0]
    if (email) perfil.email = email
  }

  if (/morar|moradia|residir|residencia/i.test(mensagemLower)) {
    perfil.finalidade = 'moradia'
  } else if (/invest|alugar|renda|patrimonio/i.test(mensagemLower)) {
    perfil.finalidade = 'investimento'
  }

  const valorMatch = mensagemLower.match(/(\d+)\s*(mil|k|m|milhao|milh[oõ]es)/i)
  if (valorMatch) {
    let valor = parseInt(valorMatch[1])
    const unidade = valorMatch[2].toLowerCase()
    if (unidade === 'mil' || unidade === 'k') valor *= 1000
    else if (unidade === 'm' || unidade.includes('milh')) valor *= 1000000
    perfil.orcamento = valor
  }

  const pessoasMatch = mensagemLower.match(/(\d+)\s*(pessoa|filho|morador)/i)
  if (pessoasMatch) {
    perfil.qtdPessoas = parseInt(pessoasMatch[1])
  }

  if (/casal|eu e (?:minha |meu )/i.test(mensagemLower)) {
    perfil.tipoFamilia = 'casal'
  } else if (/sozinho|solteiro|só eu/i.test(mensagemLower)) {
    perfil.tipoFamilia = 'solteiro'
  } else if (/familia|filhos/i.test(mensagemLower)) {
    perfil.tipoFamilia = 'familia'
  }

  if (/urgente|rapido|logo|esse mes/i.test(mensagemLower)) {
    perfil.urgencia = 'alta'
  } else if (/sem pressa|tranquilo|pesquisando/i.test(mensagemLower)) {
    perfil.urgencia = 'baixa'
  }

  return perfil
}

function verificarQualificacaoCompleta(perfil: any): boolean {
  const camposObrigatorios = ['finalidade', 'orcamento']
  const camposDesejados = ['qtdPessoas', 'tipoFamilia', 'urgencia']
  
  const temObrigatorios = camposObrigatorios.every(campo => perfil[campo])
  const temDesejados = camposDesejados.filter(campo => perfil[campo]).length >= 1
  
  return temObrigatorios && temDesejados
}

export async function calcularScoreQualificacao(perfil: any): Promise<number> {
  let score = 0

  if (perfil.telefone) score += 15
  if (perfil.email) score += 10
  if (perfil.finalidade) score += 20
  if (perfil.orcamento) score += 25
  if (perfil.qtdPessoas) score += 10
  if (perfil.tipoFamilia) score += 5
  
  if (perfil.urgencia === 'alta') score += 15
  else if (perfil.urgencia === 'media') score += 10
  else if (perfil.urgencia === 'baixa') score += 5

  return Math.min(score, 100)
}
