import { useState, useEffect } from 'react'
import { 
  X, Phone, Mail, Building2, MessageCircle, 
  Sparkles, Plus, Check, Clock, AlertCircle, TrendingUp
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { Negociacao, Atividade, Imovel } from '../../types'
import { negociacaoService, imovelService, iaService } from '../../services/api'

interface NegociacaoDetailModalProps {
  negociacaoId: number
  isOpen: boolean
  onClose: () => void
  onOpenAlya: (negociacaoId: number) => void
  onUpdate: () => void
}

const TIPOS_ATIVIDADE = [
  { value: 'LIGACAO', label: 'Ligacao' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'VISITA', label: 'Visita' },
  { value: 'REUNIAO', label: 'Reuniao' },
  { value: 'PROPOSTA', label: 'Proposta' },
  { value: 'OUTRO', label: 'Outro' },
]

export function NegociacaoDetailModal({ 
  negociacaoId, 
  isOpen, 
  onClose, 
  onOpenAlya,
  onUpdate 
}: NegociacaoDetailModalProps) {
  const [negociacao, setNegociacao] = useState<Negociacao | null>(null)
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'atividades' | 'historico'>('info')
  const [showNovaAtividade, setShowNovaAtividade] = useState(false)
  const [novaAtividade, setNovaAtividade] = useState({ tipo: 'LIGACAO', descricao: '', dataAtividade: '' })
  const [qualificando, setQualificando] = useState(false)

  useEffect(() => {
    if (isOpen && negociacaoId) {
      loadData()
    }
  }, [isOpen, negociacaoId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [negRes, imoveisRes] = await Promise.all([
        negociacaoService.buscar(negociacaoId),
        imovelService.listar({ ativo: true }),
      ])
      setNegociacao(negRes.data.negociacao)
      setImoveis(imoveisRes.data.imoveis)
    } catch (error) {
      console.error('Erro ao carregar negociacao:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateImovel = async (imovelId: string) => {
    if (!negociacao) return
    try {
      await negociacaoService.atualizar(negociacaoId, {
        imovelId: imovelId ? parseInt(imovelId) : null,
      })
      loadData()
      onUpdate()
    } catch (error) {
      console.error('Erro ao atualizar imovel:', error)
    }
  }

  const handleQualificarLead = async () => {
    if (!negociacao?.lead) return
    setQualificando(true)
    try {
      const result = await iaService.qualificar(negociacao.lead.id)
      loadData()
      alert(`Lead qualificado!\n\nScore: ${result.data.qualificacao.score}/100\nNivel: ${result.data.qualificacao.nivel}\n\n${result.data.qualificacao.analise}`)
    } catch (error) {
      console.error('Erro ao qualificar:', error)
    } finally {
      setQualificando(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getScoreColor = (score: number) => {
    if (score >= 76) return 'text-green-500 bg-green-100'
    if (score >= 51) return 'text-yellow-600 bg-yellow-100'
    if (score >= 26) return 'text-blue-500 bg-blue-100'
    return 'text-slate-500 bg-slate-100'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-xl shadow-xl animate-fade-in max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Detalhes da Negociacao
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : negociacao ? (
            <>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${getScoreColor(negociacao.lead?.scoreQualificacao || 0)}`}>
                      {negociacao.lead?.scoreQualificacao || 0}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {negociacao.lead?.nome}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        {negociacao.lead?.telefone && (
                          <a href={`tel:${negociacao.lead.telefone}`} className="flex items-center gap-1 hover:text-primary-600">
                            <Phone className="w-4 h-4" />
                            {negociacao.lead.telefone}
                          </a>
                        )}
                        {negociacao.lead?.email && (
                          <a href={`mailto:${negociacao.lead.email}`} className="flex items-center gap-1 hover:text-primary-600">
                            <Mail className="w-4 h-4" />
                            {negociacao.lead.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleQualificarLead}
                      loading={qualificando}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Qualificar
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => { onClose(); onOpenAlya(negociacaoId); }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Alya
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-slate-200 dark:border-slate-700">
                {(['info', 'atividades', 'historico'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {tab === 'info' && 'Informacoes'}
                    {tab === 'atividades' && `Atividades (${negociacao.atividades?.length || 0})`}
                    {tab === 'historico' && 'Historico IA'}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Imovel Vinculado
                      </label>
                      <Select
                        value={negociacao.imovelId?.toString() || ''}
                        onChange={(e) => handleUpdateImovel(e.target.value)}
                        options={[
                          { value: '', label: 'Nenhum imovel selecionado' },
                          ...imoveis.map((i) => ({
                            value: i.id.toString(),
                            label: `${i.titulo} - ${formatCurrency(i.valor)}`,
                          })),
                        ]}
                      />
                    </div>

                    {negociacao.imovel && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-5 h-5 text-primary-500" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {negociacao.imovel.titulo}
                          </span>
                          <Badge variant={negociacao.imovel.tipoNegocio === 'LANCAMENTO' ? 'info' : 'warning'}>
                            {negociacao.imovel.tipoNegocio}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-slate-500">Valor</p>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(negociacao.imovel.valor)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Comissao Estimada</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(negociacao.imovel.valor * (negociacao.imovel.comissaoPercentual / 100))}
                              <span className="text-xs text-slate-400 ml-1">
                                ({negociacao.imovel.comissaoPercentual}%)
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Observacoes
                      </label>
                      <textarea
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        rows={3}
                        value={negociacao.observacoes || ''}
                        placeholder="Anotacoes sobre a negociacao..."
                        readOnly
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Etapa Atual
                        </label>
                        <Badge variant="purple" size="md">
                          {negociacao.etapaKanban.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Criada em
                        </label>
                        <p className="text-slate-600 dark:text-slate-400">
                          {new Date(negociacao.criadoEm).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'atividades' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-500">Registre todas as interacoes com o cliente</p>
                      <Button size="sm" onClick={() => setShowNovaAtividade(!showNovaAtividade)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Nova Atividade
                      </Button>
                    </div>

                    {showNovaAtividade && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Select
                            label="Tipo"
                            value={novaAtividade.tipo}
                            onChange={(e) => setNovaAtividade({ ...novaAtividade, tipo: e.target.value })}
                            options={TIPOS_ATIVIDADE}
                          />
                          <Input
                            label="Data"
                            type="datetime-local"
                            value={novaAtividade.dataAtividade}
                            onChange={(e) => setNovaAtividade({ ...novaAtividade, dataAtividade: e.target.value })}
                          />
                        </div>
                        <Input
                          label="Descricao"
                          value={novaAtividade.descricao}
                          onChange={(e) => setNovaAtividade({ ...novaAtividade, descricao: e.target.value })}
                          placeholder="O que aconteceu nessa interacao?"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowNovaAtividade(false)}>
                            Cancelar
                          </Button>
                          <Button size="sm">Salvar</Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {negociacao.atividades && negociacao.atividades.length > 0 ? (
                        negociacao.atividades.map((atividade: Atividade) => (
                          <div key={atividade.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className={`p-2 rounded-full ${atividade.concluida ? 'bg-green-100' : 'bg-slate-100'}`}>
                              {atividade.concluida ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge>{atividade.tipo}</Badge>
                                <span className="text-xs text-slate-400">
                                  {new Date(atividade.dataAtividade).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{atividade.descricao}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma atividade registrada</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'historico' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500">Historico de interacoes com a Alya</p>
                    <div className="text-center py-8 text-slate-400">
                      <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Clique em "Alya" para iniciar uma conversa</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    if (negociacao.lead?.telefone) {
                      window.open(`https://wa.me/55${negociacao.lead.telefone.replace(/\D/g, '')}`, '_blank')
                    }
                  }}
                  disabled={!negociacao.lead?.telefone}
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">Negociacao nao encontrada</div>
          )}
        </div>
      </div>
    </div>
  )
}
