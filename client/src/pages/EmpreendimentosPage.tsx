import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MapPin, Building2, Eye, BarChart3 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Empreendimento, StatusEmpreendimento } from '../types'
import { empreendimentoService } from '../services/api'

const statusLabels: Record<StatusEmpreendimento, string> = {
  FUTURO_LANCAMENTO: 'Futuro Lançamento',
  EM_CONSTRUCAO: 'Em Construção',
  PRONTO: 'Pronto',
}

const statusColors: Record<StatusEmpreendimento, 'info' | 'warning' | 'success'> = {
  FUTURO_LANCAMENTO: 'info',
  EM_CONSTRUCAO: 'warning',
  PRONTO: 'success',
}

export function EmpreendimentosPage() {
  const navigate = useNavigate()
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    incorporadora: '',
    status: 'EM_CONSTRUCAO' as StatusEmpreendimento,
    comissaoPercentual: '5',
    endereco: '',
    cidade: '',
    bairro: '',
    descricao: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadEmpreendimentos()
  }, [statusFiltro])

  const loadEmpreendimentos = async () => {
    try {
      const params = statusFiltro ? { status: statusFiltro } : undefined
      const response = await empreendimentoService.listar(params)
      setEmpreendimentos(response.data.empreendimentos)
    } catch (error) {
      console.error('Erro ao carregar empreendimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await empreendimentoService.criar({
        ...formData,
        comissaoPercentual: parseFloat(formData.comissaoPercentual),
      })
      setShowModal(false)
      setFormData({
        nome: '',
        incorporadora: '',
        status: 'EM_CONSTRUCAO',
        comissaoPercentual: '5',
        endereco: '',
        cidade: '',
        bairro: '',
        descricao: '',
      })
      navigate(`/empreendimentos/${response.data.id}`)
    } catch (error) {
      console.error('Erro ao criar empreendimento:', error)
    } finally {
      setSaving(false)
    }
  }

  const filteredEmpreendimentos = empreendimentos.filter(emp =>
    emp.nome.toLowerCase().includes(search.toLowerCase()) ||
    emp.incorporadora?.toLowerCase().includes(search.toLowerCase()) ||
    emp.bairro?.toLowerCase().includes(search.toLowerCase())
  )

  const getTotalUnidades = (emp: Empreendimento) => {
    if (!emp.torres) return 0
    return emp.torres.reduce((acc, t) => acc + t.totalAndares * t.unidadesPorAndar, 0)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Empreendimentos</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {empreendimentos.length} lançamentos cadastrados
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Empreendimento
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome, incorporadora ou bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'FUTURO_LANCAMENTO', label: 'Futuro Lançamento' },
            { value: 'EM_CONSTRUCAO', label: 'Em Construção' },
            { value: 'PRONTO', label: 'Pronto' },
          ]}
          className="w-48"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filteredEmpreendimentos.length === 0 ? (
        <Card className="text-center py-12">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Nenhum empreendimento encontrado
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Comece cadastrando seu primeiro lançamento
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Empreendimento
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmpreendimentos.map((emp) => (
            <Card 
              key={emp.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/empreendimentos/${emp.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-500" />
                  <Badge variant={statusColors[emp.status]}>
                    {statusLabels[emp.status]}
                  </Badge>
                </div>
                <Badge variant="success">{emp.comissaoPercentual}%</Badge>
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {emp.nome}
              </h3>
              
              {emp.incorporadora && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {emp.incorporadora}
                </p>
              )}

              {(emp.bairro || emp.cidade) && (
                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{[emp.bairro, emp.cidade].filter(Boolean).join(', ')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>{emp.torres?.length || 0} torres</span>
                  <span>{getTotalUnidades(emp)} unidades</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/empreendimentos/${emp.id}`)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/empreendimentos/${emp.id}/estatisticas`)
                    }}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Empreendimento" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Empreendimento"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Residencial Vista Mar"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Incorporadora"
              value={formData.incorporadora}
              onChange={(e) => setFormData({ ...formData, incorporadora: e.target.value })}
              placeholder="Ex: Construtora XYZ"
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusEmpreendimento })}
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
            value={formData.comissaoPercentual}
            onChange={(e) => setFormData({ ...formData, comissaoPercentual: e.target.value })}
            placeholder="5"
            required
          />

          <Input
            label="Endereço"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bairro"
              value={formData.bairro}
              onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
            />
            <Input
              label="Cidade"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Criar Empreendimento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
