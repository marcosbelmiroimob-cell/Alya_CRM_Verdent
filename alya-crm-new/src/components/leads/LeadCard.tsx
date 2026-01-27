import type { Lead } from '../../types'
import { formatCurrency } from '../../lib/utils'

interface LeadCardProps {
  lead: Lead
  onEdit: () => void
  onDelete: () => void
  onCreateDeal: () => void
}

export function LeadCard({ lead, onEdit, onDelete, onCreateDeal }: LeadCardProps) {
  const origemLabels: Record<string, string> = {
    MANUAL: 'Manual',
    SITE: 'Site',
    WHATSAPP: 'WhatsApp',
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    INDICACAO: 'Indicação',
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5 border-l-4 border-primary-500">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg">
            {lead.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{lead.nome}</h3>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {origemLabels[lead.origem] || lead.origem}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-primary-600 p-2"
            title="Editar"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600 p-2"
            title="Excluir"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {lead.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fas fa-envelope w-4 text-gray-400"></i>
            <span>{lead.email}</span>
          </div>
        )}
        {lead.telefone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fas fa-phone w-4 text-gray-400"></i>
            <span>{lead.telefone}</span>
          </div>
        )}
        {(lead.orcamento_min || lead.orcamento_max) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fas fa-dollar-sign w-4 text-gray-400"></i>
            <span>
              {lead.orcamento_min && formatCurrency(Number(lead.orcamento_min))}
              {lead.orcamento_min && lead.orcamento_max && ' - '}
              {lead.orcamento_max && formatCurrency(Number(lead.orcamento_max))}
            </span>
          </div>
        )}
      </div>

      {lead.observacoes && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {lead.observacoes}
        </p>
      )}

      <button
        onClick={onCreateDeal}
        className="w-full px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 font-medium text-sm transition-colors"
      >
        <i className="fas fa-handshake mr-2"></i>
        Criar Negociação
      </button>
    </div>
  )
}
