import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useImoveis } from '../hooks/useImoveis'
import { useNegociacoes } from '../hooks/useNegociacoes'
import { ImovelCard } from '../components/imoveis/ImovelCard'
import { ImovelForm } from '../components/imoveis/ImovelForm'
import type { Imovel } from '../types'

export function Imoveis() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { imoveis, loading, error, createImovel, updateImovel, deleteImovel } = useImoveis()
  const { createNegociacao } = useNegociacoes()
  const [showForm, setShowForm] = useState(false)
  const [editingImovel, setEditingImovel] = useState<Imovel | undefined>()

  useEffect(() => {
    if (searchParams.get('novo') === 'true') {
      setShowForm(true)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('TODOS')
  const [filterStatus, setFilterStatus] = useState<string>('TODOS')

  const handleSave = async (imovelData: any, fotos: File[]) => {
    if (editingImovel) {
      return await updateImovel(editingImovel.id, imovelData, fotos)
    } else {
      return await createImovel(imovelData, fotos)
    }
  }

  const handleEdit = (imovel: Imovel) => {
    setEditingImovel(imovel)
    setShowForm(true)
  }

  const handleDelete = async (imovelId: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      await deleteImovel(imovelId)
    }
  }

  const handleCreateDeal = async (imovel: Imovel) => {
    const leadNome = prompt('Digite o nome do lead para esta negociação:')
    if (!leadNome) return

    // Por enquanto, vamos criar uma negociação sem lead vinculado
    // O ideal seria ter um modal para selecionar/criar o lead
    const result = await createNegociacao('', imovel.id, imovel.valor)
    
    if (result.success) {
      alert('Negociação criada! Acesse o Pipeline para acompanhar.')
    } else {
      alert(`Erro ao criar negociação: ${result.error}`)
    }
  }

  const handleNewImovel = () => {
    setEditingImovel(undefined)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingImovel(undefined)
  }

  // Filtros
  const filteredImoveis = imoveis.filter(imovel => {
    const matchesSearch = 
      imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.endereco?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === 'TODOS' || imovel.tipo === filterTipo
    const matchesStatus = filterStatus === 'TODOS' || imovel.status === filterStatus

    return matchesSearch && matchesTipo && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando imóveis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
        <p className="font-semibold">Erro ao carregar imóveis</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Imóveis</h1>
          <p className="text-gray-600 mt-1">
            {filteredImoveis.length} {filteredImoveis.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          </p>
        </div>
        <button
          onClick={handleNewImovel}
          className="gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <i className="fas fa-plus mr-2"></i>
          Novo Imóvel
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar por título, cidade ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="CASA">Casa</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="RURAL">Rural</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="VENDIDO">Vendido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Imóveis */}
      {filteredImoveis.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <i className="fas fa-building text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {imoveis.length === 0 ? 'Nenhum imóvel cadastrado' : 'Nenhum imóvel encontrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {imoveis.length === 0
              ? 'Comece cadastrando seu primeiro imóvel para gerenciar seu portfólio.'
              : 'Tente ajustar os filtros de busca.'}
          </p>
          {imoveis.length === 0 && (
            <button
              onClick={handleNewImovel}
              className="gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              Cadastrar Primeiro Imóvel
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImoveis.map(imovel => (
            <ImovelCard
              key={imovel.id}
              imovel={imovel}
              onEdit={() => handleEdit(imovel)}
              onDelete={() => handleDelete(imovel.id)}
              onCreateDeal={() => handleCreateDeal(imovel)}
            />
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      {showForm && (
        <ImovelForm
          imovel={editingImovel}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
