import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Lead, Imovel } from '../../types'
import { leadService, imovelService, negociacaoService } from '../../services/api'
import { useKanbanStore } from '../../stores/kanbanStore'

interface NovaNegociacaoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NovaNegociacaoModal({ isOpen, onClose }: NovaNegociacaoModalProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    leadId: '',
    imovelId: '',
    novoLead: false,
    novoLeadNome: '',
    novoLeadTelefone: '',
    novoLeadEmail: '',
  })

  const { addNegociacao } = useKanbanStore()

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setLoading(true)
    try {
      const [leadsRes, imoveisRes] = await Promise.all([
        leadService.listar(),
        imovelService.listar({ ativo: true }),
      ])
      setLeads(leadsRes.data.leads)
      setImoveis(imoveisRes.data.imoveis)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let leadId = formData.leadId ? parseInt(formData.leadId) : null

      if (formData.novoLead) {
        const leadRes = await leadService.criar({
          nome: formData.novoLeadNome,
          telefone: formData.novoLeadTelefone,
          email: formData.novoLeadEmail,
        })
        leadId = leadRes.data.lead.id
      }

      if (!leadId) {
        alert('Selecione ou crie um lead')
        setSaving(false)
        return
      }

      const negociacaoRes = await negociacaoService.criar({
        leadId,
        imovelId: formData.imovelId ? parseInt(formData.imovelId) : undefined,
      })

      addNegociacao(negociacaoRes.data.negociacao)
      onClose()
      setFormData({
        leadId: '',
        imovelId: '',
        novoLead: false,
        novoLeadNome: '',
        novoLeadTelefone: '',
        novoLeadEmail: '',
      })
    } catch (error) {
      console.error('Erro ao criar negociação:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Negociação" size="md">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!formData.novoLead}
                onChange={() => setFormData({ ...formData, novoLead: false })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Lead existente</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={formData.novoLead}
                onChange={() => setFormData({ ...formData, novoLead: true, leadId: '' })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Novo lead</span>
            </label>
          </div>

          {!formData.novoLead ? (
            <Select
              label="Selecionar Lead"
              value={formData.leadId}
              onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
              options={[
                { value: '', label: 'Selecione um lead...' },
                ...leads.map((lead) => ({
                  value: lead.id.toString(),
                  label: `${lead.nome}${lead.telefone ? ` - ${lead.telefone}` : ''}`,
                })),
              ]}
              required={!formData.novoLead}
            />
          ) : (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Input
                label="Nome do Lead"
                value={formData.novoLeadNome}
                onChange={(e) => setFormData({ ...formData, novoLeadNome: e.target.value })}
                required={formData.novoLead}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Telefone"
                  value={formData.novoLeadTelefone}
                  onChange={(e) => setFormData({ ...formData, novoLeadTelefone: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.novoLeadEmail}
                  onChange={(e) => setFormData({ ...formData, novoLeadEmail: e.target.value })}
                />
              </div>
            </div>
          )}

          <Select
            label="Vincular Imóvel (opcional)"
            value={formData.imovelId}
            onChange={(e) => setFormData({ ...formData, imovelId: e.target.value })}
            options={[
              { value: '', label: 'Nenhum imóvel selecionado' },
              ...imoveis.map((imovel) => ({
                value: imovel.id.toString(),
                label: `${imovel.titulo} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.valor)}`,
              })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Criar Negociação
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
