import { Phone, MessageCircle, Building2, Clock, Sparkles } from 'lucide-react'
import { Negociacao } from '../../types'
import { Badge } from '../ui/Badge'

interface KanbanCardProps {
  negociacao: Negociacao
  onDragStart: (id: number) => void
  onDragEnd: () => void
  onOpenAlya: (negociacaoId: number) => void
  onClick: (negociacaoId: number) => void
}

export function KanbanCard({ negociacao, onDragStart, onDragEnd, onOpenAlya, onClick }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', negociacao.id.toString())
    onDragStart(negociacao.id)
  }

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    onClick(negociacao.id)
  }

  const diasNaEtapa = Math.floor(
    (Date.now() - new Date(negociacao.atualizadoEm).getTime()) / (1000 * 60 * 60 * 24)
  )

  const getScoreColor = (score: number) => {
    if (score >= 76) return 'text-green-500'
    if (score >= 51) return 'text-yellow-500'
    if (score >= 26) return 'text-blue-500'
    return 'text-slate-400'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 dark:text-white truncate">
            {negociacao.lead?.nome || 'Lead'}
          </h4>
          {negociacao.lead?.telefone && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{negociacao.lead.telefone}</span>
            </div>
          )}
        </div>
        <div className={`text-sm font-bold ${getScoreColor(negociacao.lead?.scoreQualificacao || 0)}`}>
          {negociacao.lead?.scoreQualificacao || 0}
        </div>
      </div>

      {negociacao.imovel && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-2 bg-slate-50 dark:bg-slate-700/50 rounded px-2 py-1">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{negociacao.imovel.titulo}</span>
        </div>
      )}

      {negociacao.imovel?.valor && (
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(negociacao.imovel.valor)}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{diasNaEtapa}d</span>
          {diasNaEtapa > 7 && (
            <Badge variant="warning" size="sm">Parado</Badge>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (negociacao.lead?.telefone) {
                window.open(`https://wa.me/55${negociacao.lead.telefone.replace(/\D/g, '')}`, '_blank')
              }
            }}
            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-600"
            title="Abrir WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenAlya(negociacao.id)
            }}
            className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded text-purple-600"
            title="Pedir ajuda a Alya"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
