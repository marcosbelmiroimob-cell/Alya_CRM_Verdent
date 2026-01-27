import { useState } from 'react'
import { useNegociacoes } from '../hooks/useNegociacoes'
import { useLeads } from '../hooks/useLeads'
import { PipelineBoard } from '../components/pipeline/PipelineBoard'
import { LeadFormPipeline } from '../components/pipeline/LeadFormPipeline'
import { LeadDetailModal } from '../components/pipeline/LeadDetailModal'
import { ETAPAS_KANBAN } from '../lib/constants'
import { formatCurrency } from '../lib/utils'
import type { EtapaKanban, Negociacao } from '../types'

export function Pipeline() {
  const { negociacoes, loading, error, updateEtapa, deleteNegociacao, refresh } = useNegociacoes()
  const { createLead, updateLead } = useLeads()
  const [showForm, setShowForm] = useState(false)
  const [selectedNegociacao, setSelectedNegociacao] = useState<Negociacao | null>(null)

  const handleUpdateEtapa = async (negociacaoId: string, novaEtapa: EtapaKanban) => {
    const result = await updateEtapa(negociacaoId, novaEtapa)
    if (!result.success) {
      alert(`Erro ao mover card: ${result.error}`)
    }
  }

  const handleDeleteNegociacao = async (negociacaoId: string) => {
    const result = await deleteNegociacao(negociacaoId)
    if (!result.success) {
      alert(`Erro ao excluir: ${result.error}`)
    }
  }

  const handleCreateLead = async (leadData: {
    nome: string
    email?: string
    telefone?: string
    origem: 'MANUAL' | 'SITE' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM' | 'INDICACAO'
    observacoes?: string
  }) => {
    const result = await createLead(leadData, true)
    if (result.success) {
      await refresh()
      setShowForm(false)
    }
    return result
  }

  const valorTotal = negociacoes.reduce((acc, n) => {
    return acc + (Number(n.valor_proposta) || Number(n.imovel?.valor) || 0)
  }, 0)

  const estatisticas = ETAPAS_KANBAN.map(etapa => ({
    ...etapa,
    count: negociacoes.filter(n => n.etapa === etapa.id).length
  }))

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pipeline...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <i className="fas fa-exclamation-triangle text-red-600 text-3xl mb-3"></i>
        <p className="text-red-700 font-semibold">Erro ao carregar pipeline</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pipeline de Vendas</h2>
            <p className="text-gray-500 mt-1">
              Gerencie suas oportunidades em tempo real
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:opacity-90 shadow-sm transition-all"
          >
            <i className="fas fa-user-plus mr-2"></i>
            Novo Lead
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                <i className="fas fa-handshake text-white"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{negociacoes.length}</p>
                <p className="text-xs text-gray-500">Total de negociações</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                <i className="fas fa-dollar-sign text-white"></i>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(valorTotal)}</p>
                <p className="text-xs text-gray-500">Valor em pipeline</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <i className="fas fa-user-plus text-white"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticas.find(e => e.id === 'NOVO_LEAD')?.count || 0}
                </p>
                <p className="text-xs text-gray-500">Novos leads</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <i className="fas fa-trophy text-white"></i>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticas.find(e => e.id === 'FECHAMENTO')?.count || 0}
                </p>
                <p className="text-xs text-gray-500">Fechamentos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {estatisticas.map(etapa => (
          <div 
            key={etapa.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ 
              backgroundColor: etapa.corFundo,
              color: etapa.corTexto
            }}
          >
            <i className={`fas fa-${etapa.icone}`}></i>
            <span>{etapa.nome}</span>
            <span 
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: etapa.cor }}
            >
              {etapa.count}
            </span>
          </div>
        ))}
      </div>

      <PipelineBoard
        negociacoes={negociacoes}
        onUpdateEtapa={handleUpdateEtapa}
        onDeleteNegociacao={handleDeleteNegociacao}
        onAddLead={() => setShowForm(true)}
        onViewDetails={(negociacao) => setSelectedNegociacao(negociacao)}
      />

      {showForm && (
        <LeadFormPipeline
          onSave={handleCreateLead}
          onClose={() => setShowForm(false)}
        />
      )}

      {selectedNegociacao && (
        <LeadDetailModal
          negociacao={selectedNegociacao}
          onClose={() => {
            setSelectedNegociacao(null)
            refresh()
          }}
          onUpdateLead={updateLead}
        />
      )}
    </div>
  )
}
