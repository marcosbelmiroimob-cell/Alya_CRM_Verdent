import { useState } from 'react'
import { KanbanCard } from './KanbanCard'
import { Negociacao, EtapaKanban } from '../../types'

interface KanbanColumnProps {
  id: EtapaKanban
  titulo: string
  cor: string
  negociacoes: Negociacao[]
  onDragStart: (id: number) => void
  onDragEnd: () => void
  onDrop: (etapa: EtapaKanban) => void
  onOpenAlya: (negociacaoId: number) => void
  onCardClick: (negociacaoId: number) => void
  isDragging: boolean
}

export function KanbanColumn({
  id,
  titulo,
  cor,
  negociacoes,
  onDragStart,
  onDragEnd,
  onDrop,
  onOpenAlya,
  onCardClick,
  isDragging,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(id)
  }

  const totalValor = negociacoes.reduce((acc, n) => {
    if (n.imovel?.valor) {
      return acc + Number(n.imovel.valor)
    }
    return acc
  }, 0)

  return (
    <div
      className={`w-72 flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-xl ${
        isDragOver ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${cor}`} />
          <h3 className="font-medium text-slate-700 dark:text-slate-200">{titulo}</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
            {negociacoes.length}
          </span>
        </div>
      </div>

      {totalValor > 0 && (
        <div className="px-3 pb-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalValor)}
          </p>
        </div>
      )}

      <div className={`flex-1 p-2 space-y-2 overflow-y-auto kanban-column scrollbar-thin ${
        isDragOver && isDragging ? 'bg-primary-50 dark:bg-primary-900/20' : ''
      }`}>
        {negociacoes.map((negociacao) => (
          <KanbanCard
            key={negociacao.id}
            negociacao={negociacao}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onOpenAlya={onOpenAlya}
            onClick={onCardClick}
          />
        ))}

        {negociacoes.length === 0 && (
          <div className="h-32 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            Arraste cards aqui
          </div>
        )}
      </div>
    </div>
  )
}
