import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Lead, EtapaKanban } from '../types'

export const useLeads = () => {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLeads = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('usuario_id', user.id)
        .order('criado_em', { ascending: false })

      if (fetchError) throw fetchError

      setLeads(data || [])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Erro ao carregar leads:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads')
    } finally {
      setLoading(false)
    }
  }

  const createLead = async (leadData: Partial<Lead>, createNegociacao: boolean = true) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const newLead = {
        usuario_id: user.id,
        nome: leadData.nome!,
        email: leadData.email || null,
        telefone: leadData.telefone || null,
        cpf: leadData.cpf || null,
        rg: leadData.rg || null,
        data_nascimento: leadData.data_nascimento || null,
        profissao: leadData.profissao || null,
        estado_civil: leadData.estado_civil || null,
        renda_mensal: leadData.renda_mensal || null,
        origem: leadData.origem || 'MANUAL',
        orcamento_min: leadData.orcamento_min || null,
        orcamento_max: leadData.orcamento_max || null,
        preferencias: leadData.preferencias || {},
        observacoes: leadData.observacoes || null,
      }

      const { data, error: insertError } = await supabase
        .from('leads')
        .insert(newLead)
        .select()
        .single()

      if (insertError) throw insertError

      if (createNegociacao && data) {
        const negociacao = {
          usuario_id: user.id,
          lead_id: data.id,
          imovel_id: null,
          etapa: 'NOVO_LEAD' as EtapaKanban,
          prioridade: 'MEDIA' as const,
          valor_proposta: null,
          data_proxima_acao: null,
          observacoes: null,
        }

        await supabase.from('negociacoes').insert(negociacao)
      }

      await loadLeads()
      return { success: true, data }
    } catch (err) {
      console.error('Erro ao criar lead:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao criar lead',
      }
    }
  }

  const updateLead = async (leadId: string, leadData: Partial<Lead>) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const updates: Record<string, any> = {}
      
      if (leadData.nome !== undefined) updates.nome = leadData.nome
      if (leadData.email !== undefined) updates.email = leadData.email
      if (leadData.telefone !== undefined) updates.telefone = leadData.telefone
      if (leadData.origem !== undefined) updates.origem = leadData.origem
      if (leadData.orcamento_min !== undefined) updates.orcamento_min = leadData.orcamento_min
      if (leadData.orcamento_max !== undefined) updates.orcamento_max = leadData.orcamento_max
      if (leadData.preferencias !== undefined) updates.preferencias = leadData.preferencias
      if (leadData.observacoes !== undefined) updates.observacoes = leadData.observacoes
      if (leadData.cpf !== undefined) updates.cpf = leadData.cpf
      if (leadData.rg !== undefined) updates.rg = leadData.rg
      if (leadData.data_nascimento !== undefined) updates.data_nascimento = leadData.data_nascimento
      if (leadData.profissao !== undefined) updates.profissao = leadData.profissao
      if (leadData.estado_civil !== undefined) updates.estado_civil = leadData.estado_civil
      if (leadData.renda_mensal !== undefined) updates.renda_mensal = leadData.renda_mensal

      const { data, error: updateError } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .eq('usuario_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      await loadLeads()
      return { success: true, data }
    } catch (err) {
      console.error('Erro ao atualizar lead:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar lead',
      }
    }
  }

  const deleteLead = async (leadId: string) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .eq('usuario_id', user.id)

      if (deleteError) throw deleteError

      await loadLeads()
      return { success: true }
    } catch (err) {
      console.error('Erro ao deletar lead:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar lead',
      }
    }
  }

  useEffect(() => {
    loadLeads()
  }, [user?.id])

  return {
    leads,
    loading,
    error,
    createLead,
    updateLead,
    deleteLead,
    refresh: loadLeads,
  }
}
