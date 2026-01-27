import type { ImovelUsado } from '../../types'

interface ImovelUsadoCardProps {
  imovel: ImovelUsado
  onEdit: () => void
  onDelete: () => void
  onToggleDestaque: () => void
}

const statusConfig = {
  DISPONIVEL: { label: 'Disponível', color: 'bg-green-100 text-green-700' },
  RESERVADO: { label: 'Reservado', color: 'bg-yellow-100 text-yellow-700' },
  VENDIDO: { label: 'Vendido', color: 'bg-red-100 text-red-700' },
}

const estadoConfig = {
  ORIGINAL: { label: 'Original', icon: 'house' },
  REFORMADO: { label: 'Reformado', icon: 'paint-roller' },
  SEMIMOBILIADO: { label: 'Semimobiliado', icon: 'couch' },
  PORTEIRA_FECHADA: { label: 'Porteira Fechada', icon: 'door-open' },
}

const posicaoSolarLabels: Record<string, string> = {
  NASCENTE_TOTAL: 'Nascente Total',
  NASCENTE_NORTE: 'Nascente/Norte',
  NASCENTE_SUL: 'Nascente/Sul',
  POENTE: 'Poente',
  NORTE: 'Norte',
  SUL: 'Sul',
}

export function ImovelUsadoCard({ imovel, onEdit, onDelete, onToggleDestaque }: ImovelUsadoCardProps) {
  const status = statusConfig[imovel.status]
  const estado = estadoConfig[imovel.estado]
  const foto = imovel.fotos?.[0]

  const custoFixo = (imovel.condominio || 0) + (imovel.iptu || 0)

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="relative h-48">
        {foto ? (
          <img
            src={foto}
            alt={imovel.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <i className="fas fa-home text-white text-5xl opacity-50"></i>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleDestaque(); }}
            className={`p-2 rounded-full transition-colors ${
              imovel.destaque 
                ? 'bg-yellow-400 text-yellow-900' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={imovel.destaque ? 'Remover destaque' : 'Destacar imóvel'}
          >
            <i className={`fas fa-star ${imovel.destaque ? '' : 'opacity-70'}`}></i>
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.valor_venda)}
          </p>
          {custoFixo > 0 && (
            <p className="text-white/80 text-sm">
              Custo fixo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoFixo)}/mês
            </p>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{imovel.titulo}</h3>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <i className="fas fa-map-marker-alt"></i>
          <span className="truncate">
            {imovel.bairro || 'Bairro não informado'}
            {imovel.cidade && `, ${imovel.cidade}`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-lg font-bold text-gray-900">{imovel.area_m2}</p>
            <p className="text-[10px] text-gray-500">m²</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-lg font-bold text-gray-900">{imovel.dormitorios}</p>
            <p className="text-[10px] text-gray-500">quartos</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-lg font-bold text-gray-900">{imovel.suites}</p>
            <p className="text-[10px] text-gray-500">suítes</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-lg font-bold text-gray-900">{imovel.vagas}</p>
            <p className="text-[10px] text-gray-500">vagas</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs">
            <i className={`fas fa-${estado.icon}`}></i>
            {estado.label}
          </span>
          {imovel.andar && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
              <i className="fas fa-building"></i>
              {imovel.andar}º andar
            </span>
          )}
          {imovel.posicao_solar && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs">
              <i className="fas fa-sun"></i>
              {posicaoSolarLabels[imovel.posicao_solar] || imovel.posicao_solar}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
          >
            <i className="fas fa-edit mr-1.5"></i>
            Editar
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
