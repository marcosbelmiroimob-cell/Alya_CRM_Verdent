import { useState } from 'react'
import type { Empreendimento, StatusEmpreendimento, DiferenciaisEmpreendimento } from '../../types'

interface EmpreendimentoFormProps {
  empreendimento?: Empreendimento
  onSave: (data: any) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

const defaultDiferenciais: DiferenciaisEmpreendimento = {
  iptu_verde: false,
  coworking: false,
  lavanderia: false,
  academia: false,
  rooftop: false,
  piscina: false,
  churrasqueira: false,
  playground: false,
  salao_festas: false,
  portaria_24h: false,
  bicicletario: false,
  pet_place: false,
}

const diferenciaisLabels: Record<keyof DiferenciaisEmpreendimento, { label: string; icon: string }> = {
  iptu_verde: { label: 'IPTU Verde', icon: 'leaf' },
  coworking: { label: 'Coworking', icon: 'laptop' },
  lavanderia: { label: 'Lavanderia', icon: 'tshirt' },
  academia: { label: 'Academia', icon: 'dumbbell' },
  rooftop: { label: 'Rooftop', icon: 'umbrella-beach' },
  piscina: { label: 'Piscina', icon: 'swimming-pool' },
  churrasqueira: { label: 'Churrasqueira', icon: 'fire' },
  playground: { label: 'Playground', icon: 'child' },
  salao_festas: { label: 'Salão de Festas', icon: 'glass-cheers' },
  portaria_24h: { label: 'Portaria 24h', icon: 'shield-alt' },
  bicicletario: { label: 'Bicicletário', icon: 'bicycle' },
  pet_place: { label: 'Pet Place', icon: 'paw' },
}

export function EmpreendimentoForm({ empreendimento, onSave, onClose }: EmpreendimentoFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    nome: empreendimento?.nome || '',
    construtora: empreendimento?.construtora || '',
    status: empreendimento?.status || 'LANCAMENTO' as StatusEmpreendimento,
    previsao_entrega: empreendimento?.previsao_entrega || '',
    endereco: empreendimento?.endereco || '',
    bairro: empreendimento?.bairro || '',
    cidade: empreendimento?.cidade || '',
    estado: empreendimento?.estado || '',
    cep: empreendimento?.cep || '',
    descricao: empreendimento?.descricao || '',
    diferenciais: empreendimento?.diferenciais || defaultDiferenciais,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await onSave(formData)

      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Erro ao salvar empreendimento. Verifique se o banco de dados foi configurado corretamente.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Erro ao salvar:', err)
      setError(err instanceof Error ? err.message : 'Erro inesperado ao salvar. Verifique o console.')
      setLoading(false)
    }
  }

  const toggleDiferencial = (key: keyof DiferenciaisEmpreendimento) => {
    setFormData(prev => ({
      ...prev,
      diferenciais: {
        ...prev.diferenciais,
        [key]: !prev.diferenciais[key],
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {empreendimento ? 'Editar Empreendimento' : 'Novo Empreendimento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start gap-2">
                <i className="fas fa-exclamation-circle mt-0.5"></i>
                <div>
                  <p className="font-medium">Erro ao salvar</p>
                  <p className="text-red-600">{error}</p>
                  <p className="text-xs text-red-500 mt-1">
                    Dica: Execute o SQL 'supabase-lancamentos-usados.sql' no Supabase se as tabelas não existirem.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Empreendimento *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Biosphere Essence"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Construtora/Incorporadora *
              </label>
              <input
                type="text"
                value={formData.construtora}
                onChange={(e) => setFormData({ ...formData, construtora: e.target.value })}
                placeholder="Ex: Alia / André Guimarães"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusEmpreendimento })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="LANCAMENTO">Lançamento</option>
                <option value="EM_OBRAS">Em Obras</option>
                <option value="PRONTO">Pronto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previsão de Entrega
              </label>
              <input
                type="month"
                value={formData.previsao_entrega}
                onChange={(e) => setFormData({ ...formData, previsao_entrega: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Localização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, número"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  maxLength={2}
                  placeholder="BA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  placeholder="00000-000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Diferenciais do Empreendimento</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(diferenciaisLabels).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDiferencial(key as keyof DiferenciaisEmpreendimento)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm
                    ${formData.diferenciais[key as keyof DiferenciaisEmpreendimento]
                      ? 'bg-purple-50 border-purple-300 text-purple-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <i className={`fas fa-${icon}`}></i>
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              placeholder="Descreva o empreendimento..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
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
              className="flex-1 gradient-primary text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  {empreendimento ? 'Salvar Alterações' : 'Criar Empreendimento'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
