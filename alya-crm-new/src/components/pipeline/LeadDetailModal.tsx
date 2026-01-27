import { useState } from 'react'
import type { Negociacao, Lead } from '../../types'
import { formatCurrency } from '../../lib/utils'

interface LeadDetailModalProps {
  negociacao: Negociacao
  onClose: () => void
  onUpdateLead: (leadId: string, data: Partial<Lead>) => Promise<{ success: boolean; error?: string }>
}

const origemLabels: Record<string, string> = {
  MANUAL: 'Captação Manual',
  SITE: 'Site',
  WHATSAPP: 'WhatsApp',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  INDICACAO: 'Indicação',
}

const estadoCivilOptions = [
  { value: '', label: 'Não informado' },
  { value: 'SOLTEIRO', label: 'Solteiro(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIUVO', label: 'Viúvo(a)' },
  { value: 'UNIAO_ESTAVEL', label: 'União Estável' },
]

export function LeadDetailModal({ negociacao, onClose, onUpdateLead }: LeadDetailModalProps) {
  const lead = negociacao.lead
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: lead?.nome || '',
    telefone: lead?.telefone || '',
    email: lead?.email || '',
    cpf: lead?.cpf || '',
    rg: lead?.rg || '',
    data_nascimento: lead?.data_nascimento || '',
    profissao: lead?.profissao || '',
    estado_civil: lead?.estado_civil || '',
    renda_mensal: lead?.renda_mensal?.toString() || '',
    orcamento_min: lead?.orcamento_min?.toString() || '',
    orcamento_max: lead?.orcamento_max?.toString() || '',
    observacoes: lead?.observacoes || '',
  })

  const handleSave = async () => {
    if (!lead?.id) return

    if (!formData.nome.trim() || !formData.telefone.trim()) {
      alert('Nome e telefone são obrigatórios')
      return
    }

    setSaving(true)
    const result = await onUpdateLead(lead.id, {
      nome: formData.nome.trim(),
      telefone: formData.telefone.trim(),
      email: formData.email.trim() || null,
      cpf: formData.cpf.trim() || null,
      rg: formData.rg.trim() || null,
      data_nascimento: formData.data_nascimento || null,
      profissao: formData.profissao.trim() || null,
      estado_civil: formData.estado_civil || null,
      renda_mensal: formData.renda_mensal ? parseFloat(formData.renda_mensal) : null,
      orcamento_min: formData.orcamento_min ? parseFloat(formData.orcamento_min) : null,
      orcamento_max: formData.orcamento_max ? parseFloat(formData.orcamento_max) : null,
      observacoes: formData.observacoes.trim() || null,
    })

    setSaving(false)

    if (result.success) {
      setIsEditing(false)
    } else {
      alert(`Erro ao salvar: ${result.error}`)
    }
  }

  if (!lead) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <p>Lead não encontrado</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">Fechar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                {lead.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{lead.nome}</h2>
                <p className="text-white/80 text-sm">
                  {origemLabels[lead.origem]} • {new Date(lead.criado_em).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <i className="fas fa-edit"></i>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                  <input
                    type="text"
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                  <input
                    type="text"
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
                  <select
                    value={formData.estado_civil}
                    onChange={(e) => setFormData({ ...formData, estado_civil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {estadoCivilOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renda Mensal</label>
                  <input
                    type="number"
                    value={formData.renda_mensal}
                    onChange={(e) => setFormData({ ...formData, renda_mensal: e.target.value })}
                    placeholder="0,00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento Mín.</label>
                  <input
                    type="number"
                    value={formData.orcamento_min}
                    onChange={(e) => setFormData({ ...formData, orcamento_min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento Máx.</label>
                  <input
                    type="number"
                    value={formData.orcamento_max}
                    onChange={(e) => setFormData({ ...formData, orcamento_max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Telefone</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <i className="fas fa-phone text-green-500"></i>
                    {lead.telefone || 'Não informado'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <i className="fas fa-envelope text-blue-500"></i>
                    {lead.email || 'Não informado'}
                  </p>
                </div>
              </div>

              {(lead?.cpf || lead?.rg) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">CPF</p>
                    <p className="font-medium text-gray-900">{lead?.cpf || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">RG</p>
                    <p className="font-medium text-gray-900">{lead?.rg || '-'}</p>
                  </div>
                </div>
              )}

              {(lead.orcamento_min || lead.orcamento_max) && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <p className="text-xs text-green-600 mb-1 font-medium">Orçamento</p>
                  <p className="text-lg font-bold text-green-700">
                    {lead.orcamento_min ? formatCurrency(lead.orcamento_min) : 'Não definido'}
                    {' - '}
                    {lead.orcamento_max ? formatCurrency(lead.orcamento_max) : 'Não definido'}
                  </p>
                </div>
              )}

              {negociacao.imovel && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <p className="text-xs text-purple-600 mb-2 font-medium">Imóvel de Interesse</p>
                  <div className="flex items-center gap-3">
                    {negociacao.imovel.fotos?.[0] && (
                      <img 
                        src={negociacao.imovel.fotos[0]} 
                        alt={negociacao.imovel.titulo}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{negociacao.imovel.titulo}</p>
                      <p className="text-sm text-gray-500">{negociacao.imovel.cidade}</p>
                      <p className="text-purple-600 font-bold">{formatCurrency(negociacao.imovel.valor)}</p>
                    </div>
                  </div>
                </div>
              )}

              {lead.observacoes && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <p className="text-xs text-yellow-600 mb-1 font-medium">Observações</p>
                  <p className="text-gray-700">{lead.observacoes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Editar Lead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
