import { useState } from 'react'
import { useKanbanStore } from '../../stores/kanbanStore'
import { KanbanColumn } from './KanbanColumn'
import { EtapaKanban, KanbanData } from '../../types'

type KanbanKey = keyof KanbanData

const ETAPAS: { id: KanbanKey; titulo: string; cor: string }[] = [
  { id: 'NOVO_LEAD', titulo: 'Novo Lead', cor: 'bg-slate-500' },
  { id: 'PRIMEIRO_CONTATO', titulo: 'Primeiro Contato', cor: 'bg-blue-500' },
  { id: 'QUALIFICADO', titulo: 'Qualificado', cor: 'bg-cyan-500' },
  { id: 'VISITA_AGENDADA', titulo: 'Visita Agendada', cor: 'bg-yellow-500' },
  { id: 'PROPOSTA_ENVIADA', titulo: 'Proposta Enviada', cor: 'bg-orange-500' },
  { id: 'FECHAMENTO', titulo: 'Fechamento', cor: 'bg-purple-500' },
  { id: 'VENDIDO', titulo: 'Vendido', cor: 'bg-green-500' },
]

interface KanbanBoardProps {
  onOpenAlya: (negociacaoId: number) => void
  onCardClick: (negociacaoId: number) => void
}

export function KanbanBoard({ onOpenAlya, onCardClick }: KanbanBoardProps) {
  const { kanban, moveCard } = useKanbanStore()
  const [draggedId, setDraggedId] = useState<number | null>(null)

  const handleDragStart = (negociacaoId: number) => {
    setDraggedId(negociacaoId)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const handleDrop = (etapa: EtapaKanban) => {
    if (draggedId) {
      moveCard(draggedId, etapa)
    }
    setDraggedId(null)
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 h-full min-w-max pb-4">
        {ETAPAS.map((etapa) => (
          <KanbanColumn
            key={etapa.id}
            id={etapa.id}
            titulo={etapa.titulo}
            cor={etapa.cor}
            negociacoes={kanban[etapa.id] || []}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onOpenAlya={onOpenAlya}
            onCardClick={onCardClick}
            isDragging={draggedId !== null}
          />
        ))}
      </div>
    </div>
  )
}
