import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useState } from 'react'
import { StageColumn } from './StageColumn'
import { DealCard } from './DealCard'
import { ETAPAS_KANBAN } from '../../lib/constants'
import type { Negociacao, EtapaKanban } from '../../types'

interface PipelineBoardProps {
  negociacoes: Negociacao[]
  onUpdateEtapa: (negociacaoId: string, novaEtapa: EtapaKanban) => Promise<void>
  onDeleteNegociacao?: (negociacaoId: string) => void
  onAddLead?: () => void
  onViewDetails?: (negociacao: Negociacao) => void
}

export function PipelineBoard({ negociacoes, onUpdateEtapa, onDeleteNegociacao, onAddLead, onViewDetails }: PipelineBoardProps) {
  const [activeNegociacao, setActiveNegociacao] = useState<Negociacao | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const negociacao = negociacoes.find(n => n.id === event.active.id)
    setActiveNegociacao(negociacao || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveNegociacao(null)
      return
    }

    const negociacaoId = active.id as string
    const novaEtapa = over.id as EtapaKanban

    const negociacao = negociacoes.find(n => n.id === negociacaoId)
    if (negociacao && negociacao.etapa !== novaEtapa) {
      await onUpdateEtapa(negociacaoId, novaEtapa)
    }

    setActiveNegociacao(null)
  }

  const negociacoesPorEtapa = ETAPAS_KANBAN.map(etapa => ({
    etapa,
    negociacoes: negociacoes.filter(n => n.etapa === etapa.id),
  }))

  const activeEtapa = activeNegociacao 
    ? ETAPAS_KANBAN.find(e => e.id === activeNegociacao.etapa) 
    : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-6 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {negociacoesPorEtapa.map(({ etapa, negociacoes }) => (
          <StageColumn
            key={etapa.id}
            etapa={etapa}
            negociacoes={negociacoes}
            onDeleteNegociacao={onDeleteNegociacao}
            onAddLead={onAddLead}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      <DragOverlay>
        {activeNegociacao ? (
          <div className="rotate-2 scale-105">
            <DealCard 
              negociacao={activeNegociacao} 
              etapaCor={activeEtapa?.cor}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
