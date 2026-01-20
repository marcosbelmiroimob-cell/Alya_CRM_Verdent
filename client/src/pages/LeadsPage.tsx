import { useEffect, useState } from 'react'
import { Plus, Search, Phone, Mail, MoreVertical } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Lead } from '../types'
import { leadService } from '../services/api'

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '', origem: '', observacoes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      const response = await leadService.listar()
      setLeads(response.data.leads)
    } catch (error) {
      console.error('Erro ao carregar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await leadService.criar(formData)
      setShowModal(false)
      setFormData({ nome: '', telefone: '', email: '', origem: '', observacoes: '' })
      loadLeads()
    } catch (error) {
      console.error('Erro ao criar lead:', error)
    } finally {
      setSaving(false)
    }
  }

  const getScoreBadge = (score: number) => {
    if (score >= 76) return <Badge variant="success">Muito Quente</Badge>
    if (score >= 51) return <Badge variant="warning">Quente</Badge>
    if (score >= 26) return <Badge variant="info">Morno</Badge>
    return <Badge variant="default">Frio</Badge>
  }

  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(search.toLowerCase()) ||
    lead.telefone?.includes(search) ||
    lead.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{leads.length} leads cadastrados</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{lead.nome}</h3>
                  {lead.origem && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Origem: {lead.origem}</p>
                  )}
                </div>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {lead.telefone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4" />
                    <span>{lead.telefone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4" />
                    <span>{lead.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                {getScoreBadge(lead.scoreQualificacao)}
                <span className="text-xs text-slate-400">
                  {new Date(lead.criadoEm).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Lead">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Input
            label="Origem"
            placeholder="Ex: Instagram, Indicação, Portal..."
            value={formData.origem}
            onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Salvar Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
