import { useEffect, useState } from 'react'
import { Plus, Search, MapPin, Building2, Home } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Imovel } from '../types'
import { imovelService } from '../services/api'

export function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    tipoNegocio: 'LANCAMENTO' as const,
    valor: '',
    comissaoPercentual: '',
    endereco: '',
    cidade: '',
    bairro: '',
    construtora: '',
    descricao: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadImoveis()
  }, [tipoFiltro])

  const loadImoveis = async () => {
    try {
      const params = tipoFiltro ? { tipo: tipoFiltro } : undefined
      const response = await imovelService.listar(params)
      setImoveis(response.data.imoveis)
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await imovelService.criar({
        ...formData,
        valor: parseFloat(formData.valor),
        comissaoPercentual: parseFloat(formData.comissaoPercentual),
      })
      setShowModal(false)
      setFormData({
        titulo: '',
        tipoNegocio: 'LANCAMENTO',
        valor: '',
        comissaoPercentual: '',
        endereco: '',
        cidade: '',
        bairro: '',
        construtora: '',
        descricao: '',
      })
      loadImoveis()
    } catch (error) {
      console.error('Erro ao criar imóvel:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const filteredImoveis = imoveis.filter(imovel =>
    imovel.titulo.toLowerCase().includes(search.toLowerCase()) ||
    imovel.endereco?.toLowerCase().includes(search.toLowerCase()) ||
    imovel.bairro?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Imóveis</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{imoveis.length} imóveis cadastrados</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Imóvel
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por título, endereço ou bairro..."
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
            { value: 'LANCAMENTO', label: 'Lançamentos' },
            { value: 'TERCEIROS', label: 'Terceiros' },
          ]}
          className="w-48"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredImoveis.map((imovel) => (
            <Card key={imovel.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {imovel.tipoNegocio === 'LANCAMENTO' ? (
                    <Building2 className="w-5 h-5 text-primary-500" />
                  ) : (
                    <Home className="w-5 h-5 text-orange-500" />
                  )}
                  <Badge variant={imovel.tipoNegocio === 'LANCAMENTO' ? 'info' : 'warning'}>
                    {imovel.tipoNegocio === 'LANCAMENTO' ? 'Lançamento' : 'Terceiros'}
                  </Badge>
                </div>
                <Badge variant="success">{imovel.comissaoPercentual}%</Badge>
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{imovel.titulo}</h3>
              
              {(imovel.bairro || imovel.cidade) && (
                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{[imovel.bairro, imovel.cidade].filter(Boolean).join(', ')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(imovel.valor)}
                </p>
                <p className="text-sm text-slate-500">
                  Comissão: {formatCurrency(imovel.valor * (imovel.comissaoPercentual / 100))}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Imóvel" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ex: Apartamento 3 quartos no Jardins"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Negócio"
              value={formData.tipoNegocio}
              onChange={(e) => setFormData({ ...formData, tipoNegocio: e.target.value as any })}
              options={[
                { value: 'LANCAMENTO', label: 'Lançamento' },
                { value: 'TERCEIROS', label: 'Terceiros' },
              ]}
            />
            <Input
              label="Construtora / Proprietário"
              value={formData.construtora}
              onChange={(e) => setFormData({ ...formData, construtora: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="number"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="500000"
              required
            />
            <Input
              label="Comissão (%)"
              type="number"
              step="0.1"
              value={formData.comissaoPercentual}
              onChange={(e) => setFormData({ ...formData, comissaoPercentual: e.target.value })}
              placeholder="6"
              required
            />
          </div>

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
              Salvar Imóvel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
