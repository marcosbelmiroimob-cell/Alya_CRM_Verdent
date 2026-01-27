import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Negociacao, EtapaKanban } from '../../types'
import { DealCard } from './DealCard'

interface StageColumnProps {
  etapa: {
    id: EtapaKanban
    nome: string
    cor: string
    corFundo: string
    corTexto: string
    icone: string
    descricao: string
  }
  negociacoes: Negociacao[]
  onDeleteNegociacao?: (negociacaoId: string) => void
  onAddLead?: () => void
  onViewDetails?: (negociacao: Negociacao) => void
}

export function StageColumn({ etapa, negociacoes, onDeleteNegociacao, onAddLead, onViewDetails }: StageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id,
  })

  return (
    <div className="flex-shrink-0 w-72">
      <div 
        className="rounded-xl shadow-sm border overflow-hidden"
        style={{ 
          backgroundColor: etapa.corFundo,
          borderColor: `${etapa.cor}40`
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b"
          style={{ 
            borderBottomColor: `${etapa.cor}30`,
            background: `linear-gradient(135deg, ${etapa.corFundo} 0%, white 100%)`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ 
                  backgroundColor: etapa.cor,
                  color: 'white'
                }}
              >
                <i className={`fas fa-${etapa.icone}`}></i>
              </div>
              <div>
                <h3 
                  className="font-bold text-sm"
                  style={{ color: etapa.corTexto }}
                >
                  {etapa.nome}
                </h3>
                <p className="text-xs text-gray-500">{etapa.descricao}</p>
              </div>
            </div>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ 
                backgroundColor: `${etapa.cor}20`,
                color: etapa.corTexto
              }}
            >
              {negociacoes.length}
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div
          ref={setNodeRef}
          className={`min-h-[450px] p-3 transition-all duration-200 ${
            isOver 
              ? 'ring-2 ring-inset ring-opacity-50' 
              : ''
          }`}
          style={{
            outlineColor: isOver ? etapa.cor : 'transparent',
            backgroundColor: isOver ? `${etapa.cor}10` : 'transparent'
          }}
        >
          <SortableContext
            items={negociacoes.map(n => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {negociacoes.length > 0 ? (
                negociacoes.map(negociacao => (
                  <DealCard 
                    key={negociacao.id} 
                    negociacao={negociacao}
                    onDelete={onDeleteNegociacao}
                    onViewDetails={onViewDetails}
                    etapaCor={etapa.cor}
                  />
                ))
              ) : (
                <div 
                  className="text-center py-12 rounded-lg border-2 border-dashed"
                  style={{ borderColor: `${etapa.cor}30` }}
                >
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${etapa.cor}15` }}
                  >
                    <i 
                      className={`fas fa-${etapa.icone} text-2xl`}
                      style={{ color: `${etapa.cor}80` }}
                    ></i>
                  </div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: `${etapa.corTexto}80` }}
                  >
                    Nenhum lead
                  </p>
                  <p className="text-xs text-gray-400 mt-1 mb-3">
                    Arraste um card para cá
                  </p>
                  {etapa.id === 'NOVO_LEAD' && onAddLead && (
                    <button
                      onClick={onAddLead}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: `${etapa.cor}20`,
                        color: etapa.corTexto
                      }}
                    >
                      <i className="fas fa-plus mr-1"></i>
                      Novo Lead
                    </button>
                  )}
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  )
}
