import { useState, useEffect } from 'react'
import type { Imovel } from '../../types'
import { TIPO_IMOVEL, STATUS_IMOVEL } from '../../lib/constants'

interface ImovelFormProps {
  imovel?: Imovel
  onSave: (imovelData: any, fotos: File[]) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

export function ImovelForm({ imovel, onSave, onClose }: ImovelFormProps) {
  const [formData, setFormData] = useState({
    titulo: imovel?.titulo || '',
    tipo: imovel?.tipo || 'APARTAMENTO',
    endereco: imovel?.endereco || '',
    cidade: imovel?.cidade || '',
    estado: imovel?.estado || '',
    cep: imovel?.cep || '',
    valor: imovel?.valor || '',
    area_m2: imovel?.area_m2 || '',
    quartos: imovel?.quartos || 0,
    banheiros: imovel?.banheiros || 0,
    vagas: imovel?.vagas || 0,
    condominio: imovel?.condominio || '',
    iptu: imovel?.iptu || '',
    descricao: imovel?.descricao || '',
    caracteristicas: imovel?.caracteristicas?.join(', ') || '',
    status: imovel?.status || 'DISPONIVEL',
    fotos: imovel?.fotos || [],
  })
  const [novasFotos, setNovasFotos] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Criar previews das fotos novas
    const urls = novasFotos.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [novasFotos])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNovasFotos(prev => [...prev, ...filesArray])
    }
  }

  const removeFoto = (index: number) => {
    setNovasFotos(prev => prev.filter((_, i) => i !== index))
  }

  const removeFotoExistente = (url: string) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter(f => f !== url),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.titulo || !formData.tipo || !formData.valor) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)

    const imovelData = {
      ...formData,
      valor: Number(formData.valor),
      area_m2: formData.area_m2 ? Number(formData.area_m2) : null,
      quartos: Number(formData.quartos),
      banheiros: Number(formData.banheiros),
      vagas: Number(formData.vagas),
      condominio: formData.condominio ? Number(formData.condominio) : null,
      iptu: formData.iptu ? Number(formData.iptu) : null,
      caracteristicas: formData.caracteristicas
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0),
    }

    const result = await onSave(imovelData, novasFotos)

    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Erro ao salvar imóvel')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="gradient-primary text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">
            {imovel ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Anúncio *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: Apartamento 3 quartos no Centro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {TIPO_IMOVEL.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {STATUS_IMOVEL.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="SP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Valores e Características */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Valores e Características</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de Venda (R$) *
                </label>
                <input
                  type="number"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condomínio (R$)
                </label>
                <input
                  type="number"
                  name="condominio"
                  value={formData.condominio}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IPTU (R$)
                </label>
                <input
                  type="number"
                  name="iptu"
                  value={formData.iptu}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área (m²)
                </label>
                <input
                  type="number"
                  name="area_m2"
                  value={formData.area_m2}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartos
                </label>
                <input
                  type="number"
                  name="quartos"
                  value={formData.quartos}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banheiros
                </label>
                <input
                  type="number"
                  name="banheiros"
                  value={formData.banheiros}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vagas de Garagem
                </label>
                <input
                  type="number"
                  name="vagas"
                  value={formData.vagas}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Descrição e Características */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descreva o imóvel, diferenciais, proximidades..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Características (separadas por vírgula)
              </label>
              <input
                type="text"
                name="caracteristicas"
                value={formData.caracteristicas}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Piscina, Churrasqueira, Sacada, Academia"
              />
            </div>
          </div>

          {/* Upload de Fotos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Fotos do Imóvel</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adicionar Fotos
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Você pode selecionar múltiplas fotos de uma vez
              </p>
            </div>

            {/* Preview de fotos existentes */}
            {formData.fotos.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Fotos Atuais</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.fotos.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFotoExistente(url)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview de novas fotos */}
            {previewUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Novas Fotos (ainda não salvas)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 gradient-primary text-white rounded-lg hover:opacity-90 font-medium transition-opacity disabled:opacity-50"
            >
              {loading ? 'Salvando...' : imovel ? 'Atualizar Imóvel' : 'Cadastrar Imóvel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
