import { useEffect, useState } from 'react'
import { 
  Card, 
  Metric, 
  Text, 
  Flex, 
  BadgeDelta, 
  Grid, 
  Title, 
  DonutChart, 
  AreaChart,
  Legend,
  ProgressBar,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@tremor/react'
import { 
  Users, 
  ShoppingCart, 
  Target, 
  DollarSign, 
  Clock, 
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { dashboardService } from '../services/api'
import { DashboardResumo } from '../types'

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

const urgencyColors: Record<string, string> = {
  hoje: 'rose',
  amanha: 'amber',
  semana: 'blue',
  futuro: 'slate',
}

const urgencyLabels: Record<string, string> = {
  hoje: 'Hoje',
  amanha: 'Amanhã',
  semana: 'Esta semana',
  futuro: 'Futuro',
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="text-center py-12">
        <Text>Erro ao carregar dados do dashboard</Text>
      </Card>
    )
  }

  const funilDonutData = data.funil
    .filter(f => f.etapa !== 'VENDIDO')
    .map(f => ({
      name: f.nome,
      value: f.quantidade,
    }))

  const vgvChartData = data.vgvSemanal.map(s => ({
    semana: s.semana,
    VGV: s.valor,
  }))

  const totalFunil = data.funil.reduce((acc, f) => acc + f.quantidade, 0)

  return (
    <div className="space-y-6">
      <div>
        <Title>Dashboard</Title>
        <Text>Exibindo dados do mês atual</Text>
      </div>

      <Grid numItemsSm={2} numItemsLg={5} className="gap-4">
        <Card decoration="top" decorationColor="blue">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Text>Novos Leads</Text>
              <Metric>{data.novosLeads.valor}</Metric>
            </div>
            <BadgeDelta 
              deltaType={data.novosLeads.variacao >= 0 ? 'increase' : 'decrease'}
              size="sm"
            >
              {data.novosLeads.variacao >= 0 ? '+' : ''}{data.novosLeads.variacao}%
            </BadgeDelta>
          </Flex>
          <Flex justifyContent="start" className="mt-2">
            <Users className="w-5 h-5 text-blue-500 mr-2" />
            <Text className="text-xs">vs mês anterior</Text>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Text>Vendas Realizadas</Text>
              <Metric>{data.vendasRealizadas.valor}</Metric>
            </div>
            <BadgeDelta 
              deltaType={data.vendasRealizadas.variacao >= 0 ? 'increase' : 'decrease'}
              size="sm"
            >
              {data.vendasRealizadas.variacao >= 0 ? '+' : ''}{data.vendasRealizadas.variacao}%
            </BadgeDelta>
          </Flex>
          <Flex justifyContent="start" className="mt-2">
            <ShoppingCart className="w-5 h-5 text-emerald-500 mr-2" />
            <Text className="text-xs">vs mês anterior</Text>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="violet">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Text>Taxa de Conversão</Text>
              <Metric>{data.taxaConversao.valor}%</Metric>
            </div>
            <BadgeDelta 
              deltaType={data.taxaConversao.variacao >= 0 ? 'increase' : 'decrease'}
              size="sm"
            >
              {data.taxaConversao.variacao >= 0 ? '+' : ''}{data.taxaConversao.variacao}%
            </BadgeDelta>
          </Flex>
          <Flex justifyContent="start" className="mt-2">
            <Target className="w-5 h-5 text-violet-500 mr-2" />
            <Text className="text-xs">vs mês anterior</Text>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Text>VGV Total</Text>
              <Metric>{formatCurrency(data.vgvTotal.valor)}</Metric>
            </div>
            <BadgeDelta 
              deltaType={data.vgvTotal.variacao >= 0 ? 'increase' : 'decrease'}
              size="sm"
            >
              {data.vgvTotal.variacao >= 0 ? '+' : ''}{data.vgvTotal.variacao}%
            </BadgeDelta>
          </Flex>
          <Flex justifyContent="start" className="mt-2">
            <DollarSign className="w-5 h-5 text-amber-500 mr-2" />
            <Text className="text-xs">vs mês anterior</Text>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="rose">
          <Flex justifyContent="between" alignItems="center">
            <div>
              <Text>Ciclo Médio</Text>
              <Metric>{data.cicloMedioVendas.valor} dias</Metric>
            </div>
            <BadgeDelta 
              deltaType={data.cicloMedioVendas.variacao <= 0 ? 'increase' : 'decrease'}
              size="sm"
            >
              {data.cicloMedioVendas.variacao > 0 ? '+' : ''}{data.cicloMedioVendas.variacao}d
            </BadgeDelta>
          </Flex>
          <Flex justifyContent="start" className="mt-2">
            <Clock className="w-5 h-5 text-rose-500 mr-2" />
            <Text className="text-xs">vs mês anterior</Text>
          </Flex>
        </Card>
      </Grid>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <Card>
          <Title>Funil de Vendas</Title>
          <Text className="mb-4">Distribuição de negociações por etapa</Text>
          
          <TabGroup>
            <TabList className="mb-4">
              <Tab>Barras</Tab>
              <Tab>Donut</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className="space-y-4">
                  {data.funil.map((etapa) => (
                    <div key={etapa.etapa}>
                      <Flex>
                        <Text>{etapa.nome}</Text>
                        <Flex justifyContent="end" className="gap-4">
                          <Text className="text-xs text-gray-500">{etapa.tempoMedioDias}d</Text>
                          {etapa.etapa !== 'VENDIDO' && (
                            <Text className="text-xs text-gray-500">{etapa.taxaConversao}%</Text>
                          )}
                          <Text className="font-semibold">{etapa.quantidade}</Text>
                        </Flex>
                      </Flex>
                      <ProgressBar 
                        value={totalFunil > 0 ? (etapa.quantidade / totalFunil) * 100 : 0}
                        color={
                          etapa.etapa === 'VENDIDO' ? 'emerald' :
                          etapa.etapa === 'FECHAMENTO' ? 'violet' :
                          etapa.etapa === 'PROPOSTA_ENVIADA' ? 'orange' :
                          etapa.etapa === 'VISITA_AGENDADA' ? 'yellow' :
                          etapa.etapa === 'QUALIFICADO' ? 'cyan' :
                          etapa.etapa === 'PRIMEIRO_CONTATO' ? 'blue' : 'gray'
                        }
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
              </TabPanel>
              <TabPanel>
                <DonutChart
                  data={funilDonutData}
                  category="value"
                  index="name"
                  colors={['slate', 'blue', 'cyan', 'yellow', 'orange', 'violet']}
                  className="h-60"
                  showAnimation
                />
                <Legend
                  categories={funilDonutData.map(d => d.name)}
                  colors={['slate', 'blue', 'cyan', 'yellow', 'orange', 'violet']}
                  className="mt-4 justify-center"
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Card>

        <Card>
          <Title>VGV Semanal</Title>
          <Text className="mb-4">Valor Geral de Vendas das últimas 4 semanas</Text>
          
          {data.vgvSemanal.some(s => s.valor > 0) ? (
            <AreaChart
              data={vgvChartData}
              index="semana"
              categories={['VGV']}
              colors={['violet']}
              valueFormatter={formatCurrencyFull}
              className="h-60"
              showAnimation
              showLegend={false}
              curveType="monotone"
            />
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <Text>Nenhuma venda nas últimas semanas</Text>
              </div>
            </div>
          )}
        </Card>
      </Grid>

      <Card>
        <Title>Próximas Atividades</Title>
        <Text className="mb-4">Atividades pendentes ordenadas por urgência</Text>
        
        {data.proximasAtividades.length > 0 ? (
          <div className="space-y-3">
            {data.proximasAtividades.map((atividade) => (
              <div
                key={atividade.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 bg-${urgencyColors[atividade.urgencia]}-50 border-${urgencyColors[atividade.urgencia]}-500`}
                style={{
                  backgroundColor: atividade.urgencia === 'hoje' ? '#fef2f2' : 
                                   atividade.urgencia === 'amanha' ? '#fffbeb' :
                                   atividade.urgencia === 'semana' ? '#eff6ff' : '#f8fafc',
                  borderLeftColor: atividade.urgencia === 'hoje' ? '#ef4444' :
                                   atividade.urgencia === 'amanha' ? '#f59e0b' :
                                   atividade.urgencia === 'semana' ? '#3b82f6' : '#64748b',
                }}
              >
                <div className="p-2 rounded-full bg-white">
                  {atividade.tipo === 'LIGACAO' ? <Phone className="w-4 h-4" style={{ color: atividade.urgencia === 'hoje' ? '#ef4444' : atividade.urgencia === 'amanha' ? '#f59e0b' : '#3b82f6' }} /> :
                   atividade.tipo === 'EMAIL' ? <Mail className="w-4 h-4" style={{ color: atividade.urgencia === 'hoje' ? '#ef4444' : atividade.urgencia === 'amanha' ? '#f59e0b' : '#3b82f6' }} /> :
                   atividade.tipo === 'VISITA' ? <MapPin className="w-4 h-4" style={{ color: atividade.urgencia === 'hoje' ? '#ef4444' : atividade.urgencia === 'amanha' ? '#f59e0b' : '#3b82f6' }} /> :
                   <Calendar className="w-4 h-4" style={{ color: atividade.urgencia === 'hoje' ? '#ef4444' : atividade.urgencia === 'amanha' ? '#f59e0b' : '#3b82f6' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <Flex>
                    <Text className="font-medium truncate">{atividade.leadNome}</Text>
                    <Text className="text-xs px-2 py-0.5 rounded bg-gray-100">{atividade.tipo}</Text>
                  </Flex>
                  <Text className="text-sm text-gray-600 truncate">{atividade.descricao}</Text>
                </div>
                <div className="text-right">
                  <Text className="text-sm font-medium" style={{ 
                    color: atividade.urgencia === 'hoje' ? '#ef4444' : 
                           atividade.urgencia === 'amanha' ? '#f59e0b' : 
                           atividade.urgencia === 'semana' ? '#3b82f6' : '#64748b' 
                  }}>
                    {urgencyLabels[atividade.urgencia]}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(atividade.dataAtividade).toLocaleDateString('pt-BR')}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <Text>Nenhuma atividade pendente</Text>
          </div>
        )}
      </Card>
    </div>
  )
}
