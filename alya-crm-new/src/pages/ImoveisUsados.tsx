import { useState } from 'react'
import { useImoveisUsados } from '../hooks/useImoveisUsados'
import { ImovelUsadoCard } from '../components/usados/ImovelUsadoCard'
import { ImovelUsadoForm } from '../components/usados/ImovelUsadoForm'
import type { ImovelUsado } from '../types'

export function ImoveisUsados() {
  const { imoveis, loading, error, createImovel, updateImovel, deleteImovel, toggleDestaque } = useImoveisUsados()
  const [showForm, setShowForm] = useState(false)
  const [editingImovel, setEditingImovel] = useState<ImovelUsado | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('TODOS')
  const [filterStatus, setFilterStatus] = useState<string>('TODOS')
  const [filterEstado, setFilterEstado] = useState<string>('TODOS')

  const handleSave = async (data: any, fotos?: File[]) => {
    if (editingImovel) {
      return await updateImovel(editingImovel.id, data, fotos)
    } else {
      return await createImovel(data, fotos)
    }
  }

  const handleEdit = (imovel: ImovelUsado) => {
    setEditingImovel(imovel)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      await deleteImovel(id)
    }
  }

  const handleToggleDestaque = async (id: string, destaque: boolean) => {
    await toggleDestaque(id, !destaque)
  }

  const handleNewImovel = () => {
    setEditingImovel(undefined)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingImovel(undefined)
  }

  const filteredImoveis = imoveis.filter(imovel => {
    const matchesSearch = 
      imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.bairro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.endereco?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === 'TODOS' || imovel.tipo === filterTipo
    const matchesStatus = filterStatus === 'TODOS' || imovel.status === filterStatus
    const matchesEstado = filterEstado === 'TODOS' || imovel.estado === filterEstado

    return matchesSearch && matchesTipo && matchesStatus && matchesEstado
  })

  const valorTotal = filteredImoveis.reduce((acc, i) => acc + i.valor_venda, 0)
  const disponiveis = imoveis.filter(i => i.status === 'DISPONIVEL').length

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando imóveis usados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
        <p className="font-semibold">Erro ao carregar imóveis usados</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Imóveis Usados</h1>
          <p className="text-gray-600 mt-1">
            {filteredImoveis.length} {filteredImoveis.length === 1 ? 'imóvel' : 'imóveis'}
            {' • '}{disponiveis} disponíveis
          </p>
        </div>
        <button
          onClick={handleNewImovel}
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <i className="fas fa-plus mr-2"></i>
          Novo Imóvel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <i className="fas fa-home text-orange-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{imoveis.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{disponiveis}</p>
              <p className="text-sm text-gray-500">Disponíveis</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <i className="fas fa-star text-yellow-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{imoveis.filter(i => i.destaque).length}</p>
              <p className="text-sm text-gray-500">Destaques</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-dollar-sign text-blue-600"></i>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(valorTotal)}
              </p>
              <p className="text-sm text-gray-500">Em Carteira</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar por título, bairro, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="CASA">Casa</option>
              <option value="COBERTURA">Cobertura</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="VENDIDO">Vendido</option>
            </select>
          </div>

          <div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="TODOS">Todos os Estados</option>
              <option value="ORIGINAL">Original</option>
              <option value="REFORMADO">Reformado</option>
              <option value="SEMIMOBILIADO">Semimobiliado</option>
              <option value="PORTEIRA_FECHADA">Porteira Fechada</option>
            </select>
          </div>
        </div>
      </div>

      {filteredImoveis.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <i className="fas fa-home text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {imoveis.length === 0 ? 'Nenhum imóvel usado cadastrado' : 'Nenhum imóvel encontrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {imoveis.length === 0
              ? 'Comece cadastrando seu primeiro imóvel usado.'
              : 'Tente ajustar os filtros de busca.'}
          </p>
          {imoveis.length === 0 && (
            <button
              onClick={handleNewImovel}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              Cadastrar Primeiro Imóvel
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImoveis.map(imovel => (
            <ImovelUsadoCard
              key={imovel.id}
              imovel={imovel}
              onEdit={() => handleEdit(imovel)}
              onDelete={() => handleDelete(imovel.id)}
              onToggleDestaque={() => handleToggleDestaque(imovel.id, imovel.destaque)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ImovelUsadoForm
          imovel={editingImovel}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
