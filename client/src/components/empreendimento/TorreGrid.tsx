import { useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
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
  VENDIDO: 'bg-red-500 hover:bg-red-600',
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
  const [showModal, setShowModal] = useState(false)
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
    setShowModal(true)
  }

  const handleSaveUnidade = async () => {
    if (!selectedUnidade) return
    
    setSaving(true)
    try {
      await unidadeService.atualizar(selectedUnidade.id, {
        tipologiaId: formData.tipologiaId ? parseInt(formData.tipologiaId) : null,
        status: formData.status || undefined,
        preco: formData.preco ? parseFloat(formData.preco) : null,
        posicaoSolar: formData.posicaoSolar || null,
      })
      setShowModal(false)
      loadGrid()
      onUpdate?.()
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
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

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {gridData.torre.nome}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {gridData.estatisticas.total} unidades • {gridData.estatisticas.disponiveis} disponíveis
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{gridData.estatisticas.disponiveis}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{gridData.estatisticas.reservados}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{gridData.estatisticas.vendidos}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{gridData.estatisticas.bloqueados}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 pb-2 w-16">
                Andar
              </th>
              {gridData.andares[0]?.unidades.map((_, i) => (
                <th key={i} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 pb-2">
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridData.andares.map((andar) => (
              <tr key={andar.numero}>
                <td className="text-sm font-medium text-slate-600 dark:text-slate-400 py-1 pr-2">
                  {andar.numero}º
                </td>
                {andar.unidades.map((unidade) => (
                  <td key={unidade.id} className="p-1">
                    <button
                      onClick={() => handleUnidadeClick(unidade)}
                      className={`
                        w-full aspect-square min-w-[48px] rounded-lg text-white text-xs font-medium
                        transition-all transform hover:scale-105 hover:shadow-lg
                        ${statusColors[unidade.status]}
                      `}
                      title={`${unidade.codigo} - ${statusLabels[unidade.status]}${unidade.tipologia ? ` - ${unidade.tipologia.nome}` : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="font-bold">{unidade.codigo}</span>
                        {unidade.tipologia && (
                          <span className="text-[10px] opacity-80 truncate max-w-full px-1">
                            {unidade.tipologia.nome}
                          </span>
                        )}
                      </div>
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={`Unidade ${selectedUnidade?.codigo}`}
      >
        {selectedUnidade && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Andar</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedUnidade.andar}º</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Posição</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedUnidade.posicao}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Status Atual</p>
                <Badge variant={
                  selectedUnidade.status === 'DISPONIVEL' ? 'success' :
                  selectedUnidade.status === 'RESERVADO' ? 'warning' :
                  selectedUnidade.status === 'VENDIDO' ? 'danger' : 'default'
                }>
                  {statusLabels[selectedUnidade.status]}
                </Badge>
              </div>
              {selectedUnidade.preco && (
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Preço</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(selectedUnidade.preco)}
                  </p>
                </div>
              )}
            </div>

            <Select
              label="Tipologia"
              value={formData.tipologiaId}
              onChange={(e) => {
                const tipId = e.target.value
                setFormData({ ...formData, tipologiaId: tipId })
                if (tipId) {
                  const tip = tipologias.find(t => t.id === parseInt(tipId))
                  if (tip) {
                    setFormData(prev => ({ ...prev, tipologiaId: tipId, preco: tip.precoBase.toString() }))
                  }
                }
              }}
              options={[
                { value: '', label: 'Selecione uma tipologia' },
                ...tipologias.map(t => ({ 
                  value: t.id.toString(), 
                  label: `${t.nome} - ${t.areaPrivativa}m² - ${formatCurrency(t.precoBase)}` 
                }))
              ]}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusUnidade })}
              options={[
                { value: 'DISPONIVEL', label: 'Disponível' },
                { value: 'RESERVADO', label: 'Reservado' },
                { value: 'VENDIDO', label: 'Vendido' },
                { value: 'BLOQUEADO', label: 'Bloqueado' },
              ]}
            />

            <Input
              label="Preço (R$)"
              type="number"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              placeholder="Preço personalizado"
            />

            <Select
              label="Posição Solar"
              value={formData.posicaoSolar}
              onChange={(e) => setFormData({ ...formData, posicaoSolar: e.target.value })}
              options={[
                { value: '', label: 'Não definida' },
                { value: 'NASCENTE', label: 'Nascente' },
                { value: 'POENTE', label: 'Poente' },
                { value: 'NORTE', label: 'Norte' },
                { value: 'SUL', label: 'Sul' },
              ]}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveUnidade} loading={saving}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
