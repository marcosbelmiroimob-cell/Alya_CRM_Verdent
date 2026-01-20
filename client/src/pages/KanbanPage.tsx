import { useEffect, useState } from 'react'
import { Plus, Filter, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { NovaNegociacaoModal } from '../components/kanban/NovaNegociacaoModal'
import { NegociacaoDetailModal } from '../components/kanban/NegociacaoDetailModal'
import { AlyaChat } from '../components/kanban/AlyaChat'
import { useKanbanStore } from '../stores/kanbanStore'

export function KanbanPage() {
  const [showNovaModal, setShowNovaModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAlya, setShowAlya] = useState(false)
  const [negociacaoSelecionada, setNegociacaoSelecionada] = useState<number | null>(null)
  const { fetchKanban, loading } = useKanbanStore()

  useEffect(() => {
    fetchKanban()
  }, [fetchKanban])

  const handleOpenAlya = (negociacaoId: number) => {
    setNegociacaoSelecionada(negociacaoId)
    setShowAlya(true)
  }

  const handleOpenDetail = (negociacaoId: number) => {
    setNegociacaoSelecionada(negociacaoId)
    setShowDetailModal(true)
  }

  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setNegociacaoSelecionada(null)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pipeline de Vendas</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie suas negociacoes em andamento</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => fetchKanban()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm" onClick={() => setShowNovaModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Negociacao
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <KanbanBoard onOpenAlya={handleOpenAlya} onCardClick={handleOpenDetail} />
      )}

      <NovaNegociacaoModal
        isOpen={showNovaModal}
        onClose={() => {
          setShowNovaModal(false)
          fetchKanban()
        }}
      />

      {showDetailModal && negociacaoSelecionada && (
        <NegociacaoDetailModal
          negociacaoId={negociacaoSelecionada}
          isOpen={showDetailModal}
          onClose={handleCloseDetail}
          onOpenAlya={handleOpenAlya}
          onUpdate={fetchKanban}
        />
      )}

      {showAlya && negociacaoSelecionada && (
        <AlyaChat
          negociacaoId={negociacaoSelecionada}
          onClose={() => {
            setShowAlya(false)
          }}
        />
      )}
    </div>
  )
}
