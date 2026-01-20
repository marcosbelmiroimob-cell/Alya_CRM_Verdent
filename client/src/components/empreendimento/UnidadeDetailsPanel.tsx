import { X, Home, Car, Sun, TrendingUp } from 'lucide-react'
import { Unidade, Tipologia, StatusUnidade } from '../../types'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'

interface UnidadeDetailsPanelProps {
  unidade: Unidade | null
  tipologias: Tipologia[]
  onClose: () => void
  onSave: (data: {
    tipologiaId: number | null
    status: StatusUnidade
    preco: number | null
    posicaoSolar: string | null
  }) => void
  saving?: boolean
  formData: {
    tipologiaId: string
    status: StatusUnidade | ''
    preco: string
    posicaoSolar: string
  }
  onFormChange: (data: {
    tipologiaId: string
    status: StatusUnidade | ''
    preco: string
    posicaoSolar: string
  }) => void
  inModal?: boolean
}

const statusLabels: Record<StatusUnidade, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
  BLOQUEADO: 'Bloqueado',
}

const statusColors: Record<StatusUnidade, string> = {
  DISPONIVEL: 'bg-emerald-500',
  RESERVADO: 'bg-amber-500',
  VENDIDO: 'bg-rose-500',
  BLOQUEADO: 'bg-slate-400',
}

const posicaoSolarLabels: Record<string, string> = {
  NASCENTE: 'Sol da Manhã',
  POENTE: 'Sol da Tarde',
  NORTE: 'Norte',
  SUL: 'Sul',
}

export function UnidadeDetailsPanel({
  unidade,
  tipologias,
  onClose,
  onSave,
  saving,
  formData,
  onFormChange,
  inModal = false,
}: UnidadeDetailsPanelProps) {
  if (!unidade) return null

  const tipologia = tipologias.find(t => t.id === unidade.tipologiaId)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const handleSave = () => {
    onSave({
      tipologiaId: formData.tipologiaId ? parseInt(formData.tipologiaId) : null,
      status: formData.status as StatusUnidade,
      preco: formData.preco ? parseFloat(formData.preco) : null,
      posicaoSolar: formData.posicaoSolar || null,
    })
  }

  return (
    <div className={inModal ? '' : 'bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden'}>
      <div className={`relative ${inModal ? 'bg-slate-100 dark:bg-slate-700' : 'bg-slate-900'} ${inModal ? 'text-slate-900 dark:text-white' : 'text-white'} p-6 text-center ${inModal ? 'rounded-xl' : ''}`}>
        {!inModal && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl ${statusColors[unidade.status]} text-white text-2xl md:text-3xl font-bold mb-4`}>
          {unidade.codigo}
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {tipologia?.nome || 'Sem tipologia'}
        </h3>

        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium text-white ${
          unidade.status === 'DISPONIVEL' ? 'bg-emerald-500' :
          unidade.status === 'RESERVADO' ? 'bg-amber-500' :
          unidade.status === 'VENDIDO' ? 'bg-rose-500' : 'bg-slate-500'
        }`}>
          {statusLabels[unidade.status]}
        </span>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <Home className="w-6 h-6 text-slate-400" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {tipologia?.areaPrivativa || '-'}m²
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Área Privativa</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <Car className="w-6 h-6 text-slate-400" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {tipologia?.vagas || '-'} Vagas
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Garagem</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <TrendingUp className="w-6 h-6 text-slate-400" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                Pav. {unidade.andar}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Elevação</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <Sun className="w-6 h-6 text-slate-400" />
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {unidade.posicaoSolar ? posicaoSolarLabels[unidade.posicaoSolar] || unidade.posicaoSolar : '-'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Incidência</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Preço de Tabela</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {unidade.preco ? formatCurrency(unidade.preco) : tipologia?.precoBase ? formatCurrency(tipologia.precoBase) : 'A consultar'}
          </p>
        </div>

        <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6">
          <Select
            label="Tipologia"
            value={formData.tipologiaId}
            onChange={(e) => {
              const tipId = e.target.value
              onFormChange({ ...formData, tipologiaId: tipId })
              if (tipId) {
                const tip = tipologias.find(t => t.id === parseInt(tipId))
                if (tip) {
                  onFormChange({ ...formData, tipologiaId: tipId, preco: tip.precoBase.toString() })
                }
              }
            }}
            options={[
              { value: '', label: 'Selecione uma tipologia' },
              ...tipologias.map(t => ({ 
                value: t.id.toString(), 
                label: `${t.nome} - ${t.areaPrivativa}m²` 
              }))
            ]}
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => onFormChange({ ...formData, status: e.target.value as StatusUnidade })}
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
            onChange={(e) => onFormChange({ ...formData, preco: e.target.value })}
            placeholder="Preço personalizado"
          />

          <Select
            label="Posição Solar"
            value={formData.posicaoSolar}
            onChange={(e) => onFormChange({ ...formData, posicaoSolar: e.target.value })}
            options={[
              { value: '', label: 'Não definida' },
              { value: 'NASCENTE', label: 'Sol da Manhã' },
              { value: 'POENTE', label: 'Sol da Tarde' },
              { value: 'NORTE', label: 'Norte' },
              { value: 'SUL', label: 'Sul' },
            ]}
          />
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSave}
            loading={saving}
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
