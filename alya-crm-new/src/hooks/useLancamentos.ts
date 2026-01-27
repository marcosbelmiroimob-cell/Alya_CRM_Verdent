import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { 
  Empreendimento,
  EmpreendimentoInsert,
  TipologiaInsert,
  UnidadeInsert,
  StatusUnidade
} from '../types'

export const useLancamentos = () => {
  const { user } = useAuth()
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEmpreendimentos = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('empreendimentos')
        .select(`
          *,
          tipologias (
            *,
            unidades (*)
          )
        `)
        .eq('usuario_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })

      if (fetchError) throw fetchError

      setEmpreendimentos(data || [])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Erro ao carregar empreendimentos:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar empreendimentos')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const createEmpreendimento = async (data: Omit<EmpreendimentoInsert, 'usuario_id'>) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { data: newEmpreendimento, error: insertError } = await supabase
        .from('empreendimentos')
        .insert({ ...data, usuario_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError

      await loadEmpreendimentos()
      return { success: true, data: newEmpreendimento }
    } catch (err) {
      console.error('Erro ao criar empreendimento:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao criar empreendimento',
      }
    }
  }

  const updateEmpreendimento = async (id: string, data: Partial<EmpreendimentoInsert>) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { error: updateError } = await supabase
        .from('empreendimentos')
        .update(data)
        .eq('id', id)
        .eq('usuario_id', user.id)

      if (updateError) throw updateError

      await loadEmpreendimentos()
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar empreendimento:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar empreendimento',
      }
    }
  }

  const deleteEmpreendimento = async (id: string) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { error: deleteError } = await supabase
        .from('empreendimentos')
        .update({ ativo: false })
        .eq('id', id)
        .eq('usuario_id', user.id)

      if (deleteError) throw deleteError

      await loadEmpreendimentos()
      return { success: true }
    } catch (err) {
      console.error('Erro ao deletar empreendimento:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar empreendimento',
      }
    }
  }

  const createTipologia = async (data: TipologiaInsert) => {
    try {
      const { data: newTipologia, error: insertError } = await supabase
        .from('tipologias')
        .insert(data)
        .select()
        .single()

      if (insertError) throw insertError

      await loadEmpreendimentos()
      return { success: true, data: newTipologia }
    } catch (err) {
      console.error('Erro ao criar tipologia:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao criar tipologia',
      }
    }
  }

  const updateTipologia = async (id: string, data: Partial<TipologiaInsert>) => {
    try {
      const { error: updateError } = await supabase
        .from('tipologias')
        .update(data)
        .eq('id', id)

      if (updateError) throw updateError

      await loadEmpreendimentos()
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar tipologia:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar tipologia',
      }
    }
  }

  const deleteTipologia = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('tipologias')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await loadEmpreendimentos()
      return { success: true }
    } catch (err) {
      console.error('Erro ao deletar tipologia:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar tipologia',
      }
    }
  }

  const createUnidade = async (data: UnidadeInsert) => {
    try {
      const { data: newUnidade, error: insertError } = await supabase
        .from('unidades')
        .insert(data)
        .select()
        .single()

      if (insertError) throw insertError

      await loadEmpreendimentos()
      return { success: true, data: newUnidade }
    } catch (err) {
      console.error('Erro ao criar unidade:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao criar unidade',
      }
    }
  }

  const createUnidadesBulk = async (unidades: UnidadeInsert[]) => {
    try {
      const { data: newUnidades, error: insertError } = await supabase
        .from('unidades')
        .insert(unidades)
        .select()

      if (insertError) throw insertError

      await loadEmpreendimentos()
      return { success: true, data: newUnidades }
    } catch (err) {
      console.error('Erro ao criar unidades em lote:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao criar unidades em lote',
      }
    }
  }

  const updateUnidade = async (id: string, data: Partial<UnidadeInsert>) => {
    try {
      const { error: updateError } = await supabase
        .from('unidades')
        .update(data)
        .eq('id', id)

      if (updateError) throw updateError

      await loadEmpreendimentos()
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar unidade:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar unidade',
      }
    }
  }

  const updateUnidadeStatus = async (id: string, status: StatusUnidade) => {
    return updateUnidade(id, { status })
  }

  const deleteUnidade = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('unidades')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await loadEmpreendimentos()
      return { success: true }
    } catch (err) {
      console.error('Erro ao deletar unidade:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar unidade',
      }
    }
  }

  useEffect(() => {
    loadEmpreendimentos()
  }, [loadEmpreendimentos])

  return {
    empreendimentos,
    loading,
    error,
    refresh: loadEmpreendimentos,
    createEmpreendimento,
    updateEmpreendimento,
    deleteEmpreendimento,
    createTipologia,
    updateTipologia,
    deleteTipologia,
    createUnidade,
    createUnidadesBulk,
    updateUnidade,
    updateUnidadeStatus,
    deleteUnidade,
  }
}
