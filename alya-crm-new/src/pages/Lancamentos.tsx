import { useState } from 'react'
import { useLancamentos } from '../hooks/useLancamentos'
import { EmpreendimentoCard } from '../components/lancamentos/EmpreendimentoCard'
import { EmpreendimentoForm } from '../components/lancamentos/EmpreendimentoForm'
import { EmpreendimentoDetail } from '../components/lancamentos/EmpreendimentoDetail'
import type { Empreendimento } from '../types'

export function Lancamentos() {
  const { 
    empreendimentos, 
    loading, 
    error, 
    createEmpreendimento, 
    updateEmpreendimento, 
    deleteEmpreendimento,
    createTipologia,
    updateTipologia,
    deleteTipologia,
    createUnidade,
    createUnidadesBulk,
    updateUnidade,
    deleteUnidade
  } = useLancamentos()
  
  const [showForm, setShowForm] = useState(false)
  const [editingEmpreendimento, setEditingEmpreendimento] = useState<Empreendimento | undefined>()
  const [selectedEmpreendimento, setSelectedEmpreendimento] = useState<Empreendimento | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('TODOS')

  const handleSave = async (data: any) => {
    if (editingEmpreendimento) {
      return await updateEmpreendimento(editingEmpreendimento.id, data)
    } else {
      return await createEmpreendimento(data)
    }
  }

  const handleEdit = (empreendimento: Empreendimento) => {
    setEditingEmpreendimento(empreendimento)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este empreendimento?')) {
      await deleteEmpreendimento(id)
    }
  }

  const handleView = (empreendimento: Empreendimento) => {
    setSelectedEmpreendimento(empreendimento)
  }

  const handleNewEmpreendimento = () => {
    setEditingEmpreendimento(undefined)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEmpreendimento(undefined)
  }

  const handleCloseDetail = () => {
    setSelectedEmpreendimento(null)
  }

  const filteredEmpreendimentos = empreendimentos.filter(emp => {
    const matchesSearch = 
      emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.construtora.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.bairro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cidade?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'TODOS' || emp.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const totalUnidades = empreendimentos.reduce((acc, emp) => {
    return acc + (emp.tipologias?.reduce((tipAcc, tip) => tipAcc + (tip.unidades?.length || 0), 0) || 0)
  }, 0)

  const unidadesDisponiveis = empreendimentos.reduce((acc, emp) => {
    return acc + (emp.tipologias?.reduce((tipAcc, tip) => {
      return tipAcc + (tip.unidades?.filter(u => u.status === 'DISPONIVEL').length || 0)
    }, 0) || 0)
  }, 0)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando lançamentos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
        <p className="font-semibold">Erro ao carregar lançamentos</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lançamentos</h1>
          <p className="text-gray-600 mt-1">
            {empreendimentos.length} {empreendimentos.length === 1 ? 'empreendimento' : 'empreendimentos'}
            {' • '}{unidadesDisponiveis} de {totalUnidades} unidades disponíveis
          </p>
        </div>
        <button
          onClick={handleNewEmpreendimento}
          className="gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <i className="fas fa-plus mr-2"></i>
          Novo Empreendimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <i className="fas fa-building text-purple-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{empreendimentos.length}</p>
              <p className="text-sm text-gray-500">Empreendimentos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-layer-group text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {empreendimentos.reduce((acc, emp) => acc + (emp.tipologias?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Tipologias</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="fas fa-door-open text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unidadesDisponiveis}</p>
              <p className="text-sm text-gray-500">Disponíveis</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <i className="fas fa-key text-orange-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {empreendimentos.reduce((acc, emp) => {
                  return acc + (emp.tipologias?.reduce((tipAcc, tip) => {
                    return tipAcc + (tip.unidades?.filter(u => u.status === 'VENDIDA').length || 0)
                  }, 0) || 0)
                }, 0)}
              </p>
              <p className="text-sm text-gray-500">Vendidas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar por nome, construtora, bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="LANCAMENTO">Lançamento</option>
              <option value="EM_OBRAS">Em Obras</option>
              <option value="PRONTO">Pronto</option>
            </select>
          </div>
        </div>
      </div>

      {filteredEmpreendimentos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <i className="fas fa-city text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {empreendimentos.length === 0 ? 'Nenhum lançamento cadastrado' : 'Nenhum lançamento encontrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {empreendimentos.length === 0
              ? 'Comece cadastrando seu primeiro empreendimento para gerenciar o estoque.'
              : 'Tente ajustar os filtros de busca.'}
          </p>
          {empreendimentos.length === 0 && (
            <button
              onClick={handleNewEmpreendimento}
              className="gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <i className="fas fa-plus mr-2"></i>
              Cadastrar Primeiro Empreendimento
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmpreendimentos.map(empreendimento => (
            <EmpreendimentoCard
              key={empreendimento.id}
              empreendimento={empreendimento}
              onView={() => handleView(empreendimento)}
              onEdit={() => handleEdit(empreendimento)}
              onDelete={() => handleDelete(empreendimento.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <EmpreendimentoForm
          empreendimento={editingEmpreendimento}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}

      {selectedEmpreendimento && (
        <EmpreendimentoDetail
          empreendimento={selectedEmpreendimento}
          onClose={handleCloseDetail}
          onCreateTipologia={createTipologia}
          onUpdateTipologia={updateTipologia}
          onDeleteTipologia={deleteTipologia}
          onCreateUnidade={createUnidade}
          onCreateUnidadesBulk={createUnidadesBulk}
          onUpdateUnidade={updateUnidade}
          onDeleteUnidade={deleteUnidade}
        />
      )}
    </div>
  )
}
