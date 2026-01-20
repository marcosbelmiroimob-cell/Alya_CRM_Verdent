import { useEffect, useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Tipologia, StatusUnidade } from '../../types'
import { torreService, unidadeService } from '../../services/api'

interface UnidadeTableEditorProps {
  torreId: number
  tipologias: Tipologia[]
  onClose: () => void
  onSave: () => void
}

interface UnidadeEdit {
  id: number
  codigo: string
  andar: number
  tipologiaId: number | null
  status: StatusUnidade
  preco: number | null
  posicaoSolar: string | null
  modified: boolean
}

const statusOptions = [
  { value: 'DISPONIVEL', label: 'Disponivel' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'BLOQUEADO', label: 'Bloqueado' },
]

const posicaoSolarOptions = [
  { value: '', label: '-' },
  { value: 'NASCENTE', label: 'Nascente' },
  { value: 'POENTE', label: 'Poente' },
  { value: 'NORTE', label: 'Norte' },
  { value: 'SUL', label: 'Sul' },
]

export function UnidadeTableEditor({ torreId, tipologias, onClose, onSave }: UnidadeTableEditorProps) {
  const [unidades, setUnidades] = useState<UnidadeEdit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkTipologia, setBulkTipologia] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkPosicaoSolar, setBulkPosicaoSolar] = useState('')

  useEffect(() => {
    loadUnidades()
  }, [torreId])

  const loadUnidades = async () => {
    try {
      setLoading(true)
      const response = await torreService.grid(torreId)
      const allUnidades: UnidadeEdit[] = []
      
      response.data.andares.forEach((andar: any) => {
        andar.unidades.forEach((u: any) => {
          allUnidades.push({
            id: u.id,
            codigo: u.codigo,
            andar: u.andar,
            tipologiaId: u.tipologiaId,
            status: u.status,
            preco: u.preco,
            posicaoSolar: u.posicaoSolar,
            modified: false,
          })
        })
      })
      
      allUnidades.sort((a, b) => b.andar - a.andar || a.codigo.localeCompare(b.codigo))
      setUnidades(allUnidades)
    } catch (error) {
      console.error('Erro ao carregar unidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (id: number, field: keyof UnidadeEdit, value: any) => {
    setUnidades(prev => prev.map(u => 
      u.id === id ? { ...u, [field]: value, modified: true } : u
    ))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(unidades.map(u => u.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const applyBulkTipologia = () => {
    if (!bulkTipologia || selectedIds.size === 0) return
    const tipId = parseInt(bulkTipologia)
    const tip = tipologias.find(t => t.id === tipId)
    
    setUnidades(prev => prev.map(u => 
      selectedIds.has(u.id) 
        ? { ...u, tipologiaId: tipId, preco: tip?.precoBase || u.preco, modified: true } 
        : u
    ))
  }

  const applyBulkStatus = () => {
    if (!bulkStatus || selectedIds.size === 0) return
    setUnidades(prev => prev.map(u => 
      selectedIds.has(u.id) ? { ...u, status: bulkStatus as StatusUnidade, modified: true } : u
    ))
  }

  const applyBulkPosicaoSolar = () => {
    if (selectedIds.size === 0) return
    setUnidades(prev => prev.map(u => 
      selectedIds.has(u.id) ? { ...u, posicaoSolar: bulkPosicaoSolar || null, modified: true } : u
    ))
  }

  const handleSave = async () => {
    const modifiedUnidades = unidades.filter(u => u.modified)
    if (modifiedUnidades.length === 0) {
      onClose()
      return
    }

    setSaving(true)
    try {
      await unidadeService.atualizarValores({
        unidades: modifiedUnidades.map(u => ({
          id: u.id,
          tipologiaId: u.tipologiaId,
          status: u.status,
          preco: u.preco,
          posicaoSolar: u.posicaoSolar,
        })),
      })
      onSave()
    } catch (error) {
      console.error('Erro ao salvar unidades:', error)
    } finally {
      setSaving(false)
    }
  }

  const modifiedCount = unidades.filter(u => u.modified).length

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <div className="flex items-center gap-2">
          <Select
            value={bulkTipologia}
            onChange={(e) => setBulkTipologia(e.target.value)}
            options={[
              { value: '', label: 'Tipologia...' },
              ...tipologias.map(t => ({ value: t.id.toString(), label: t.nome })),
            ]}
            className="w-40"
          />
          <Button size="sm" variant="outline" onClick={applyBulkTipologia} disabled={!bulkTipologia || selectedIds.size === 0}>
            Aplicar
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            options={[{ value: '', label: 'Status...' }, ...statusOptions]}
            className="w-32"
          />
          <Button size="sm" variant="outline" onClick={applyBulkStatus} disabled={!bulkStatus || selectedIds.size === 0}>
            Aplicar
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={bulkPosicaoSolar}
            onChange={(e) => setBulkPosicaoSolar(e.target.value)}
            options={[{ value: '', label: 'Solar...' }, ...posicaoSolarOptions.slice(1)]}
            className="w-32"
          />
          <Button size="sm" variant="outline" onClick={applyBulkPosicaoSolar} disabled={selectedIds.size === 0}>
            Aplicar
          </Button>
        </div>
        <span className="ml-auto text-sm text-slate-500 self-center">
          {selectedIds.size} selecionado(s)
        </span>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
            <tr>
              <th className="p-2 text-left w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === unidades.length && unidades.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300"
                />
              </th>
              <th className="p-2 text-left font-medium">Unidade</th>
              <th className="p-2 text-left font-medium">Andar</th>
              <th className="p-2 text-left font-medium">Tipologia</th>
              <th className="p-2 text-left font-medium">Status</th>
              <th className="p-2 text-left font-medium">Preco</th>
              <th className="p-2 text-left font-medium">Solar</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map((unidade) => (
              <tr 
                key={unidade.id} 
                className={`border-t border-slate-200 dark:border-slate-700 ${
                  unidade.modified ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                }`}
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(unidade.id)}
                    onChange={(e) => handleSelectOne(unidade.id, e.target.checked)}
                    className="rounded border-slate-300"
                  />
                </td>
                <td className="p-2 font-medium">{unidade.codigo}</td>
                <td className="p-2">{unidade.andar}o</td>
                <td className="p-2">
                  <select
                    value={unidade.tipologiaId?.toString() || ''}
                    onChange={(e) => {
                      const tipId = e.target.value ? parseInt(e.target.value) : null
                      const tip = tipologias.find(t => t.id === tipId)
                      handleFieldChange(unidade.id, 'tipologiaId', tipId)
                      if (tip) {
                        handleFieldChange(unidade.id, 'preco', tip.precoBase)
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  >
                    <option value="">-</option>
                    {tipologias.map(t => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    value={unidade.status}
                    onChange={(e) => handleFieldChange(unidade.id, 'status', e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded text-white font-medium ${
                      unidade.status === 'DISPONIVEL' ? 'bg-emerald-500 border-emerald-500' :
                      unidade.status === 'RESERVADO' ? 'bg-amber-500 border-amber-500' :
                      unidade.status === 'VENDIDO' ? 'bg-rose-500 border-rose-500' :
                      'bg-slate-400 border-slate-400'
                    }`}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={unidade.preco || ''}
                    onChange={(e) => handleFieldChange(unidade.id, 'preco', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Preco"
                    className="w-28 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  />
                </td>
                <td className="p-2">
                  <select
                    value={unidade.posicaoSolar || ''}
                    onChange={(e) => handleFieldChange(unidade.id, 'posicaoSolar', e.target.value || null)}
                    className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                  >
                    {posicaoSolarOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <span className="text-sm text-slate-500">
          {modifiedCount > 0 ? `${modifiedCount} unidade(s) modificada(s)` : 'Nenhuma alteracao'}
        </span>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={modifiedCount === 0}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alteracoes
          </Button>
        </div>
      </div>
    </div>
  )
}
