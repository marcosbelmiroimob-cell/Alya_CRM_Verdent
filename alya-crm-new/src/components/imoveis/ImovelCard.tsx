import type { Imovel } from '../../types'
import { formatCurrency } from '../../lib/utils'

interface ImovelCardProps {
  imovel: Imovel
  onEdit: () => void
  onDelete: () => void
  onCreateDeal: () => void
}

export function ImovelCard({ imovel, onEdit, onDelete, onCreateDeal }: ImovelCardProps) {
  const tipoLabels: Record<string, string> = {
    APARTAMENTO: 'Apartamento',
    CASA: 'Casa',
    TERRENO: 'Terreno',
    COMERCIAL: 'Comercial',
    RURAL: 'Rural',
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    DISPONIVEL: { label: 'Disponível', color: 'bg-green-100 text-green-800' },
    RESERVADO: { label: 'Reservado', color: 'bg-yellow-100 text-yellow-800' },
    VENDIDO: { label: 'Vendido', color: 'bg-gray-100 text-gray-800' },
  }

  const fotoPrincipal = imovel.fotos?.[0]
  const status = statusConfig[imovel.status] || statusConfig.DISPONIVEL

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden group">
      {/* Foto Principal */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {fotoPrincipal ? (
          <img
            src={fotoPrincipal}
            alt={imovel.titulo}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <i className="fas fa-building text-6xl"></i>
          </div>
        )}
        
        {/* Badge de Status */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Badge de Tipo */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-90 text-gray-800">
            {tipoLabels[imovel.tipo]}
          </span>
        </div>

        {/* Contador de Fotos */}
        {imovel.fotos && imovel.fotos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            <i className="fas fa-camera mr-1"></i>
            {imovel.fotos.length}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5">
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {imovel.titulo}
        </h3>

        {/* Endereço */}
        {(imovel.cidade || imovel.estado) && (
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <i className="fas fa-map-marker-alt mr-2 text-primary-500"></i>
            {imovel.cidade}
            {imovel.cidade && imovel.estado && ' - '}
            {imovel.estado}
          </p>
        )}

        {/* Características */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
          {imovel.area_m2 && (
            <div className="flex items-center gap-1">
              <i className="fas fa-ruler-combined text-primary-500"></i>
              <span>{imovel.area_m2}m²</span>
            </div>
          )}
          {imovel.quartos > 0 && (
            <div className="flex items-center gap-1">
              <i className="fas fa-bed text-primary-500"></i>
              <span>{imovel.quartos}</span>
            </div>
          )}
          {imovel.banheiros > 0 && (
            <div className="flex items-center gap-1">
              <i className="fas fa-bath text-primary-500"></i>
              <span>{imovel.banheiros}</span>
            </div>
          )}
          {imovel.vagas > 0 && (
            <div className="flex items-center gap-1">
              <i className="fas fa-car text-primary-500"></i>
              <span>{imovel.vagas}</span>
            </div>
          )}
        </div>

        {/* Valores */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-2xl font-bold text-gradient-primary mb-1">
            {formatCurrency(imovel.valor)}
          </p>
          <div className="flex gap-3 text-xs text-gray-600">
            {imovel.condominio && (
              <span>Cond: {formatCurrency(imovel.condominio)}</span>
            )}
            {imovel.iptu && (
              <span>IPTU: {formatCurrency(imovel.iptu)}</span>
            )}
          </div>
        </div>

        {/* Tags de Características */}
        {imovel.caracteristicas && imovel.caracteristicas.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {imovel.caracteristicas.slice(0, 3).map((carac, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {carac}
              </span>
            ))}
            {imovel.caracteristicas.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{imovel.caracteristicas.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={onCreateDeal}
            className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            <i className="fas fa-handshake mr-2"></i>
            Criar Negociação
          </button>
          <button
            onClick={onEdit}
            className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="Editar"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={onDelete}
            className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="Excluir"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
