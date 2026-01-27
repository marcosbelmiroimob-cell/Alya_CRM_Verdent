import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLeads } from '../hooks/useLeads'
import { useNegociacoes } from '../hooks/useNegociacoes'
import { LeadCard } from '../components/leads/LeadCard'
import { LeadForm } from '../components/leads/LeadForm'
import type { Lead } from '../types'

export function Leads() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { leads, loading, error, createLead, updateLead, deleteLead } = useLeads()
  const { createNegociacao } = useNegociacoes()
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | undefined>()

  useEffect(() => {
    if (searchParams.get('novo') === 'true') {
      setShowForm(true)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])
  const [searchTerm, setSearchTerm] = useState('')

  const handleSave = async (leadData: any) => {
    if (editingLead) {
      return await updateLead(editingLead.id, leadData)
    } else {
      return await createLead(leadData)
    }
  }

  const handleDelete = async (lead: Lead) => {
    if (confirm(`Tem certeza que deseja excluir ${lead.nome}?`)) {
      const result = await deleteLead(lead.id)
      if (!result.success) {
        alert(`Erro ao excluir: ${result.error}`)
      }
    }
  }

  const handleCreateDeal = async (lead: Lead) => {
    const result = await createNegociacao(lead.id)
    if (result.success) {
      alert('Negociação criada com sucesso! Veja no Pipeline.')
    } else {
      alert(`Erro ao criar negociação: ${result.error}`)
    }
  }

  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.telefone?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando leads...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i className="fas fa-exclamation-triangle text-red-600 text-3xl mb-3"></i>
        <p className="text-red-700 font-semibold">Erro ao carregar leads</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-gray-600 mt-1">
            {leads.length} {leads.length === 1 ? 'lead cadastrado' : 'leads cadastrados'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingLead(undefined)
            setShowForm(true)
          }}
          className="px-6 py-3 text-white gradient-primary rounded-lg hover:opacity-90 font-semibold"
        >
          <i className="fas fa-plus mr-2"></i>
          Novo Lead
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-3">
          <i className="fas fa-search text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={() => {
                setEditingLead(lead)
                setShowForm(true)
              }}
              onDelete={() => handleDelete(lead)}
              onCreateDeal={() => handleCreateDeal(lead)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead cadastrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Tente buscar por outro termo'
              : 'Comece criando seu primeiro lead para iniciar as negociações'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingLead(undefined)
                setShowForm(true)
              }}
              className="px-6 py-3 text-white gradient-primary rounded-lg hover:opacity-90 font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              Criar Primeiro Lead
            </button>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <LeadForm
          lead={editingLead}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditingLead(undefined)
          }}
        />
      )}
    </div>
  )
}
