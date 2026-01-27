import type { Empreendimento } from '../../types'

interface EmpreendimentoCardProps {
  empreendimento: Empreendimento
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

const statusConfig = {
  LANCAMENTO: { label: 'Lançamento', color: 'bg-purple-100 text-purple-700', icon: 'rocket' },
  EM_OBRAS: { label: 'Em Obras', color: 'bg-orange-100 text-orange-700', icon: 'hard-hat' },
  PRONTO: { label: 'Pronto', color: 'bg-green-100 text-green-700', icon: 'check-circle' },
}

export function EmpreendimentoCard({ empreendimento, onView, onEdit, onDelete }: EmpreendimentoCardProps) {
  const status = statusConfig[empreendimento.status]
  
  const totalUnidades = empreendimento.tipologias?.reduce(
    (acc, tip) => acc + (tip.unidades?.length || 0), 0
  ) || 0
  
  const unidadesDisponiveis = empreendimento.tipologias?.reduce(
    (acc, tip) => acc + (tip.unidades?.filter(u => u.status === 'DISPONIVEL').length || 0), 0
  ) || 0

  const menorValor = empreendimento.tipologias?.reduce((min, tip) => {
    const tipMin = tip.unidades?.reduce((uMin, u) => 
      u.status === 'DISPONIVEL' && u.valor_tabela < uMin ? u.valor_tabela : uMin, Infinity
    ) || Infinity
    return tipMin < min ? tipMin : min
  }, Infinity) || Infinity

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="relative h-40">
        {empreendimento.imagem_capa ? (
          <img
            src={empreendimento.imagem_capa}
            alt={empreendimento.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
            <i className="fas fa-city text-white text-4xl opacity-50"></i>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <i className={`fas fa-${status.icon}`}></i>
            {status.label}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg leading-tight truncate">
            {empreendimento.nome}
          </h3>
          <p className="text-white/80 text-sm truncate">
            {empreendimento.construtora}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <i className="fas fa-map-marker-alt"></i>
          <span className="truncate">
            {empreendimento.bairro || 'Bairro não informado'}
            {empreendimento.cidade && `, ${empreendimento.cidade}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-gray-900">{empreendimento.tipologias?.length || 0}</p>
            <p className="text-xs text-gray-500">Tipologias</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-green-600">{unidadesDisponiveis}/{totalUnidades}</p>
            <p className="text-xs text-gray-500">Disponíveis</p>
          </div>
        </div>

        {menorValor !== Infinity && (
          <div className="mb-4">
            <p className="text-xs text-gray-500">A partir de</p>
            <p className="text-xl font-bold text-purple-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(menorValor)}
            </p>
          </div>
        )}

        {empreendimento.previsao_entrega && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <i className="fas fa-calendar-alt"></i>
            <span>Entrega: {new Date(empreendimento.previsao_entrega).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            <i className="fas fa-eye mr-1.5"></i>
            Ver Estoque
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <i className="fas fa-edit"></i>
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
