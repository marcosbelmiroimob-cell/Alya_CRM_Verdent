import { useState } from 'react'
import type { Lead } from '../../types'
import { ORIGEM_LEAD } from '../../lib/constants'

const ESTADO_CIVIL_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'SOLTEIRO', label: 'Solteiro(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIUVO', label: 'Viúvo(a)' },
  { value: 'UNIAO_ESTAVEL', label: 'União Estável' },
]

interface LeadFormProps {
  lead?: Lead
  onSave: (leadData: any) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

export function LeadForm({ lead, onSave, onClose }: LeadFormProps) {
  const [formData, setFormData] = useState({
    nome: lead?.nome || '',
    email: lead?.email || '',
    telefone: lead?.telefone || '',
    cpf: lead?.cpf || '',
    rg: lead?.rg || '',
    data_nascimento: lead?.data_nascimento || '',
    profissao: lead?.profissao || '',
    estado_civil: lead?.estado_civil || '',
    renda_mensal: lead?.renda_mensal || '',
    origem: lead?.origem || 'MANUAL',
    orcamento_min: lead?.orcamento_min || '',
    orcamento_max: lead?.orcamento_max || '',
    preferencias: lead?.preferencias || {},
    observacoes: lead?.observacoes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await onSave({
      ...formData,
      orcamento_min: formData.orcamento_min ? Number(formData.orcamento_min) : null,
      orcamento_max: formData.orcamento_max ? Number(formData.orcamento_max) : null,
      renda_mensal: formData.renda_mensal ? Number(formData.renda_mensal) : null,
      cpf: formData.cpf || null,
      rg: formData.rg || null,
      data_nascimento: formData.data_nascimento || null,
      profissao: formData.profissao || null,
      estado_civil: formData.estado_civil || null,
    })

    setLoading(false)

    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Erro ao salvar lead')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {lead ? 'Editar Lead' : 'Novo Lead'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="João Silva"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="joao@email.com"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="(11) 98765-4321"
              />
            </div>

            {/* Origem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origem do Lead
              </label>
              <select
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {ORIGEM_LEAD.map((origem) => (
                  <option key={origem.value} value={origem.value}>
                    {origem.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seção: Documentos e Dados Pessoais */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fas fa-id-card text-gray-400"></i>
              Documentos e Dados Pessoais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                />
              </div>

              {/* RG */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RG
                </label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="00.000.000-0"
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Estado Civil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Civil
                </label>
                <select
                  value={formData.estado_civil}
                  onChange={(e) => setFormData({ ...formData, estado_civil: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {ESTADO_CIVIL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profissão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissão
                </label>
                <input
                  type="text"
                  value={formData.profissao}
                  onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Engenheiro, Médico..."
                />
              </div>

              {/* Renda Mensal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renda Mensal
                </label>
                <input
                  type="number"
                  value={formData.renda_mensal}
                  onChange={(e) => setFormData({ ...formData, renda_mensal: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          {/* Seção: Financeiro */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <i className="fas fa-dollar-sign text-gray-400"></i>
              Orçamento para Imóvel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Orçamento Mín */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamento Mínimo
                </label>
                <input
                  type="number"
                  value={formData.orcamento_min}
                  onChange={(e) => setFormData({ ...formData, orcamento_min: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="500000"
                />
              </div>

              {/* Orçamento Máx */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamento Máximo
                </label>
                <input
                  type="number"
                  value={formData.orcamento_max}
                  onChange={(e) => setFormData({ ...formData, orcamento_max: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="800000"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Informações adicionais sobre o lead..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 gradient-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : lead ? 'Atualizar' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
