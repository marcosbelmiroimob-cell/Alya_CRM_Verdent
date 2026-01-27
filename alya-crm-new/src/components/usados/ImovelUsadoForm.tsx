import { useState } from 'react'
import type { 
  ImovelUsado, 
  TipoImovelUsado, 
  EstadoImovelUsado, 
  PosicaoSolar,
  TipoVaga
} from '../../types'

interface ImovelUsadoFormProps {
  imovel?: ImovelUsado
  onSave: (data: any, fotos?: File[]) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

export function ImovelUsadoForm({ imovel, onSave, onClose }: ImovelUsadoFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fotos, setFotos] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState<'basico' | 'detalhes' | 'interno'>('basico')

  const [formData, setFormData] = useState({
    titulo: imovel?.titulo || '',
    tipo: imovel?.tipo || 'APARTAMENTO' as TipoImovelUsado,
    valor_venda: imovel?.valor_venda?.toString() || '',
    condominio: imovel?.condominio?.toString() || '',
    iptu: imovel?.iptu?.toString() || '',
    area_m2: imovel?.area_m2?.toString() || '',
    andar: imovel?.andar?.toString() || '',
    posicao_solar: imovel?.posicao_solar || '' as PosicaoSolar | '',
    dormitorios: imovel?.dormitorios?.toString() || '0',
    suites: imovel?.suites?.toString() || '0',
    banheiros: imovel?.banheiros?.toString() || '0',
    vagas: imovel?.vagas?.toString() || '0',
    tipo_vaga: imovel?.tipo_vaga || '' as TipoVaga | '',
    estado: imovel?.estado || 'ORIGINAL' as EstadoImovelUsado,
    motivo_venda: imovel?.motivo_venda || '',
    endereco: imovel?.endereco || '',
    bairro: imovel?.bairro || '',
    cidade: imovel?.cidade || '',
    estado_uf: imovel?.estado_uf || '',
    cep: imovel?.cep || '',
    descricao: imovel?.descricao || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = {
      ...formData,
      valor_venda: parseFloat(formData.valor_venda) || 0,
      condominio: parseFloat(formData.condominio) || null,
      iptu: parseFloat(formData.iptu) || null,
      area_m2: parseFloat(formData.area_m2) || 0,
      andar: parseInt(formData.andar) || null,
      posicao_solar: formData.posicao_solar || null,
      dormitorios: parseInt(formData.dormitorios) || 0,
      suites: parseInt(formData.suites) || 0,
      banheiros: parseInt(formData.banheiros) || 0,
      vagas: parseInt(formData.vagas) || 0,
      tipo_vaga: formData.tipo_vaga || null,
    }

    const result = await onSave(data, fotos.length > 0 ? fotos : undefined)

    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Erro ao salvar imóvel')
    }

    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(Array.from(e.target.files))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {imovel ? 'Editar Imóvel Usado' : 'Novo Imóvel Usado'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('basico')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'basico'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-info-circle mr-2"></i>
              Dados Básicos
            </button>
            <button
              onClick={() => setActiveTab('detalhes')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'detalhes'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-home mr-2"></i>
              Características
            </button>
            <button
              onClick={() => setActiveTab('interno')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'interno'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-lock mr-2"></i>
              Informações Internas
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          {activeTab === 'basico' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Anúncio *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Porteira fechada no Mansão Phileto Sobrinho"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoImovelUsado })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="CASA">Casa</option>
                    <option value="COBERTURA">Cobertura</option>
                    <option value="TERRENO">Terreno</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="RURAL">Rural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor de Venda *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                    <input
                      type="number"
                      value={formData.valor_venda}
                      onChange={(e) => setFormData({ ...formData, valor_venda: e.target.value })}
                      placeholder="850.000"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metragem (m²) *
                  </label>
                  <input
                    type="number"
                    value={formData.area_m2}
                    onChange={(e) => setFormData({ ...formData, area_m2: e.target.value })}
                    placeholder="120"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condomínio (mensal)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                    <input
                      type="number"
                      value={formData.condominio}
                      onChange={(e) => setFormData({ ...formData, condominio: e.target.value })}
                      placeholder="1.200"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IPTU (anual)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                    <input
                      type="number"
                      value={formData.iptu}
                      onChange={(e) => setFormData({ ...formData, iptu: e.target.value })}
                      placeholder="3.600"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Localização</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      placeholder="Rua, número"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <input
                      type="text"
                      value={formData.estado_uf}
                      onChange={(e) => setFormData({ ...formData, estado_uf: e.target.value })}
                      maxLength={2}
                      placeholder="BA"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="00000-000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detalhes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dormitórios</label>
                  <input
                    type="number"
                    value={formData.dormitorios}
                    onChange={(e) => setFormData({ ...formData, dormitorios: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suítes</label>
                  <input
                    type="number"
                    value={formData.suites}
                    onChange={(e) => setFormData({ ...formData, suites: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
                  <input
                    type="number"
                    value={formData.banheiros}
                    onChange={(e) => setFormData({ ...formData, banheiros: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
                  <input
                    type="number"
                    value={formData.vagas}
                    onChange={(e) => setFormData({ ...formData, vagas: e.target.value })}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Andar</label>
                  <input
                    type="number"
                    value={formData.andar}
                    onChange={(e) => setFormData({ ...formData, andar: e.target.value })}
                    placeholder="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posição Solar</label>
                  <select
                    value={formData.posicao_solar}
                    onChange={(e) => setFormData({ ...formData, posicao_solar: e.target.value as PosicaoSolar })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="NASCENTE_TOTAL">Nascente Total</option>
                    <option value="NASCENTE_NORTE">Nascente/Norte</option>
                    <option value="NASCENTE_SUL">Nascente/Sul</option>
                    <option value="POENTE">Poente</option>
                    <option value="NORTE">Norte</option>
                    <option value="SUL">Sul</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vaga</label>
                  <select
                    value={formData.tipo_vaga}
                    onChange={(e) => setFormData({ ...formData, tipo_vaga: e.target.value as TipoVaga })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="SOLTA">Solta</option>
                    <option value="PRESA">Presa</option>
                    <option value="COBERTA">Coberta</option>
                    <option value="DESCOBERTA">Descoberta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado do Imóvel *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'ORIGINAL', label: 'Original', icon: 'house', desc: 'Nunca reformado' },
                    { value: 'REFORMADO', label: 'Reformado', icon: 'paint-roller', desc: 'Com reformas' },
                    { value: 'SEMIMOBILIADO', label: 'Semimobiliado', icon: 'couch', desc: 'Alguns móveis' },
                    { value: 'PORTEIRA_FECHADA', label: 'Porteira Fechada', icon: 'door-open', desc: 'Tudo incluso' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, estado: option.value as EstadoImovelUsado })}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${formData.estado === option.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <i className={`fas fa-${option.icon} text-xl mb-2 ${
                        formData.estado === option.value ? 'text-orange-600' : 'text-gray-400'
                      }`}></i>
                      <p className={`font-medium text-sm ${
                        formData.estado === option.value ? 'text-orange-700' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fotos do Imóvel</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fotos-input"
                  />
                  <label htmlFor="fotos-input" className="cursor-pointer">
                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                    <p className="text-gray-600">Clique para selecionar ou arraste as fotos</p>
                    <p className="text-sm text-gray-400 mt-1">JPG, PNG ou WEBP até 10MB</p>
                  </label>
                </div>
                {fotos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {fotos.map((foto, idx) => (
                      <div key={idx} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                        <i className="fas fa-image mr-1"></i>
                        {foto.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                  placeholder="Descreva o imóvel, pontos fortes, diferenciais..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'interno' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-lock text-yellow-600 mt-0.5"></i>
                  <div>
                    <p className="font-medium text-yellow-800">Informações Confidenciais</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Estas informações são apenas para uso interno e não serão exibidas para clientes.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo da Venda
                </label>
                <textarea
                  value={formData.motivo_venda}
                  onChange={(e) => setFormData({ ...formData, motivo_venda: e.target.value })}
                  rows={3}
                  placeholder="Ex: Mudança de cidade, upgrade para imóvel maior, divórcio, herança..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Informação valiosa para negociação. Entender a motivação do vendedor ajuda a fechar melhores acordos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                    Dicas de Negociação
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "Mudança de cidade" = urgência, flexibilidade no preço</li>
                    <li>• "Upgrade" = vendedor em posição confortável</li>
                    <li>• "Divórcio" = pode haver urgência e emoção</li>
                    <li>• "Herança" = múltiplos decisores, processo mais lento</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    <i className="fas fa-clock text-blue-500 mr-2"></i>
                    Histórico
                  </h4>
                  <p className="text-sm text-gray-600">
                    {imovel ? (
                      <>
                        Cadastrado em {new Date(imovel.criado_em).toLocaleDateString('pt-BR')}
                        <br />
                        Última atualização: {new Date(imovel.atualizado_em).toLocaleDateString('pt-BR')}
                      </>
                    ) : (
                      'Novo cadastro'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {imovel ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
