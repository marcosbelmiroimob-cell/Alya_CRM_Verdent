import { useEffect, useState } from 'react'
import { Grid3X3, TableProperties } from 'lucide-react'
import { Card } from '../ui/Card'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { UnidadeDetailsPanel } from './UnidadeDetailsPanel'
import { UnidadeTableEditor } from './UnidadeTableEditor'
import { Unidade, Tipologia, StatusUnidade, TorreGrid as TorreGridType } from '../../types'
import { torreService, unidadeService } from '../../services/api'

interface TorreGridProps {
  torreId: number
  tipologias: Tipologia[]
  onUpdate?: () => void
}

const statusColors: Record<StatusUnidade, string> = {
  DISPONIVEL: 'bg-emerald-500 hover:bg-emerald-600',
  RESERVADO: 'bg-amber-500 hover:bg-amber-600',
  VENDIDO: 'bg-rose-500 hover:bg-rose-600',
  BLOQUEADO: 'bg-slate-400 hover:bg-slate-500',
}

const statusLabels: Record<StatusUnidade, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
  BLOQUEADO: 'Bloqueado',
}

export function TorreGrid({ torreId, tipologias, onUpdate }: TorreGridProps) {
  const [gridData, setGridData] = useState<TorreGridType | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUnidade, setSelectedUnidade] = useState<Unidade | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showTableEditor, setShowTableEditor] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    tipologiaId: '',
    status: '' as StatusUnidade | '',
    preco: '',
    posicaoSolar: '',
  })

  useEffect(() => {
    loadGrid()
  }, [torreId])

  const loadGrid = async () => {
    try {
      setLoading(true)
      const response = await torreService.grid(torreId)
      setGridData(response.data)
    } catch (error) {
      console.error('Erro ao carregar grid:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnidadeClick = (unidade: Unidade) => {
    setSelectedUnidade(unidade)
    setFormData({
      tipologiaId: unidade.tipologiaId?.toString() || '',
      status: unidade.status,
      preco: unidade.preco?.toString() || '',
      posicaoSolar: unidade.posicaoSolar || '',
    })
    setShowDetailModal(true)
  }

  const handleCloseDetails = () => {
    setSelectedUnidade(null)
    setShowDetailModal(false)
  }

  const handleSaveUnidade = async (data: {
    tipologiaId: number | null
    status: StatusUnidade
    preco: number | null
    posicaoSolar: string | null
  }) => {
    if (!selectedUnidade) return
    
    setSaving(true)
    try {
      await unidadeService.atualizar(selectedUnidade.id, data)
      handleCloseDetails()
      loadGrid()
      onUpdate?.()
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </Card>
    )
  }

  if (!gridData) {
    return (
      <Card className="text-center py-12">
        <p className="text-slate-500">Erro ao carregar grid</p>
      </Card>
    )
  }

  const unidadesPorAndar = gridData.torre.unidadesPorAndar || gridData.andares[0]?.unidades.length || 4

  const handleTableEditorSave = () => {
    setShowTableEditor(false)
    loadGrid()
    onUpdate?.()
  }

  return (
    <div>
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {gridData.torre.nome}
            </h3>
            <p className="text-sm text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              DISPONIBILIDADE EM TEMPO REAL
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTableEditor(true)}
            >
              <TableProperties className="w-4 h-4 mr-2" />
              Editar Valores
            </Button>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Grid3X3 className="w-5 h-5" />
              <span>{unidadesPorAndar} UNID/ANDAR</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{gridData.estatisticas.disponiveis} Disponíveis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{gridData.estatisticas.reservados} Reservados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-rose-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{gridData.estatisticas.vendidos} Vendidos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{gridData.estatisticas.bloqueados} Bloqueados</span>
          </div>
        </div>

        <div className="space-y-2 overflow-x-auto">
          {gridData.andares.map((andar) => (
            <div key={andar.numero} className="flex items-center gap-2 min-w-fit">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{andar.numero}º</span>
                <span className="text-[8px] md:text-[10px] text-slate-500 uppercase">Nível</span>
              </div>
              <div className="flex gap-1 flex-1">
                {andar.unidades.map((unidade) => (
                  <button
                    key={unidade.id}
                    onClick={() => handleUnidadeClick(unidade)}
                    className={`
                      flex-1 min-w-[80px] md:min-w-[100px] h-12 md:h-14 rounded-lg 
                      text-white text-sm md:text-base font-bold
                      transition-all transform hover:scale-[1.02] hover:shadow-lg
                      ${statusColors[unidade.status]}
                    `}
                    title={`${unidade.codigo} - ${statusLabels[unidade.status]}`}
                  >
                    {unidade.codigo}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={showDetailModal && !!selectedUnidade}
        onClose={handleCloseDetails}
        title={`Unidade ${selectedUnidade?.codigo || ''}`}
        size="md"
      >
        {selectedUnidade && (
          <UnidadeDetailsPanel
            unidade={selectedUnidade}
            tipologias={tipologias}
            onClose={handleCloseDetails}
            onSave={handleSaveUnidade}
            saving={saving}
            formData={formData}
            onFormChange={setFormData}
            inModal
          />
        )}
      </Modal>

      <Modal
        isOpen={showTableEditor}
        onClose={() => setShowTableEditor(false)}
        title={`Editar Valores - ${gridData.torre.nome}`}
        size="xl"
      >
        <UnidadeTableEditor
          torreId={torreId}
          tipologias={tipologias}
          onClose={() => setShowTableEditor(false)}
          onSave={handleTableEditorSave}
        />
      </Modal>
    </div>
  )
}
