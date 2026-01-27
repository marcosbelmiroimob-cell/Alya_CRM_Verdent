import { useState } from 'react'
import type { 
  Empreendimento, 
  Tipologia, 
  Unidade,
  TipologiaInsert,
  UnidadeInsert,
  StatusUnidade
} from '../../types'

interface EmpreendimentoDetailProps {
  empreendimento: Empreendimento
  onClose: () => void
  onCreateTipologia: (data: TipologiaInsert) => Promise<{ success: boolean; error?: string }>
  onUpdateTipologia: (id: string, data: Partial<TipologiaInsert>) => Promise<{ success: boolean; error?: string }>
  onDeleteTipologia: (id: string) => Promise<{ success: boolean; error?: string }>
  onCreateUnidade: (data: UnidadeInsert) => Promise<{ success: boolean; error?: string }>
  onCreateUnidadesBulk: (unidades: UnidadeInsert[]) => Promise<{ success: boolean; error?: string }>
  onUpdateUnidade: (id: string, data: Partial<UnidadeInsert>) => Promise<{ success: boolean; error?: string }>
  onDeleteUnidade: (id: string) => Promise<{ success: boolean; error?: string }>
}

const statusConfig = {
  DISPONIVEL: { label: 'Disponível', color: 'bg-green-100 text-green-700 border-green-200' },
  RESERVADA: { label: 'Reservada', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  VENDIDA: { label: 'Vendida', color: 'bg-red-100 text-red-700 border-red-200' },
}

export function EmpreendimentoDetail({
  empreendimento,
  onClose,
  onCreateTipologia,
  onUpdateTipologia,
  onDeleteTipologia,
  onCreateUnidade,
  onCreateUnidadesBulk,
  onUpdateUnidade,
  onDeleteUnidade,
}: EmpreendimentoDetailProps) {
  const [selectedTipologia, setSelectedTipologia] = useState<Tipologia | null>(null)
  const [showTipologiaForm, setShowTipologiaForm] = useState(false)
  const [showUnidadeForm, setShowUnidadeForm] = useState(false)
  const [showBulkForm, setShowBulkForm] = useState(false)
  const [editingTipologia, setEditingTipologia] = useState<Tipologia | null>(null)

  const [tipologiaForm, setTipologiaForm] = useState({
    nome: '',
    area_privativa: '',
    dormitorios: '0',
    suites: '0',
    banheiros: '0',
    vagas: '0',
    unidades_finais: '',
    destaque: '',
  })

  const [unidadeForm, setUnidadeForm] = useState({
    numero: '',
    andar: '',
    valor_tabela: '',
    vagas_garagem: '0',
  })

  const [bulkForm, setBulkForm] = useState({
    andar_inicio: '',
    andar_fim: '',
    unidades_por_andar: '',
    valor_base: '',
    incremento_andar: '',
  })

  const resetTipologiaForm = () => {
    setTipologiaForm({
      nome: '',
      area_privativa: '',
      dormitorios: '0',
      suites: '0',
      banheiros: '0',
      vagas: '0',
      unidades_finais: '',
      destaque: '',
    })
    setEditingTipologia(null)
  }

  const handleCreateTipologia = async () => {
    const result = await onCreateTipologia({
      empreendimento_id: empreendimento.id,
      nome: tipologiaForm.nome,
      area_privativa: parseFloat(tipologiaForm.area_privativa) || 0,
      dormitorios: parseInt(tipologiaForm.dormitorios) || 0,
      suites: parseInt(tipologiaForm.suites) || 0,
      banheiros: parseInt(tipologiaForm.banheiros) || 0,
      vagas: parseInt(tipologiaForm.vagas) || 0,
      unidades_finais: tipologiaForm.unidades_finais || null,
      destaque: tipologiaForm.destaque || null,
    })

    if (result.success) {
      setShowTipologiaForm(false)
      resetTipologiaForm()
    }
  }

  const handleEditTipologia = (tipologia: Tipologia) => {
    setEditingTipologia(tipologia)
    setTipologiaForm({
      nome: tipologia.nome,
      area_privativa: tipologia.area_privativa.toString(),
      dormitorios: tipologia.dormitorios.toString(),
      suites: tipologia.suites.toString(),
      banheiros: tipologia.banheiros.toString(),
      vagas: tipologia.vagas.toString(),
      unidades_finais: tipologia.unidades_finais || '',
      destaque: tipologia.destaque || '',
    })
    setShowTipologiaForm(true)
  }

  const handleUpdateTipologia = async () => {
    if (!editingTipologia) return

    const result = await onUpdateTipologia(editingTipologia.id, {
      nome: tipologiaForm.nome,
      area_privativa: parseFloat(tipologiaForm.area_privativa) || 0,
      dormitorios: parseInt(tipologiaForm.dormitorios) || 0,
      suites: parseInt(tipologiaForm.suites) || 0,
      banheiros: parseInt(tipologiaForm.banheiros) || 0,
      vagas: parseInt(tipologiaForm.vagas) || 0,
      unidades_finais: tipologiaForm.unidades_finais || null,
      destaque: tipologiaForm.destaque || null,
    })

    if (result.success) {
      setShowTipologiaForm(false)
      resetTipologiaForm()
    }
  }

  const handleDeleteTipologia = async (id: string) => {
    if (confirm('Tem certeza? Todas as unidades desta tipologia serão excluídas.')) {
      await onDeleteTipologia(id)
      if (selectedTipologia?.id === id) {
        setSelectedTipologia(null)
      }
    }
  }

  const handleCreateUnidade = async () => {
    if (!selectedTipologia) return

    const result = await onCreateUnidade({
      tipologia_id: selectedTipologia.id,
      numero: unidadeForm.numero,
      andar: parseInt(unidadeForm.andar) || 0,
      valor_tabela: parseFloat(unidadeForm.valor_tabela) || 0,
      vagas_garagem: parseInt(unidadeForm.vagas_garagem) || 0,
    })

    if (result.success) {
      setShowUnidadeForm(false)
      setUnidadeForm({ numero: '', andar: '', valor_tabela: '', vagas_garagem: '0' })
    }
  }

  const handleBulkCreate = async () => {
    if (!selectedTipologia) return

    const andarInicio = parseInt(bulkForm.andar_inicio) || 1
    const andarFim = parseInt(bulkForm.andar_fim) || 1
    const unidadesPorAndar = parseInt(bulkForm.unidades_por_andar) || 1
    const valorBase = parseFloat(bulkForm.valor_base) || 0
    const incrementoAndar = parseFloat(bulkForm.incremento_andar) || 0

    const unidades: UnidadeInsert[] = []

    for (let andar = andarInicio; andar <= andarFim; andar++) {
      for (let i = 1; i <= unidadesPorAndar; i++) {
        const numero = `${andar}0${i}`
        const valor = valorBase + (andar - andarInicio) * incrementoAndar
        
        unidades.push({
          tipologia_id: selectedTipologia.id,
          numero,
          andar,
          valor_tabela: valor,
          vagas_garagem: selectedTipologia.vagas || 0,
        })
      }
    }

    const result = await onCreateUnidadesBulk(unidades)

    if (result.success) {
      setShowBulkForm(false)
      setBulkForm({ andar_inicio: '', andar_fim: '', unidades_por_andar: '', valor_base: '', incremento_andar: '' })
    }
  }

  const handleUpdateUnidadeStatus = async (unidade: Unidade, newStatus: StatusUnidade) => {
    await onUpdateUnidade(unidade.id, { status: newStatus })
  }

  const handleDeleteUnidade = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta unidade?')) {
      await onDeleteUnidade(id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{empreendimento.nome}</h2>
            <p className="text-white/80 text-sm">{empreendimento.construtora}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Tipologias</h3>
              <button
                onClick={() => { resetTipologiaForm(); setShowTipologiaForm(true); }}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Adicionar Tipologia"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {empreendimento.tipologias?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-layer-group text-3xl mb-2 opacity-50"></i>
                  <p className="text-sm">Nenhuma tipologia</p>
                  <button
                    onClick={() => setShowTipologiaForm(true)}
                    className="text-purple-600 text-sm hover:underline mt-2"
                  >
                    Adicionar primeira
                  </button>
                </div>
              ) : (
                empreendimento.tipologias?.map((tipologia) => {
                  const disponiveis = tipologia.unidades?.filter(u => u.status === 'DISPONIVEL').length || 0
                  const total = tipologia.unidades?.length || 0
                  
                  return (
                    <div
                      key={tipologia.id}
                      onClick={() => setSelectedTipologia(tipologia)}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all border
                        ${selectedTipologia?.id === tipologia.id
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{tipologia.nome}</h4>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditTipologia(tipologia); }}
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTipologia(tipologia.id); }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{tipologia.area_privativa}m²</span>
                        <span>•</span>
                        <span>{tipologia.dormitorios}D/{tipologia.suites}S</span>
                        <span>•</span>
                        <span className={disponiveis > 0 ? 'text-green-600' : 'text-red-600'}>
                          {disponiveis}/{total}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedTipologia ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedTipologia.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedTipologia.area_privativa}m² • {selectedTipologia.dormitorios} dorms • {selectedTipologia.suites} suítes • {selectedTipologia.vagas} vagas
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBulkForm(true)}
                      className="px-3 py-2 text-sm border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <i className="fas fa-table mr-1.5"></i>
                      Gerar em Lote
                    </button>
                    <button
                      onClick={() => setShowUnidadeForm(true)}
                      className="px-3 py-2 text-sm gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <i className="fas fa-plus mr-1.5"></i>
                      Nova Unidade
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {selectedTipologia.unidades?.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <i className="fas fa-door-open text-4xl mb-3 opacity-50"></i>
                      <p>Nenhuma unidade cadastrada</p>
                      <button
                        onClick={() => setShowBulkForm(true)}
                        className="text-purple-600 hover:underline mt-2"
                      >
                        Gerar unidades em lote
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 font-medium text-gray-600">Unidade</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-600">Andar</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-600">Valor</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-600">Vagas</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-600">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTipologia.unidades
                            ?.sort((a, b) => a.andar - b.andar || a.numero.localeCompare(b.numero))
                            .map((unidade) => {
                              const status = statusConfig[unidade.status]
                              return (
                                <tr key={unidade.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3 px-2 font-medium">{unidade.numero}</td>
                                  <td className="py-3 px-2">{unidade.andar}º</td>
                                  <td className="py-3 px-2">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unidade.valor_tabela)}
                                  </td>
                                  <td className="py-3 px-2">{unidade.vagas_garagem}</td>
                                  <td className="py-3 px-2">
                                    <select
                                      value={unidade.status}
                                      onChange={(e) => handleUpdateUnidadeStatus(unidade, e.target.value as StatusUnidade)}
                                      className={`
                                        text-xs px-2 py-1 rounded-full border cursor-pointer
                                        ${status.color}
                                      `}
                                    >
                                      <option value="DISPONIVEL">Disponível</option>
                                      <option value="RESERVADA">Reservada</option>
                                      <option value="VENDIDA">Vendida</option>
                                    </select>
                                  </td>
                                  <td className="py-3 px-2 text-right">
                                    <button
                                      onClick={() => handleDeleteUnidade(unidade.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                      <i className="fas fa-trash text-xs"></i>
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-arrow-left text-4xl mb-3 opacity-50"></i>
                  <p>Selecione uma tipologia para ver as unidades</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showTipologiaForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                {editingTipologia ? 'Editar Tipologia' : 'Nova Tipologia'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={tipologiaForm.nome}
                    onChange={(e) => setTipologiaForm({ ...tipologiaForm, nome: e.target.value })}
                    placeholder="Ex: Studio com Varanda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Área Privativa (m²) *</label>
                  <input
                    type="number"
                    value={tipologiaForm.area_privativa}
                    onChange={(e) => setTipologiaForm({ ...tipologiaForm, area_privativa: e.target.value })}
                    placeholder="45.50"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Dorms</label>
                    <input
                      type="number"
                      value={tipologiaForm.dormitorios}
                      onChange={(e) => setTipologiaForm({ ...tipologiaForm, dormitorios: e.target.value })}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Suítes</label>
                    <input
                      type="number"
                      value={tipologiaForm.suites}
                      onChange={(e) => setTipologiaForm({ ...tipologiaForm, suites: e.target.value })}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">WCs</label>
                    <input
                      type="number"
                      value={tipologiaForm.banheiros}
                      onChange={(e) => setTipologiaForm({ ...tipologiaForm, banheiros: e.target.value })}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vagas</label>
                    <input
                      type="number"
                      value={tipologiaForm.vagas}
                      onChange={(e) => setTipologiaForm({ ...tipologiaForm, vagas: e.target.value })}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidades/Finais</label>
                  <input
                    type="text"
                    value={tipologiaForm.unidades_finais}
                    onChange={(e) => setTipologiaForm({ ...tipologiaForm, unidades_finais: e.target.value })}
                    placeholder="Ex: Finais 01, 02, 05 e 06"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destaque da Planta</label>
                  <input
                    type="text"
                    value={tipologiaForm.destaque}
                    onChange={(e) => setTipologiaForm({ ...tipologiaForm, destaque: e.target.value })}
                    placeholder="Ex: Varanda gourmet integrada"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => { setShowTipologiaForm(false); resetTipologiaForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingTipologia ? handleUpdateTipologia : handleCreateTipologia}
                  className="flex-1 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  {editingTipologia ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showUnidadeForm && selectedTipologia && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Nova Unidade</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                    <input
                      type="text"
                      value={unidadeForm.numero}
                      onChange={(e) => setUnidadeForm({ ...unidadeForm, numero: e.target.value })}
                      placeholder="Ex: 1002"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Andar *</label>
                    <input
                      type="number"
                      value={unidadeForm.andar}
                      onChange={(e) => setUnidadeForm({ ...unidadeForm, andar: e.target.value })}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor de Tabela *</label>
                  <input
                    type="number"
                    value={unidadeForm.valor_tabela}
                    onChange={(e) => setUnidadeForm({ ...unidadeForm, valor_tabela: e.target.value })}
                    placeholder="850000"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vagas de Garagem</label>
                  <input
                    type="number"
                    value={unidadeForm.vagas_garagem}
                    onChange={(e) => setUnidadeForm({ ...unidadeForm, vagas_garagem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowUnidadeForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUnidade}
                  className="flex-1 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Criar Unidade
                </button>
              </div>
            </div>
          </div>
        )}

        {showBulkForm && selectedTipologia && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-60">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Gerar Unidades em Lote</h3>
              <p className="text-sm text-gray-500 mb-4">
                Tipologia: <strong>{selectedTipologia.nome}</strong>
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Andar Inicial *</label>
                    <input
                      type="number"
                      value={bulkForm.andar_inicio}
                      onChange={(e) => setBulkForm({ ...bulkForm, andar_inicio: e.target.value })}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Andar Final *</label>
                    <input
                      type="number"
                      value={bulkForm.andar_fim}
                      onChange={(e) => setBulkForm({ ...bulkForm, andar_fim: e.target.value })}
                      placeholder="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidades por Andar *</label>
                  <input
                    type="number"
                    value={bulkForm.unidades_por_andar}
                    onChange={(e) => setBulkForm({ ...bulkForm, unidades_por_andar: e.target.value })}
                    placeholder="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Base (1º andar) *</label>
                  <input
                    type="number"
                    value={bulkForm.valor_base}
                    onChange={(e) => setBulkForm({ ...bulkForm, valor_base: e.target.value })}
                    placeholder="500000"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incremento por Andar</label>
                  <input
                    type="number"
                    value={bulkForm.incremento_andar}
                    onChange={(e) => setBulkForm({ ...bulkForm, incremento_andar: e.target.value })}
                    placeholder="10000"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Valor adicional por andar acima do inicial</p>
                </div>

                {bulkForm.andar_inicio && bulkForm.andar_fim && bulkForm.unidades_por_andar && (
                  <div className="bg-purple-50 rounded-lg p-3 text-sm">
                    <p className="text-purple-700">
                      Serão criadas <strong>
                        {(parseInt(bulkForm.andar_fim) - parseInt(bulkForm.andar_inicio) + 1) * parseInt(bulkForm.unidades_por_andar)}
                      </strong> unidades
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowBulkForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBulkCreate}
                  className="flex-1 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  <i className="fas fa-magic mr-1.5"></i>
                  Gerar Unidades
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
