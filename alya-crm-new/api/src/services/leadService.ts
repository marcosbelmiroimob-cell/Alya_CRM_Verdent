import { supabaseAdmin } from '../config/supabase.js'

type OrigemLead = 'MANUAL' | 'SITE' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM' | 'INDICACAO' | 'GOOGLE_ADS'
type EtapaKanban = 'NOVO_LEAD' | 'PRIMEIRO_CONTATO' | 'APRESENTACAO' | 'VISITA_AGENDADA' | 'PROPOSTA_ENVIADA' | 'ANALISE_DOCUMENTACAO' | 'FECHAMENTO'

interface WebhookLeadPayload {
  name: string
  email?: string
  phone?: string
  source: string
  campaign?: string
  message?: string
  budget_min?: number
  budget_max?: number
  user_id: string
}

interface CreateLeadResult {
  success: boolean
  lead_id?: string
  deal_id?: string
  error?: string
}

const sourceMapping: Record<string, OrigemLead> = {
  'website': 'SITE',
  'website form': 'SITE',
  'site': 'SITE',
  'google ads': 'GOOGLE_ADS',
  'google': 'GOOGLE_ADS',
  'instagram': 'INSTAGRAM',
  'instagram ads': 'INSTAGRAM',
  'facebook': 'FACEBOOK',
  'facebook ads': 'FACEBOOK',
  'whatsapp': 'WHATSAPP',
  'whatsapp button': 'WHATSAPP',
  'indicacao': 'INDICACAO',
  'referral': 'INDICACAO',
  'manual': 'MANUAL',
}

function mapSourceToOrigem(source: string): OrigemLead {
  const normalized = source.toLowerCase().trim()
  return sourceMapping[normalized] || 'MANUAL'
}

export async function createLeadFromWebhook(payload: WebhookLeadPayload): Promise<CreateLeadResult> {
  const { name, email, phone, source, campaign, message, budget_min, budget_max, user_id } = payload

  try {
    const origem = mapSourceToOrigem(source)
    
    const observacoes = [
      message,
      campaign ? `Campanha: ${campaign}` : null,
      `Origem n8n: ${source}`
    ].filter(Boolean).join('\n')

    const leadData = {
      usuario_id: user_id,
      nome: name,
      email: email || null,
      telefone: phone || null,
      origem,
      orcamento_min: budget_min || null,
      orcamento_max: budget_max || null,
      observacoes: observacoes || null,
      preferencias: campaign ? { campanha: campaign } : {},
    }

    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert(leadData)
      .select('id')
      .single()

    if (leadError) {
      console.error('Error creating lead:', leadError)
      return { success: false, error: leadError.message }
    }

    const negociacaoData = {
      usuario_id: user_id,
      lead_id: lead.id,
      imovel_id: null,
      etapa: 'NOVO_LEAD' as EtapaKanban,
      prioridade: 'MEDIA' as const,
      valor_proposta: null,
      data_proxima_acao: null,
      observacoes: `Lead captado automaticamente via n8n (${source})`,
    }

    const { data: negociacao, error: negError } = await supabaseAdmin
      .from('negociacoes')
      .insert(negociacaoData)
      .select('id')
      .single()

    if (negError) {
      console.error('Error creating negociacao:', negError)
      return { 
        success: true, 
        lead_id: lead.id,
        error: `Lead criado, mas erro ao criar negociação: ${negError.message}`
      }
    }

    return {
      success: true,
      lead_id: lead.id,
      deal_id: negociacao.id
    }

  } catch (error) {
    console.error('Unexpected error in createLeadFromWebhook:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error'
    }
  }
}

export async function getDefaultUserId(): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('perfis')
    .select('id')
    .limit(1)
    .single()

  if (error) {
    console.error('Error getting default user:', error)
    return null
  }

  return data?.id || null
}
