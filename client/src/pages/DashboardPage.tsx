import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Clock, 
  ShoppingCart,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { dashboardService } from '../services/api'
import { DashboardResumo } from '../types'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface KPICardProps {
  title: string
  value: string | number
  variacao: number
  icon: React.ReactNode
  isCurrency?: boolean
  isDays?: boolean
  inverseVariation?: boolean
}

function KPICard({ title, value, variacao, icon, isCurrency, isDays, inverseVariation }: KPICardProps) {
  const isPositive = inverseVariation ? variacao <= 0 : variacao >= 0
  const showArrow = variacao !== 0
  
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {isCurrency ? formatCurrency(Number(value)) : isDays ? `${value} dias` : value}
          </p>
          {showArrow && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{variacao}%</span>
              <span className="text-slate-400 text-xs ml-1">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
          {icon}
        </div>
      </div>
    </Card>
  )
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const urgencyColors: Record<string, { bg: string; text: string; label: string }> = {
  hoje: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Hoje' },
  amanha: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', label: 'Amanhã' },
  semana: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Esta semana' },
  futuro: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400', label: 'Futuro' },
}

const tipoIcons: Record<string, React.ReactNode> = {
  LIGACAO: <Phone className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  VISITA: <MapPin className="w-4 h-4" />,
  REUNIAO: <Calendar className="w-4 h-4" />,
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardResumo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await dashboardService.resumoCompleto()
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxFunilQtd = data?.funil ? Math.max(...data.funil.map(f => f.quantidade)) : 1

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Exibindo dados do mês atual
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
            <KPICard
              title="Novos Leads"
              value={data.novosLeads.valor}
              variacao={data.novosLeads.variacao}
              icon={<Users className="w-6 h-6 text-primary-600" />}
            />
            <KPICard
              title="Vendas Realizadas"
              value={data.vendasRealizadas.valor}
              variacao={data.vendasRealizadas.variacao}
              icon={<ShoppingCart className="w-6 h-6 text-primary-600" />}
            />
            <KPICard
              title="Taxa de Conversão"
              value={`${data.taxaConversao.valor}%`}
              variacao={data.taxaConversao.variacao}
              icon={<Target className="w-6 h-6 text-primary-600" />}
            />
            <KPICard
              title="VGV Total"
              value={data.vgvTotal.valor}
              variacao={data.vgvTotal.variacao}
              icon={<DollarSign className="w-6 h-6 text-primary-600" />}
              isCurrency
            />
            <KPICard
              title="Ciclo Médio"
              value={data.cicloMedioVendas.valor}
              variacao={data.cicloMedioVendas.variacao}
              icon={<Clock className="w-6 h-6 text-primary-600" />}
              isDays
              inverseVariation
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Funil de Vendas
              </h2>
              <div className="space-y-3">
                {data.funil.map((etapa) => (
                  <div key={etapa.etapa} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {etapa.nome}
                      </span>
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <span className="text-xs">{etapa.tempoMedioDias}d</span>
                        {etapa.etapa !== 'VENDIDO' && (
                          <span className="text-xs">{etapa.taxaConversao}%</span>
                        )}
                        <span className="font-semibold text-slate-900 dark:text-white w-8 text-right">
                          {etapa.quantidade}
                        </span>
                      </div>
                    </div>
                    <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                        style={{
                          width: `${Math.max((etapa.quantidade / maxFunilQtd) * 100, 5)}%`,
                          backgroundColor: etapa.cor,
                        }}
                      >
                        {etapa.quantidade > 0 && (
                          <span className="text-white text-xs font-medium">
                            {etapa.quantidade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                VGV Semanal
              </h2>
              {data.vgvSemanal.some(s => s.valor > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.vgvSemanal}>
                      <defs>
                        <linearGradient id="colorVgv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis 
                        dataKey="semana" 
                        tick={{ fontSize: 12 }}
                        className="text-slate-500"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        className="text-slate-500"
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrencyFull(value), 'VGV']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVgv)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma venda nas últimas semanas</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Próximas Atividades
            </h2>
            <div className="space-y-3">
              {data.proximasAtividades.length > 0 ? (
                data.proximasAtividades.map((atividade) => {
                  const urgency = urgencyColors[atividade.urgencia]
                  return (
                    <div
                      key={atividade.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${urgency.bg}`}
                    >
                      <div className={`p-2 rounded-full bg-white dark:bg-slate-800 ${urgency.text}`}>
                        {tipoIcons[atividade.tipo] || <Calendar className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white truncate">
                            {atividade.leadNome}
                          </span>
                          <Badge size="sm">{atividade.tipo}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {atividade.descricao}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${urgency.text}`}>
                          {urgency.label}
                        </span>
                        <p className="text-xs text-slate-500">
                          {new Date(atividade.dataAtividade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade pendente</p>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 text-slate-500">
          Erro ao carregar dados do dashboard
        </div>
      )}
    </div>
  )
}
