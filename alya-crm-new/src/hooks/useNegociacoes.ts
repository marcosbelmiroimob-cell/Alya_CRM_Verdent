import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Negociacao, EtapaKanban } from '../types'

export const useNegociacoes = () => {
  const { user } = useAuth()
  const [negociacoes, setNegociacoes] = useState<Negociacao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadNegociacoes = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('negociacoes')
        .select(
          `
          *,
          lead:leads(*),
          imovel:imoveis(*)
        `
        )
        .eq('usuario_id', user.id)
        .order('criado_em', { ascending: false })

      if (fetchError) throw fetchError

      setNegociacoes(data || [])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Erro ao carregar negociações:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar negociações')
    } finally {
      setLoading(false)
    }
  }

  const createNegociacao = async (
    leadId: string,
    imovelId?: string,
    valorProposta?: number
  ) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const newNegociacao = {
        usuario_id: user.id,
        lead_id: leadId,
        imovel_id: imovelId || null,
        etapa: 'NOVO_LEAD' as EtapaKanban,
        prioridade: 'MEDIA' as const,
        valor_proposta: valorProposta || null,
        data_proxima_acao: null,
        observacoes: null,
      }

      const { data, error: insertError } = await supabase
        .from('negociacoes')
        .insert(newNegociacao)
        .select(
          `
          *,
          lead:leads(*),
          imovel:imoveis(*)
        `
        )
        .single()

      if (insertError) throw insertError

      await loadNegociacoes()
      return { success: true, data }
    } catch (err) {
      console.error('Erro ao criar negociação:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao criar negociação',
      }
    }
  }

  const updateEtapa = async (negociacaoId: string, novaEtapa: EtapaKanban) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { error: updateError } = await supabase
        .from('negociacoes')
        .update({ etapa: novaEtapa })
        .eq('id', negociacaoId)
        .eq('usuario_id', user.id)

      if (updateError) throw updateError

      await loadNegociacoes()
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar etapa:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar etapa',
      }
    }
  }

  const updateNegociacao = async (
    negociacaoId: string,
    updates: Partial<Negociacao>
  ) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { data, error: updateError } = await supabase
        .from('negociacoes')
        .update({
          imovel_id: updates.imovel_id,
          prioridade: updates.prioridade,
          valor_proposta: updates.valor_proposta,
          data_proxima_acao: updates.data_proxima_acao,
          observacoes: updates.observacoes,
        })
        .eq('id', negociacaoId)
        .eq('usuario_id', user.id)
        .select(
          `
          *,
          lead:leads(*),
          imovel:imoveis(*)
        `
        )
        .single()

      if (updateError) throw updateError

      await loadNegociacoes()
      return { success: true, data }
    } catch (err) {
      console.error('Erro ao atualizar negociação:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar negociação',
      }
    }
  }

  const deleteNegociacao = async (negociacaoId: string) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { error: deleteError } = await supabase
        .from('negociacoes')
        .delete()
        .eq('id', negociacaoId)
        .eq('usuario_id', user.id)

      if (deleteError) throw deleteError

      await loadNegociacoes()
      return { success: true }
    } catch (err) {
      console.error('Erro ao deletar negociação:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar negociação',
      }
    }
  }

  useEffect(() => {
    loadNegociacoes()
  }, [user?.id])

  return {
    negociacoes,
    loading,
    error,
    createNegociacao,
    updateEtapa,
    updateNegociacao,
    deleteNegociacao,
    refresh: loadNegociacoes,
  }
}
