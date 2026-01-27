import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { EtapaKanban } from '../types'

interface DashboardMetrics {
  totalLeads: number
  totalImoveis: number
  totalNegociacoes: number
  valorTotalPipeline: number
  negociacoesPorEtapa: Array<{ etapa: string; count: number }>
}

export const useDashboard = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    totalImoveis: 0,
    totalNegociacoes: 0,
    valorTotalPipeline: 0,
    negociacoesPorEtapa: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const [
        { count: totalLeads },
        { count: totalImoveis },
        { data: negociacoes },
      ] = await Promise.all([
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id),

        supabase
          .from('imoveis')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .eq('ativo', true),

        supabase
          .from('negociacoes')
          .select('etapa, valor_proposta')
          .eq('usuario_id', user.id),
      ])

      const totalNegociacoes = negociacoes?.length || 0

      const valorTotalPipeline = negociacoes?.reduce((total, neg) => {
        return total + (neg.valor_proposta || 0)
      }, 0) || 0

      const etapasMap = new Map<EtapaKanban, number>()
      negociacoes?.forEach((neg) => {
        const count = etapasMap.get(neg.etapa) || 0
        etapasMap.set(neg.etapa, count + 1)
      })

      const negociacoesPorEtapa = Array.from(etapasMap.entries()).map(
        ([etapa, count]) => ({
          etapa,
          count,
        })
      )

      setMetrics({
        totalLeads: totalLeads || 0,
        totalImoveis: totalImoveis || 0,
        totalNegociacoes,
        valorTotalPipeline,
        negociacoesPorEtapa,
      })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Erro ao carregar métricas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [user?.id])

  return {
    metrics,
    loading,
    error,
    refresh: loadMetrics,
  }
}
