import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { TrendingUp, Users, Building2, DollarSign, Target, Clock, CheckCircle } from 'lucide-react'
import { dashboardService } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardData {
  totalLeads: number
  totalImoveis: number
  totalNegociacoes: number
  vendasMes: number
  vendasMesTotal: number
  comissoesMes: number
  taxaConversao: string
  pipeline: { etapa: string; count: number }[]
  ultimasAtividades: {
    id: number
    tipo: string
    descricao: string
    dataAtividade: string
    concluida: boolean
    leadNome: string
  }[]
}

const CORES_ETAPAS: Record<string, string> = {
  NOVO_LEAD: '#64748b',
  PRIMEIRO_CONTATO: '#3b82f6',
  QUALIFICADO: '#06b6d4',
  VISITA_AGENDADA: '#eab308',
  PROPOSTA_ENVIADA: '#f97316',
  FECHAMENTO: '#a855f7',
  VENDIDO: '#22c55e',
}

const NOMES_ETAPAS: Record<string, string> = {
  NOVO_LEAD: 'Novo Lead',
  PRIMEIRO_CONTATO: 'Primeiro Contato',
  QUALIFICADO: 'Qualificado',
  VISITA_AGENDADA: 'Visita Agendada',
  PROPOSTA_ENVIADA: 'Proposta Enviada',
  FECHAMENTO: 'Fechamento',
  VENDIDO: 'Vendido',
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await dashboardService.resumo()
      setData(response.data.resumo)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const pipelineData = data?.pipeline.map((p) => ({
    name: NOMES_ETAPAS[p.etapa] || p.etapa,
    value: p.count,
    fill: CORES_ETAPAS[p.etapa] || '#64748b',
  })) || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Visao geral do seu desempenho</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Leads Ativos</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.totalLeads || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Negociacoes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.totalNegociacoes || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Imoveis</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.totalImoveis || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Comissoes do Mes</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.comissoesMes || 0)}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-slate-500">Vendas do Mes</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{data?.vendasMes || 0} vendas</p>
                </div>
                <Badge variant="success" size="md">{formatCurrency(data?.vendasMesTotal || 0)}</Badge>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Taxa de Conversao</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.taxaConversao || 0}%</p>
                </div>
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-full">
                  <Target className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pipeline por Etapa</h2>
              {pipelineData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  Nenhuma negociacao no pipeline
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Distribuicao do Funil</h2>
              {pipelineData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ value }) => `${value}`}
                      >
                        {pipelineData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  Nenhum dado disponivel
                </div>
              )}
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Ultimas Atividades</h2>
            <div className="space-y-3">
              {data?.ultimasAtividades && data.ultimasAtividades.length > 0 ? (
                data.ultimasAtividades.map((atividade) => (
                  <div
                    key={atividade.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className={`p-2 rounded-full ${atividade.concluida ? 'bg-green-100' : 'bg-slate-200'}`}>
                      {atividade.concluida ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">{atividade.leadNome}</span>
                        <Badge>{atividade.tipo}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{atividade.descricao}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(atividade.dataAtividade).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-8">Nenhuma atividade registrada</p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
