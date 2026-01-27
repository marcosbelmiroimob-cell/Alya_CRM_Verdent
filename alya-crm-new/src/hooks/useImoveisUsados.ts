import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { ImovelUsado, ImovelUsadoInsert } from '../types'

export const useImoveisUsados = () => {
  const { user } = useAuth()
  const [imoveis, setImoveis] = useState<ImovelUsado[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadImoveis = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('imoveis_usados')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })

      if (fetchError) throw fetchError

      setImoveis(data || [])
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Erro ao carregar imóveis usados:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar imóveis usados')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const createImovel = async (data: Omit<ImovelUsadoInsert, 'usuario_id'>, fotos?: File[]) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      let fotosUrls: string[] = []

      if (fotos && fotos.length > 0) {
        for (const foto of fotos) {
          const fileName = `${user.id}/${Date.now()}-${foto.name}`
          const { error: uploadError } = await supabase.storage
            .from('imoveis-usados')
            .upload(fileName, foto)

          if (uploadError) {
            console.error('Erro ao fazer upload:', uploadError)
            continue
          }

          const { data: urlData } = supabase.storage
            .from('imoveis-usados')
            .getPublicUrl(fileName)

          fotosUrls.push(urlData.publicUrl)
        }
      }

      const { data: newImovel, error: insertError } = await supabase
        .from('imoveis_usados')
        .insert({ 
          ...data, 
          usuario_id: user.id,
          fotos: fotosUrls.length > 0 ? fotosUrls : data.fotos || []
        })
        .select()
        .single()

      if (insertError) throw insertError

      await loadImoveis()
      return { success: true, data: newImovel }
    } catch (err) {
      console.error('Erro ao criar imóvel usado:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao criar imóvel usado',
      }
    }
  }

  const updateImovel = async (id: string, data: Partial<ImovelUsadoInsert>, novasFotos?: File[]) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      let fotosUrls: string[] = data.fotos || []

      if (novasFotos && novasFotos.length > 0) {
        for (const foto of novasFotos) {
          const fileName = `${user.id}/${Date.now()}-${foto.name}`
          const { error: uploadError } = await supabase.storage
            .from('imoveis-usados')
            .upload(fileName, foto)

          if (uploadError) {
            console.error('Erro ao fazer upload:', uploadError)
            continue
          }

          const { data: urlData } = supabase.storage
            .from('imoveis-usados')
            .getPublicUrl(fileName)

          fotosUrls.push(urlData.publicUrl)
        }
      }

      const { error: updateError } = await supabase
        .from('imoveis_usados')
        .update({ ...data, fotos: fotosUrls })
        .eq('id', id)
        .eq('usuario_id', user.id)

      if (updateError) throw updateError

      await loadImoveis()
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar imóvel usado:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar imóvel usado',
      }
    }
  }

  const deleteImovel = async (id: string) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { error: deleteError } = await supabase
        .from('imoveis_usados')
        .update({ ativo: false })
        .eq('id', id)
        .eq('usuario_id', user.id)

      if (deleteError) throw deleteError

      await loadImoveis()
      return { success: true }
    } catch (err) {
      console.error('Erro ao deletar imóvel usado:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar imóvel usado',
      }
    }
  }

  const toggleDestaque = async (id: string, destaque: boolean) => {
    return updateImovel(id, { destaque })
  }

  useEffect(() => {
    loadImoveis()
  }, [loadImoveis])

  return {
    imoveis,
    loading,
    error,
    refresh: loadImoveis,
    createImovel,
    updateImovel,
    deleteImovel,
    toggleDestaque,
  }
}
