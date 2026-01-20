import { useEffect, useState } from 'react'
import { Plus, Search, MapPin, Home, User, FileText } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ImovelUsado, TipoImovelUsado, Documentacao } from '../types'
import { imovelUsadoService } from '../services/api'

const tipoLabels: Record<TipoImovelUsado, string> = {
  APARTAMENTO: 'Apartamento',
  CASA: 'Casa',
  TERRENO: 'Terreno',
  SALA_COMERCIAL: 'Sala Comercial',
  COBERTURA: 'Cobertura',
  LOFT: 'Loft',
}

const docLabels: Record<Documentacao, string> = {
  ESCRITURADO: 'Escriturado',
  FINANCIADO: 'Financiado',
  INVENTARIO: 'Inventário',
  IRREGULAR: 'Irregular',
}

const docColors: Record<Documentacao, 'success' | 'info' | 'warning' | 'danger'> = {
  ESCRITURADO: 'success',
  FINANCIADO: 'info',
  INVENTARIO: 'warning',
  IRREGULAR: 'danger',
}

export function ImoveisUsadosPage() {
  const [imoveis, setImoveis] = useState<ImovelUsado[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    tipoImovel: 'APARTAMENTO' as TipoImovelUsado,
    titulo: '',
    endereco: '',
    cidade: '',
    bairro: '',
    areaUtil: '',
    areaTotal: '',
    quartos: '2',
    suites: '1',
    vagas: '1',
    valorAvaliacao: '',
    valorVenda: '',
    comissaoPercentual: '6',
    documentacao: 'ESCRITURADO' as Documentacao,
    nomeProprietario: '',
    telefoneProprietario: '',
    emailProprietario: '',
    descricao: '',
  })

  useEffect(() => {
    loadImoveis()
  }, [tipoFiltro])

  const loadImoveis = async () => {
    try {
      const params = tipoFiltro ? { tipo: tipoFiltro } : undefined
      const response = await imovelUsadoService.listar(params)
      setImoveis(response.data.imoveisUsados)
    } catch (error) {
      console.error('Erro ao carregar imóveis usados:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      tipoImovel: 'APARTAMENTO',
      titulo: '',
      endereco: '',
      cidade: '',
      bairro: '',
      areaUtil: '',
      areaTotal: '',
      quartos: '2',
      suites: '1',
      vagas: '1',
      valorAvaliacao: '',
      valorVenda: '',
      comissaoPercentual: '6',
      documentacao: 'ESCRITURADO',
      nomeProprietario: '',
      telefoneProprietario: '',
      emailProprietario: '',
      descricao: '',
    })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...formData,
        areaUtil: formData.areaUtil ? parseFloat(formData.areaUtil) : undefined,
        areaTotal: formData.areaTotal ? parseFloat(formData.areaTotal) : undefined,
        quartos: parseInt(formData.quartos),
        suites: parseInt(formData.suites),
        vagas: parseInt(formData.vagas),
        valorAvaliacao: formData.valorAvaliacao ? parseFloat(formData.valorAvaliacao) : undefined,
        valorVenda: parseFloat(formData.valorVenda),
        comissaoPercentual: parseFloat(formData.comissaoPercentual),
      }

      if (editingId) {
        await imovelUsadoService.atualizar(editingId, data)
      } else {
        await imovelUsadoService.criar(data)
      }
      
      setShowModal(false)
      resetForm()
      loadImoveis()
    } catch (error) {
      console.error('Erro ao salvar imóvel usado:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (imovel: ImovelUsado) => {
    setFormData({
      tipoImovel: imovel.tipoImovel,
      titulo: imovel.titulo,
      endereco: imovel.endereco || '',
      cidade: imovel.cidade || '',
      bairro: imovel.bairro || '',
      areaUtil: imovel.areaUtil?.toString() || '',
      areaTotal: imovel.areaTotal?.toString() || '',
      quartos: imovel.quartos.toString(),
      suites: imovel.suites.toString(),
      vagas: imovel.vagas.toString(),
      valorAvaliacao: imovel.valorAvaliacao?.toString() || '',
      valorVenda: imovel.valorVenda.toString(),
      comissaoPercentual: imovel.comissaoPercentual.toString(),
      documentacao: imovel.documentacao,
      nomeProprietario: imovel.nomeProprietario || '',
      telefoneProprietario: imovel.telefoneProprietario || '',
      emailProprietario: imovel.emailProprietario || '',
      descricao: imovel.descricao || '',
    })
    setEditingId(imovel.id)
    setShowModal(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const filteredImoveis = imoveis.filter(imovel =>
    imovel.titulo.toLowerCase().includes(search.toLowerCase()) ||
    imovel.endereco?.toLowerCase().includes(search.toLowerCase()) ||
    imovel.bairro?.toLowerCase().includes(search.toLowerCase()) ||
    imovel.nomeProprietario?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Imóveis Usados</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {imoveis.length} imóveis de terceiros cadastrados
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Imóvel Usado
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por título, endereço, bairro ou proprietário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          options={[
            { value: '', label: 'Todos os tipos' },
            { value: 'APARTAMENTO', label: 'Apartamento' },
            { value: 'CASA', label: 'Casa' },
            { value: 'TERRENO', label: 'Terreno' },
            { value: 'SALA_COMERCIAL', label: 'Sala Comercial' },
            { value: 'COBERTURA', label: 'Cobertura' },
            { value: 'LOFT', label: 'Loft' },
          ]}
          className="w-48"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filteredImoveis.length === 0 ? (
        <Card className="text-center py-12">
          <Home className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Nenhum imóvel usado encontrado
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Cadastre imóveis de terceiros para gerenciar sua carteira
          </p>
          <Button onClick={() => { resetForm(); setShowModal(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Imóvel Usado
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredImoveis.map((imovel) => (
            <Card 
              key={imovel.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEdit(imovel)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-orange-500" />
                  <Badge variant="warning">{tipoLabels[imovel.tipoImovel]}</Badge>
                </div>
                <Badge variant={docColors[imovel.documentacao]}>
                  {docLabels[imovel.documentacao]}
                </Badge>
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {imovel.titulo}
              </h3>
              
              {(imovel.bairro || imovel.cidade) && (
                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{[imovel.bairro, imovel.cidade].filter(Boolean).join(', ')}</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                {imovel.areaUtil && <span>{imovel.areaUtil}m²</span>}
                <span>{imovel.quartos}q</span>
                <span>{imovel.suites}s</span>
                <span>{imovel.vagas}v</span>
              </div>

              {imovel.nomeProprietario && (
                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                  <User className="w-4 h-4" />
                  <span>{imovel.nomeProprietario}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatCurrency(imovel.valorVenda)}
                    </p>
                    {imovel.valorAvaliacao && (
                      <p className="text-xs text-slate-500">
                        Avaliação: {formatCurrency(imovel.valorAvaliacao)}
                      </p>
                    )}
                  </div>
                  <Badge variant="success">{imovel.comissaoPercentual}%</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); resetForm() }} 
        title={editingId ? 'Editar Imóvel Usado' : 'Novo Imóvel Usado'} 
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Imóvel"
              value={formData.tipoImovel}
              onChange={(e) => setFormData({ ...formData, tipoImovel: e.target.value as TipoImovelUsado })}
              options={[
                { value: 'APARTAMENTO', label: 'Apartamento' },
                { value: 'CASA', label: 'Casa' },
                { value: 'TERRENO', label: 'Terreno' },
                { value: 'SALA_COMERCIAL', label: 'Sala Comercial' },
                { value: 'COBERTURA', label: 'Cobertura' },
                { value: 'LOFT', label: 'Loft' },
              ]}
            />
            <Select
              label="Documentação"
              value={formData.documentacao}
              onChange={(e) => setFormData({ ...formData, documentacao: e.target.value as Documentacao })}
              options={[
                { value: 'ESCRITURADO', label: 'Escriturado' },
                { value: 'FINANCIADO', label: 'Financiado' },
                { value: 'INVENTARIO', label: 'Inventário' },
                { value: 'IRREGULAR', label: 'Irregular' },
              ]}
            />
          </div>

          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ex: Apartamento 3 quartos no Jardins"
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Área Útil (m²)"
              type="number"
              step="0.01"
              value={formData.areaUtil}
              onChange={(e) => setFormData({ ...formData, areaUtil: e.target.value })}
            />
            <Input
              label="Área Total (m²)"
              type="number"
              step="0.01"
              value={formData.areaTotal}
              onChange={(e) => setFormData({ ...formData, areaTotal: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Quartos"
              type="number"
              value={formData.quartos}
              onChange={(e) => setFormData({ ...formData, quartos: e.target.value })}
              min="0"
            />
            <Input
              label="Suítes"
              type="number"
              value={formData.suites}
              onChange={(e) => setFormData({ ...formData, suites: e.target.value })}
              min="0"
            />
            <Input
              label="Vagas"
              type="number"
              value={formData.vagas}
              onChange={(e) => setFormData({ ...formData, vagas: e.target.value })}
              min="0"
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4" />
              Dados do Proprietário
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome"
                value={formData.nomeProprietario}
                onChange={(e) => setFormData({ ...formData, nomeProprietario: e.target.value })}
              />
              <Input
                label="Telefone"
                value={formData.telefoneProprietario}
                onChange={(e) => setFormData({ ...formData, telefoneProprietario: e.target.value })}
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.emailProprietario}
              onChange={(e) => setFormData({ ...formData, emailProprietario: e.target.value })}
            />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
            <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Valores
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Valor Avaliação (R$)"
                type="number"
                value={formData.valorAvaliacao}
                onChange={(e) => setFormData({ ...formData, valorAvaliacao: e.target.value })}
              />
              <Input
                label="Valor Venda (R$)"
                type="number"
                value={formData.valorVenda}
                onChange={(e) => setFormData({ ...formData, valorVenda: e.target.value })}
                required
              />
              <Input
                label="Comissão (%)"
                type="number"
                step="0.1"
                value={formData.comissaoPercentual}
                onChange={(e) => setFormData({ ...formData, comissaoPercentual: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm() }}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
