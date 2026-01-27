import { useState } from 'react'
import { useLeads } from '../../hooks/useLeads'
import { useImoveis } from '../../hooks/useImoveis'

interface NegociacaoFormProps {
  onSave: (leadId: string, imovelId?: string, valorProposta?: number) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

export function NegociacaoForm({ onSave, onClose }: NegociacaoFormProps) {
  const { leads } = useLeads()
  const { imoveis } = useImoveis()
  const [selectedLeadId, setSelectedLeadId] = useState('')
  const [selectedImovelId, setSelectedImovelId] = useState('')
  const [valorProposta, setValorProposta] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedLeadId) {
      alert('Selecione um lead')
      return
    }

    setSaving(true)
    const result = await onSave(
      selectedLeadId,
      selectedImovelId || undefined,
      valorProposta ? parseFloat(valorProposta) : undefined
    )

    if (result.success) {
      onClose()
    } else {
      alert(`Erro ao criar negociação: ${result.error}`)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Nova Negociação
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Lead */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lead <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Selecione um lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.nome} {lead.email ? `(${lead.email})` : ''}
                </option>
              ))}
            </select>
            {leads.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Nenhum lead cadastrado. Crie um lead primeiro.
              </p>
            )}
          </div>

          {/* Imóvel (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imóvel (opcional)
            </label>
            <select
              value={selectedImovelId}
              onChange={(e) => setSelectedImovelId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Nenhum imóvel selecionado</option>
              {imoveis.map((imovel) => (
                <option key={imovel.id} value={imovel.id}>
                  {imovel.titulo} - {imovel.cidade || 'Sem cidade'}
                </option>
              ))}
            </select>
          </div>

          {/* Valor Proposta (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Proposta (opcional)
            </label>
            <input
              type="number"
              value={valorProposta}
              onChange={(e) => setValorProposta(e.target.value)}
              placeholder="R$ 0,00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white gradient-primary rounded-lg hover:opacity-90 disabled:opacity-50"
              disabled={saving || leads.length === 0}
            >
              {saving ? 'Criando...' : 'Criar Negociação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
