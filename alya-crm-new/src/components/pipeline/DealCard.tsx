import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Negociacao } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { PRIORIDADE } from '../../lib/constants'

interface DealCardProps {
  negociacao: Negociacao
  onDelete?: (negociacaoId: string) => void
  onViewDetails?: (negociacao: Negociacao) => void
  etapaCor?: string
}

export function DealCard({ negociacao, onDelete, onViewDetails, etapaCor }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: negociacao.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const prioridadeConfig = PRIORIDADE.find(p => p.value === negociacao.prioridade)
  const foto = negociacao.imovel?.fotos?.[0]

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Tem certeza que deseja excluir a negociação com ${negociacao.lead?.nome}?`)) {
      onDelete?.(negociacao.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-xl shadow-sm hover:shadow-md 
        transition-all duration-200 cursor-grab active:cursor-grabbing
        border border-gray-100 overflow-hidden
        ${isDragging ? 'opacity-50 scale-105 shadow-lg rotate-2' : 'opacity-100'}
      `}
      style={style}
    >
      {/* Foto do imóvel */}
      {foto && (
        <div className="relative">
          <img
            src={foto}
            alt={negociacao.imovel?.titulo}
            className="w-full h-28 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      <div className="p-3">
        {/* Header com avatar e nome */}
        <div className="flex items-start gap-3 mb-3">
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: etapaCor || '#667eea' }}
          >
            {negociacao.lead?.nome?.charAt(0).toUpperCase() || 'L'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {negociacao.lead?.nome || 'Lead sem nome'}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {negociacao.lead?.telefone || negociacao.lead?.email || 'Sem contato'}
            </p>
          </div>
          {/* Prioridade badge */}
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: prioridadeConfig?.cor }}
            title={`Prioridade ${prioridadeConfig?.label}`}
          />
        </div>

        {/* Imóvel */}
        {negociacao.imovel && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
            <i className="fas fa-building text-gray-400 text-xs"></i>
            <p className="text-xs text-gray-600 truncate flex-1">
              {negociacao.imovel.titulo}
            </p>
          </div>
        )}

        {/* Valor */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <i className="fas fa-tag text-xs" style={{ color: etapaCor }}></i>
            <span 
              className="text-sm font-bold"
              style={{ color: etapaCor || '#667eea' }}
            >
              {negociacao.valor_proposta
                ? formatCurrency(Number(negociacao.valor_proposta))
                : negociacao.imovel?.valor
                ? formatCurrency(Number(negociacao.imovel.valor))
                : 'Sem valor'}
            </span>
          </div>
          
          {/* Ações */}
          <div className="flex items-center gap-1">
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              title="Ver detalhes"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails?.(negociacao)
              }}
            >
              <i className="fas fa-eye text-xs"></i>
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Excluir negociação"
              >
                <i className="fas fa-trash text-xs"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
