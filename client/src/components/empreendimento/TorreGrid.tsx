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
  VENDIDO: 'bg-rose-500 hover:bg-rose-600',
  BLOQUEADO: 'bg-slate-400 hover:bg-slate-500',
}

const statusBorderColors: Record<StatusUnidade, string> = {
  DISPONIVEL: 'border-emerald-500',
  RESERVADO: 'border-amber-500',
  VENDIDO: 'border-rose-500',
  BLOQUEADO: 'border-slate-400',
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

  const unidadesPorAndar = gridData.torre.unidadesPorAndar || gridData.andares[0]?.unidades.length || 4

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {gridData.torre.nome}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {gridData.estatisticas.total} unidades • {gridData.estatisticas.disponiveis} disponíveis
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-emerald-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">{gridData.estatisticas.disponiveis}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">{gridData.estatisticas.reservados}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-rose-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">{gridData.estatisticas.vendidos}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">{gridData.estatisticas.bloqueados}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-block">
          <div 
            className="border-4 border-slate-800 dark:border-slate-300 rounded-t-[40px] rounded-b-lg p-3 bg-white dark:bg-slate-900"
            style={{ minWidth: `${unidadesPorAndar * 56 + 24}px` }}
          >
            <div className="space-y-1">
              {gridData.andares.map((andar) => (
                <div key={andar.numero} className="flex items-center gap-2">
                  <span className="w-8 text-xs font-medium text-slate-500 dark:text-slate-400 text-right">
                    {andar.numero}º
                  </span>
                  <div className="flex gap-1">
                    {andar.unidades.map((unidade) => (
                      <button
                        key={unidade.id}
                        onClick={() => handleUnidadeClick(unidade)}
                        className={`
                          w-12 h-10 rounded border-2 text-white text-[10px] font-bold
                          transition-all transform hover:scale-110 hover:shadow-lg hover:z-10
                          ${statusColors[unidade.status]}
                          ${statusBorderColors[unidade.status]}
                        `}
                        title={`${unidade.codigo} - ${statusLabels[unidade.status]}${unidade.tipologia ? ` - ${unidade.tipologia.nome}` : ''}`}
                      >
                        {unidade.codigo}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <span className="bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-full">
              INVENTARIO ATIVO
            </span>
          </div>
        </div>
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
