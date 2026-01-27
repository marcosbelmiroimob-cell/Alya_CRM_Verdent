import { useDashboard } from '../hooks/useDashboard'
import { MetricCard } from '../components/dashboard/MetricCard'
import { formatCurrency } from '../lib/utils'
import { ETAPAS_KANBAN } from '../lib/constants'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { metrics, loading, error } = useDashboard()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <i className="fas fa-exclamation-triangle text-red-600 text-3xl mb-3"></i>
        <p className="text-red-700 font-semibold">Erro ao carregar dashboard</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Leads"
          value={metrics.totalLeads}
          icon="users"
          color="purple"
          subtitle="Clientes cadastrados"
        />
        <MetricCard
          title="Imóveis Ativos"
          value={metrics.totalImoveis}
          icon="building"
          color="blue"
          subtitle="Disponíveis para venda"
        />
        <MetricCard
          title="Negociações"
          value={metrics.totalNegociacoes}
          icon="handshake"
          color="indigo"
          subtitle="Em andamento"
        />
        <MetricCard
          title="Valor em Pipeline"
          value={formatCurrency(metrics.valorTotalPipeline)}
          icon="dollar-sign"
          color="green"
          subtitle="Total de oportunidades"
        />
      </div>

      {/* Funil de vendas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Funil de Vendas</h3>
            <p className="text-sm text-gray-500 mt-1">
              Distribuição de negociações por etapa
            </p>
          </div>
          <button 
            onClick={() => navigate('/pipeline')}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Ver Pipeline Completo →
          </button>
        </div>

        {metrics.negociacoesPorEtapa.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ETAPAS_KANBAN.map((etapa) => {
              const count = metrics.negociacoesPorEtapa.find(
                (e) => e.etapa === etapa.id
              )?.count || 0

              return (
                <div
                  key={etapa.id}
                  className="p-4 border-2 border-gray-100 rounded-lg hover:border-primary-200 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: etapa.cor }}
                    >
                      <i className={`fas fa-${etapa.icone}`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        {etapa.nome}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <i className="fas fa-chart-bar text-5xl mb-4 opacity-50"></i>
            <p className="text-lg font-semibold">Nenhuma negociação ainda</p>
            <p className="text-sm mt-1">
              Crie seus primeiros leads e imóveis para começar!
            </p>
          </div>
        )}
      </div>

      {/* Call to action */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              🎉 Alya CRM está pronto para uso!
            </h3>
            <p className="text-purple-100 mb-4">
              Comece criando seus primeiros leads e imóveis para movimentar o pipeline.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/leads?novo=true')}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Novo Lead
              </button>
              <button 
                onClick={() => navigate('/imoveis?novo=true')}
                className="px-6 py-3 bg-purple-500 bg-opacity-30 text-white rounded-lg font-semibold hover:bg-opacity-50 transition-colors"
              >
                <i className="fas fa-building mr-2"></i>
                Novo Imóvel
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <i className="fas fa-rocket text-9xl opacity-20"></i>
          </div>
        </div>
      </div>
    </div>
  )
}

