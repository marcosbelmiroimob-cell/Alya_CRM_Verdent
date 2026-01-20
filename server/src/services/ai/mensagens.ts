import { aiChat } from './aiRouter.js'

interface Negociacao {
  lead: {
    nome: string
    telefone: string | null
    perfilComprador: any
  }
  imovel: {
    titulo: string
    valor: any
    tipoNegocio: string
    endereco: string | null
    caracteristicas: any
  } | null
  etapaKanban: string
  valorProposta: any
}

const TEMPLATES_MENSAGEM: Record<string, string> = {
  PRIMEIRO_CONTATO: `Criar uma mensagem de primeiro contato para WhatsApp.
A mensagem deve:
- Ser cordial e profissional
- Mencionar como conseguiu o contato (se souber)
- Despertar interesse sem ser invasivo
- Ter no máximo 3 linhas
- Terminar com uma pergunta aberta`,

  FOLLOW_UP: `Criar uma mensagem de follow-up para WhatsApp.
A mensagem deve:
- Ser leve e não parecer cobrança
- Referenciar o contato anterior
- Oferecer algo de valor (informação, novidade)
- Ter no máximo 3 linhas
- Criar senso de oportunidade`,

  CONVITE_VISITA: `Criar uma mensagem convidando para visita ao imóvel.
A mensagem deve:
- Destacar um diferencial do imóvel
- Propor datas/horários flexíveis
- Criar expectativa positiva
- Ser objetiva
- Usar gatilho de escassez se apropriado`,

  PROPOSTA: `Criar uma mensagem para envio de proposta.
A mensagem deve:
- Ser profissional e confiante
- Resumir os pontos principais acordados
- Destacar o valor/benefício
- Criar urgência sutil
- Indicar próximos passos`,

  NEGOCIACAO: `Criar uma mensagem para fase de negociação.
A mensagem deve:
- Mostrar flexibilidade sem desvalorizar
- Reforçar os benefícios do imóvel
- Tratar objeções com empatia
- Propor soluções criativas
- Manter tom consultivo`,

  POS_VENDA: `Criar uma mensagem de pós-venda.
A mensagem deve:
- Agradecer a confiança
- Reforçar que está disponível
- Pedir indicações de forma sutil
- Ser genuína e pessoal
- Manter o relacionamento`,
}

export async function geradorMensagens(
  negociacao: Negociacao,
  tipoMensagem: string,
  nomeCorretor: string,
  contextoAdicional?: string
): Promise<string> {
  const template = TEMPLATES_MENSAGEM[tipoMensagem] || TEMPLATES_MENSAGEM.PRIMEIRO_CONTATO

  const systemPrompt = `Você é um especialista em copywriting para vendas imobiliárias no Brasil.
Crie mensagens para WhatsApp que sejam naturais, persuasivas e profissionais.

REGRAS:
- Use linguagem brasileira informal mas profissional
- Não use emojis em excesso (máximo 2)
- Seja direto e objetivo
- Personalize com as informações fornecidas
- A mensagem deve parecer escrita por uma pessoa real
- Não use frases genéricas como "Tudo bem?"
- Foque em valor, não em preço`

  const userPrompt = `${template}

INFORMAÇÕES:
- Nome do Lead: ${negociacao.lead.nome}
- Nome do Corretor: ${nomeCorretor}
${negociacao.imovel ? `- Imóvel: ${negociacao.imovel.titulo}` : ''}
${negociacao.imovel ? `- Valor: R$ ${Number(negociacao.imovel.valor).toLocaleString('pt-BR')}` : ''}
${negociacao.imovel?.endereco ? `- Localização: ${negociacao.imovel.endereco}` : ''}
${negociacao.valorProposta ? `- Valor da Proposta: R$ ${Number(negociacao.valorProposta).toLocaleString('pt-BR')}` : ''}
${negociacao.lead.perfilComprador ? `- Perfil do Cliente: ${JSON.stringify(negociacao.lead.perfilComprador)}` : ''}
${contextoAdicional ? `- Contexto Adicional: ${contextoAdicional}` : ''}

Gere apenas a mensagem, sem explicações ou alternativas.`

  try {
    const response = await aiChat(systemPrompt, userPrompt, {
      temperature: 0.8,
      maxTokens: 300,
      fallbackModel: 'gpt-3.5-turbo',
    })

    console.log(`[Gerador Mensagens] Provider: ${response.provider}, Model: ${response.model}`)
    return response.content
  } catch (error) {
    console.error('Erro ao gerar mensagem:', error)
    return 'Erro ao gerar mensagem. Tente novamente.'
  }
}
