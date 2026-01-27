import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Imovel } from '../types'

export const useImoveis = () => {
  const { user } = useAuth()
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadImoveis = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('imoveis')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })

      if (fetchError) throw fetchError

      setImoveis(data || [])
    } catch (err) {
      console.error('Erro ao carregar imóveis:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar imóveis')
    } finally {
      setLoading(false)
    }
  }

  const uploadFotos = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileName = `${user?.id}/${Date.now()}-${file.name}`

      const { data, error: uploadError } = await supabase.storage
        .from('imoveis-fotos')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Erro ao fazer upload da foto:', uploadError)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('imoveis-fotos').getPublicUrl(data.path)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  const createImovel = async (imovelData: Partial<Imovel>, fotos: File[]) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const fotoUrls = await uploadFotos(fotos)

      const newImovel = {
        usuario_id: user.id,
        titulo: imovelData.titulo!,
        tipo: imovelData.tipo!,
        endereco: imovelData.endereco || null,
        cidade: imovelData.cidade || null,
        estado: imovelData.estado || null,
        cep: imovelData.cep || null,
        valor: imovelData.valor!,
        area_m2: imovelData.area_m2 || null,
        quartos: imovelData.quartos || 0,
        banheiros: imovelData.banheiros || 0,
        vagas: imovelData.vagas || 0,
        condominio: imovelData.condominio || null,
        iptu: imovelData.iptu || null,
        descricao: imovelData.descricao || null,
        caracteristicas: imovelData.caracteristicas || [],
        fotos: fotoUrls,
        status: imovelData.status || 'DISPONIVEL',
        ativo: true,
      }

      const { data, error: insertError } = await supabase
        .from('imoveis')
        .insert(newImovel)
        .select()
        .single()

      if (insertError) throw insertError

      await loadImoveis()
      return { success: true, data }
    } catch (err) {
      console.error('Erro ao criar imóvel:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao criar imóvel',
      }
    }
  }

  const updateImovel = async (
    imovelId: string,
    imovelData: Partial<Imovel>,
    novasFotos?: File[]
  ) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      let fotoUrls = imovelData.fotos || []

      if (novasFotos && novasFotos.length > 0) {
        const uploadedUrls = await uploadFotos(novasFotos)
        fotoUrls = [...fotoUrls, ...uploadedUrls]
      }

      const updates = {
        titulo: imovelData.titulo,
        tipo: imovelData.tipo,
        endereco: imovelData.endereco,
        cidade: imovelData.cidade,
        estado: imovelData.estado,
        cep: imovelData.cep,
        valor: imovelData.valor,
        area_m2: imovelData.area_m2,
        quartos: imovelData.quartos,
        banheiros: imovelData.banheiros,
        vagas: imovelData.vagas,
        condominio: imovelData.condominio,
        iptu: imovelData.iptu,
        descricao: imovelData.descricao,
        caracteristicas: imovelData.caracteristicas,
        fotos: fotoUrls,
        status: imovelData.status,
      }

      const { data, error: updateError } = await supabase
        .from('imoveis')
        .update(updates)
        .eq('id', imovelId)
        .eq('usuario_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      await loadImoveis()
      return { success: true, data }
    } catch (err) {
      console.error('Erro ao atualizar imóvel:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar imóvel',
      }
    }
  }

  const deleteImovel = async (imovelId: string) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { error: updateError } = await supabase
        .from('imoveis')
        .update({ ativo: false })
        .eq('id', imovelId)
        .eq('usuario_id', user.id)

      if (updateError) throw updateError

      await loadImoveis()
      return { success: true }
    } catch (err) {
      console.error('Erro ao deletar imóvel:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar imóvel',
      }
    }
  }

  const deleteFoto = async (imovelId: string, fotoUrl: string) => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    try {
      const { data: imovel } = await supabase
        .from('imoveis')
        .select('fotos')
        .eq('id', imovelId)
        .single()

      if (!imovel) throw new Error('Imóvel não encontrado')

      const novasFotos = imovel.fotos.filter((url: string) => url !== fotoUrl)

      const { error: updateError } = await supabase
        .from('imoveis')
        .update({ fotos: novasFotos })
        .eq('id', imovelId)
        .eq('usuario_id', user.id)

      if (updateError) throw updateError

      const fileName = fotoUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('imoveis-fotos')
          .remove([`${user.id}/${fileName}`])
      }

      await loadImoveis()
      return { success: true }
    } catch (err) {
      console.error('Erro ao deletar foto:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao deletar foto',
      }
    }
  }

  useEffect(() => {
    loadImoveis()
  }, [user?.id])

  return {
    imoveis,
    loading,
    error,
    createImovel,
    updateImovel,
    deleteImovel,
    deleteFoto,
    refresh: loadImoveis,
  }
}
