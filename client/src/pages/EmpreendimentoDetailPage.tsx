import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Building2, MapPin, Layers, Tag, Settings, ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { TorreGrid } from '../components/empreendimento/TorreGrid'
import { Empreendimento, Torre, Tipologia, StatusEmpreendimento } from '../types'
import { empreendimentoService, torreService, tipologiaService } from '../services/api'

const statusLabels: Record<StatusEmpreendimento, string> = {
  FUTURO_LANCAMENTO: 'Futuro Lançamento',
  EM_CONSTRUCAO: 'Em Construção',
  PRONTO: 'Pronto',
}

export function EmpreendimentoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [empreendimento, setEmpreendimento] = useState<Empreendimento | null>(null)
  const [torres, setTorres] = useState<Torre[]>([])
  const [tipologias, setTipologias] = useState<Tipologia[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTorre, setSelectedTorre] = useState<Torre | null>(null)
  const [showTorreModal, setShowTorreModal] = useState(false)
  const [showTipologiaModal, setShowTipologiaModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTorresPanel, setShowTorresPanel] = useState(false)
  const [showTipologiasPanel, setShowTipologiasPanel] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    nome: '',
    incorporadora: '',
    status: 'EM_CONSTRUCAO' as StatusEmpreendimento,
    comissaoPercentual: '',
    endereco: '',
    cidade: '',
    bairro: '',
    descricao: '',
  })

  const [torreForm, setTorreForm] = useState({
    nome: '',
    totalAndares: '18',
    unidadesPorAndar: '4',
  })

  const [tipologiaForm, setTipologiaForm] = useState({
    nome: '',
    areaPrivativa: '',
    quartos: '2',
    suites: '1',
    vagas: '1',
    precoBase: '',
  })

  useEffect(() => {
    if (id) {
      loadEmpreendimento()
    }
  }, [id])

  const loadEmpreendimento = async () => {
    try {
      const [empRes, torresRes, tipRes] = await Promise.all([
        empreendimentoService.buscar(parseInt(id!)),
        torreService.listar(parseInt(id!)),
        tipologiaService.listar(parseInt(id!)),
      ])
      setEmpreendimento(empRes.data)
      setTorres(torresRes.data.torres || [])
      setTipologias(tipRes.data.tipologias || [])
      if (torresRes.data.torres?.length > 0 && !selectedTorre) {
        setSelectedTorre(torresRes.data.torres[0])
      }
    } catch (error) {
      console.error('Erro ao carregar empreendimento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTorre = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await torreService.criar({
        empreendimentoId: parseInt(id!),
        nome: torreForm.nome,
        totalAndares: parseInt(torreForm.totalAndares),
        unidadesPorAndar: parseInt(torreForm.unidadesPorAndar),
      })
      setShowTorreModal(false)
      setTorreForm({ nome: '', totalAndares: '18', unidadesPorAndar: '4' })
      loadEmpreendimento()
    } catch (error) {
      console.error('Erro ao criar torre:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateTipologia = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await tipologiaService.criar({
        empreendimentoId: parseInt(id!),
        nome: tipologiaForm.nome,
        areaPrivativa: parseFloat(tipologiaForm.areaPrivativa),
        quartos: parseInt(tipologiaForm.quartos),
        suites: parseInt(tipologiaForm.suites),
        vagas: parseInt(tipologiaForm.vagas),
        precoBase: parseFloat(tipologiaForm.precoBase),
      })
      setShowTipologiaModal(false)
      setTipologiaForm({
        nome: '',
        areaPrivativa: '',
        quartos: '2',
        suites: '1',
        vagas: '1',
        precoBase: '',
      })
      loadEmpreendimento()
    } catch (error) {
      console.error('Erro ao criar tipologia:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const openEditModal = () => {
    if (empreendimento) {
      setEditForm({
        nome: empreendimento.nome,
        incorporadora: empreendimento.incorporadora || '',
        status: empreendimento.status,
        comissaoPercentual: empreendimento.comissaoPercentual.toString(),
        endereco: empreendimento.endereco || '',
        cidade: empreendimento.cidade || '',
        bairro: empreendimento.bairro || '',
        descricao: empreendimento.descricao || '',
      })
      setShowEditModal(true)
    }
  }

  const handleUpdateEmpreendimento = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await empreendimentoService.atualizar(parseInt(id!), {
        ...editForm,
        comissaoPercentual: parseFloat(editForm.comissaoPercentual),
      })
      setShowEditModal(false)
      loadEmpreendimento()
    } catch (error) {
      console.error('Erro ao atualizar empreendimento:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!empreendimento) {
    return (
      <Card className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          Empreendimento não encontrado
        </h3>
        <Button onClick={() => navigate('/empreendimentos')}>
          Voltar para Empreendimentos
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/empreendimentos')} className="self-start">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {empreendimento.nome}
            </h1>
            <Badge variant={empreendimento.status === 'PRONTO' ? 'success' : empreendimento.status === 'EM_CONSTRUCAO' ? 'warning' : 'info'}>
              {statusLabels[empreendimento.status]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {empreendimento.incorporadora && (
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {empreendimento.incorporadora}
              </span>
            )}
            {(empreendimento.bairro || empreendimento.cidade) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {[empreendimento.bairro, empreendimento.cidade].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={openEditModal} className="self-start sm:self-auto">
          <Settings className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Editar</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 md:hidden">
        <button
          onClick={() => setShowTorresPanel(!showTorresPanel)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium"
        >
          <Layers className="w-4 h-4" />
          Torres ({torres.length})
          <ChevronDown className={`w-4 h-4 transition-transform ${showTorresPanel ? 'rotate-180' : ''}`} />
        </button>
        <button
          onClick={() => setShowTipologiasPanel(!showTipologiasPanel)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium"
        >
          <Tag className="w-4 h-4" />
          Tipologias ({tipologias.length})
          <ChevronDown className={`w-4 h-4 transition-transform ${showTipologiasPanel ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showTorresPanel && (
        <Card className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Torres
            </h3>
            <Button size="sm" onClick={() => setShowTorreModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {torres.map((torre) => (
              <button
                key={torre.id}
                onClick={() => {
                  setSelectedTorre(torre)
                  setShowTorresPanel(false)
                }}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedTorre?.id === torre.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {torre.nome}
              </button>
            ))}
          </div>
        </Card>
      )}

      {showTipologiasPanel && (
        <Card className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tipologias
            </h3>
            <Button size="sm" onClick={() => setShowTipologiaModal(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {tipologias.map((tip) => (
              <div key={tip.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white">{tip.nome}</p>
                <p className="text-xs text-slate-500">{tip.areaPrivativa}m² • {formatCurrency(tip.precoBase)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="hidden md:block lg:col-span-1 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Torres
              </h3>
              <Button size="sm" onClick={() => setShowTorreModal(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {torres.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                Nenhuma torre cadastrada
              </p>
            ) : (
              <div className="space-y-2">
                {torres.map((torre) => (
                  <button
                    key={torre.id}
                    onClick={() => setSelectedTorre(torre)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTorre?.id === torre.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                    }`}
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{torre.nome}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {torre.totalAndares} andares • {torre.unidadesPorAndar} un/andar
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tipologias
              </h3>
              <Button size="sm" onClick={() => setShowTipologiaModal(true)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {tipologias.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                Nenhuma tipologia cadastrada
              </p>
            ) : (
              <div className="space-y-2">
                {tipologias.map((tip) => (
                  <div
                    key={tip.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{tip.nome}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {tip.areaPrivativa}m² • {tip.quartos}q • {tip.suites}s • {tip.vagas}v
                    </p>
                    <p className="text-sm font-semibold text-primary-600 mt-1">
                      {formatCurrency(tip.precoBase)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedTorre ? (
            <TorreGrid 
              torreId={selectedTorre.id} 
              tipologias={tipologias}
              onUpdate={loadEmpreendimento}
            />
          ) : (
            <Card className="text-center py-12">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Selecione uma torre
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                {torres.length === 0 
                  ? 'Cadastre uma torre para visualizar as unidades'
                  : 'Clique em uma torre para ver o grid de unidades'
                }
              </p>
              {torres.length === 0 && (
                <Button onClick={() => setShowTorreModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Torre
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={showTorreModal} onClose={() => setShowTorreModal(false)} title="Nova Torre">
        <form onSubmit={handleCreateTorre} className="space-y-4">
          <Input
            label="Nome da Torre"
            value={torreForm.nome}
            onChange={(e) => setTorreForm({ ...torreForm, nome: e.target.value })}
            placeholder="Ex: Torre 1, Bloco A"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total de Andares"
              type="number"
              value={torreForm.totalAndares}
              onChange={(e) => setTorreForm({ ...torreForm, totalAndares: e.target.value })}
              min="1"
              required
            />
            <Input
              label="Unidades por Andar"
              type="number"
              value={torreForm.unidadesPorAndar}
              onChange={(e) => setTorreForm({ ...torreForm, unidadesPorAndar: e.target.value })}
              min="1"
              required
            />
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Serão criadas {parseInt(torreForm.totalAndares || '0') * parseInt(torreForm.unidadesPorAndar || '0')} unidades automaticamente
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowTorreModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Criar Torre
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showTipologiaModal} onClose={() => setShowTipologiaModal(false)} title="Nova Tipologia">
        <form onSubmit={handleCreateTipologia} className="space-y-4">
          <Input
            label="Nome da Tipologia"
            value={tipologiaForm.nome}
            onChange={(e) => setTipologiaForm({ ...tipologiaForm, nome: e.target.value })}
            placeholder="Ex: 2/4 com varanda"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Área Privativa (m²)"
              type="number"
              step="0.01"
              value={tipologiaForm.areaPrivativa}
              onChange={(e) => setTipologiaForm({ ...tipologiaForm, areaPrivativa: e.target.value })}
              required
            />
            <Input
              label="Preço Base (R$)"
              type="number"
              value={tipologiaForm.precoBase}
              onChange={(e) => setTipologiaForm({ ...tipologiaForm, precoBase: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Quartos"
              type="number"
              value={tipologiaForm.quartos}
              onChange={(e) => setTipologiaForm({ ...tipologiaForm, quartos: e.target.value })}
              min="0"
            />
            <Input
              label="Suítes"
              type="number"
              value={tipologiaForm.suites}
              onChange={(e) => setTipologiaForm({ ...tipologiaForm, suites: e.target.value })}
              min="0"
            />
            <Input
              label="Vagas"
              type="number"
              value={tipologiaForm.vagas}
              onChange={(e) => setTipologiaForm({ ...tipologiaForm, vagas: e.target.value })}
              min="0"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowTipologiaModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Criar Tipologia
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Empreendimento" size="lg">
        <form onSubmit={handleUpdateEmpreendimento} className="space-y-4">
          <Input
            label="Nome do Empreendimento"
            value={editForm.nome}
            onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Incorporadora"
              value={editForm.incorporadora}
              onChange={(e) => setEditForm({ ...editForm, incorporadora: e.target.value })}
            />
            <Select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as StatusEmpreendimento })}
              options={[
                { value: 'FUTURO_LANCAMENTO', label: 'Futuro Lançamento' },
                { value: 'EM_CONSTRUCAO', label: 'Em Construção' },
                { value: 'PRONTO', label: 'Pronto' },
              ]}
            />
          </div>

          <Input
            label="Comissão (%)"
            type="number"
            step="0.1"
            value={editForm.comissaoPercentual}
            onChange={(e) => setEditForm({ ...editForm, comissaoPercentual: e.target.value })}
            required
          />

          <Input
            label="Endereço"
            value={editForm.endereco}
            onChange={(e) => setEditForm({ ...editForm, endereco: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bairro"
              value={editForm.bairro}
              onChange={(e) => setEditForm({ ...editForm, bairro: e.target.value })}
            />
            <Input
              label="Cidade"
              value={editForm.cidade}
              onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
