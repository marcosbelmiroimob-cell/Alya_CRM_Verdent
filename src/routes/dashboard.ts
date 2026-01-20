import { FastifyInstance } from 'fastify'
import { prisma } from '../utils/prisma.js'

const ETAPAS_ORDEM = [
  'NOVO_LEAD',
  'PRIMEIRO_CONTATO',
  'QUALIFICADO',
  'VISITA_AGENDADA',
  'PROPOSTA_ENVIADA',
  'FECHAMENTO',
  'VENDIDO',
]

const NOMES_ETAPAS: Record<string, string> = {
  NOVO_LEAD: 'Novo Lead',
  PRIMEIRO_CONTATO: 'Primeiro Contato',
  QUALIFICADO: 'Qualificado',
  VISITA_AGENDADA: 'Visita Agendada',
  PROPOSTA_ENVIADA: 'Proposta Enviada',
  FECHAMENTO: 'Fechamento',
  VENDIDO: 'Vendido',
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

function calcularVariacao(atual: number, anterior: number): number {
  if (anterior === 0) return atual > 0 ? 100 : 0
  return Math.round(((atual - anterior) / anterior) * 100)
}

function getInicioSemana(date: Date, weeksAgo: number = 0): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay() - (weeksAgo * 7))
  d.setHours(0, 0, 0, 0)
  return d
}

function getFimSemana(inicioSemana: Date): Date {
  const d = new Date(inicioSemana)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/resumo', async (request: any) => {
    const usuarioId = request.user.id

    const [
      totalLeads,
      totalImoveis,
      negociacoesPorEtapa,
      vendasMes,
      ultimasAtividades,
    ] = await Promise.all([
      prisma.lead.count({ where: { usuarioId } }),
      prisma.imovel.count({ where: { usuarioId, ativo: true } }),
      prisma.negociacao.groupBy({
        by: ['etapaKanban'],
        where: { usuarioId },
        _count: true,
      }),
      prisma.negociacao.findMany({
        where: {
          usuarioId,
          etapaKanban: 'VENDIDO',
          atualizadoEm: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        include: {
          imovel: { select: { valor: true, comissaoPercentual: true } },
        },
      }),
      prisma.atividade.findMany({
        where: {
          negociacao: { usuarioId },
        },
        orderBy: { dataAtividade: 'desc' },
        take: 10,
        include: {
          negociacao: {
            include: {
              lead: { select: { nome: true } },
            },
          },
        },
      }),
    ])

    const totalNegociacoes = negociacoesPorEtapa.reduce((acc, n) => acc + n._count, 0)

    const vendasMesTotal = vendasMes.reduce((acc, v) => {
      if (v.imovel) {
        return acc + Number(v.imovel.valor)
      }
      return acc
    }, 0)

    const comissoesMes = vendasMes.reduce((acc, v) => {
      if (v.imovel) {
        return acc + (Number(v.imovel.valor) * (Number(v.imovel.comissaoPercentual) / 100))
      }
      return acc
    }, 0)

    const pipeline = negociacoesPorEtapa.map((n) => ({
      etapa: n.etapaKanban,
      count: n._count,
    }))

    const taxaConversao = totalLeads > 0 
      ? ((vendasMes.length / totalLeads) * 100).toFixed(1) 
      : '0'

    return {
      resumo: {
        totalLeads,
        totalImoveis,
        totalNegociacoes,
        vendasMes: vendasMes.length,
        vendasMesTotal,
        comissoesMes,
        taxaConversao,
        pipeline,
        ultimasAtividades: ultimasAtividades.map((a) => ({
          id: a.id,
          tipo: a.tipo,
          descricao: a.descricao,
          dataAtividade: a.dataAtividade,
          concluida: a.concluida,
          leadNome: a.negociacao.lead?.nome,
        })),
      },
    }
  })

  fastify.get('/pipeline-valores', async (request: any) => {
    const usuarioId = request.user.id

    const negociacoes = await prisma.negociacao.findMany({
      where: { usuarioId, etapaKanban: { not: 'PERDIDO' } },
      include: {
        imovel: { select: { valor: true, comissaoPercentual: true } },
      },
    })

    const pipelineValores = negociacoes.reduce((acc, n) => {
      const etapa = n.etapaKanban
      if (!acc[etapa]) {
        acc[etapa] = { valor: 0, comissao: 0, count: 0 }
      }
      if (n.imovel) {
        acc[etapa].valor += Number(n.imovel.valor)
        acc[etapa].comissao += Number(n.imovel.valor) * (Number(n.imovel.comissaoPercentual) / 100)
      }
      acc[etapa].count += 1
      return acc
    }, {} as Record<string, { valor: number; comissao: number; count: number }>)

    return { pipelineValores }
  })

  fastify.get('/resumo-completo', async (request: any) => {
    const usuarioId = request.user.id
    const hoje = new Date()
    
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999)
    const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0, 23, 59, 59, 999)

    const [
      leadsAtual,
      leadsAnterior,
      negociacoesPorEtapa,
      vendasAtual,
      vendasAnterior,
      todasNegociacoes,
      proximasAtividades,
    ] = await Promise.all([
      prisma.lead.count({
        where: { usuarioId, criadoEm: { gte: inicioMesAtual, lte: fimMesAtual } },
      }),
      prisma.lead.count({
        where: { usuarioId, criadoEm: { gte: inicioMesAnterior, lte: fimMesAnterior } },
      }),
      prisma.negociacao.groupBy({
        by: ['etapaKanban'],
        where: { usuarioId, etapaKanban: { not: 'PERDIDO' } },
        _count: true,
      }),
      prisma.negociacao.findMany({
        where: {
          usuarioId,
          etapaKanban: 'VENDIDO',
          atualizadoEm: { gte: inicioMesAtual, lte: fimMesAtual },
        },
        include: {
          lead: true,
          imovel: true,
          unidade: { include: { torre: { include: { empreendimento: true } } } },
          imovelUsado: true,
        },
      }),
      prisma.negociacao.findMany({
        where: {
          usuarioId,
          etapaKanban: 'VENDIDO',
          atualizadoEm: { gte: inicioMesAnterior, lte: fimMesAnterior },
        },
        include: {
          imovel: true,
          unidade: true,
          imovelUsado: true,
        },
      }),
      prisma.negociacao.findMany({
        where: { usuarioId, etapaKanban: { not: 'PERDIDO' } },
        select: { etapaKanban: true, criadoEm: true, atualizadoEm: true },
      }),
      prisma.atividade.findMany({
        where: {
          negociacao: { usuarioId },
          concluida: false,
          dataAtividade: { gte: new Date(hoje.setHours(0, 0, 0, 0)) },
        },
        orderBy: { dataAtividade: 'asc' },
        take: 10,
        include: {
          negociacao: {
            include: { lead: { select: { nome: true } } },
          },
        },
      }),
    ])

    const getValorNegociacao = (n: any): number => {
      if (n.unidade?.preco) return Number(n.unidade.preco)
      if (n.imovelUsado?.valorVenda) return Number(n.imovelUsado.valorVenda)
      if (n.imovel?.valor) return Number(n.imovel.valor)
      return 0
    }

    const vgvAtual = vendasAtual.reduce((acc, v) => acc + getValorNegociacao(v), 0)
    const vgvAnterior = vendasAnterior.reduce((acc, v) => acc + getValorNegociacao(v), 0)

    const totalLeadsAtual = leadsAtual || 1
    const totalLeadsAnterior = leadsAnterior || 1
    const taxaConversaoAtual = (vendasAtual.length / totalLeadsAtual) * 100
    const taxaConversaoAnterior = (vendasAnterior.length / totalLeadsAnterior) * 100

    const calcularCicloMedio = (vendas: any[]): number => {
      if (vendas.length === 0) return 0
      const ciclos = vendas
        .filter(v => v.lead?.criadoEm)
        .map(v => {
          const criacao = new Date(v.lead.criadoEm)
          const venda = new Date(v.atualizadoEm)
          return Math.round((venda.getTime() - criacao.getTime()) / (1000 * 60 * 60 * 24))
        })
      return ciclos.length > 0 ? Math.round(ciclos.reduce((a, b) => a + b, 0) / ciclos.length) : 0
    }

    const cicloAtual = calcularCicloMedio(vendasAtual)
    const cicloAnterior = calcularCicloMedio(vendasAnterior as any)

    const etapasCount: Record<string, number> = {}
    negociacoesPorEtapa.forEach(n => {
      etapasCount[n.etapaKanban] = n._count
    })

    const funil = ETAPAS_ORDEM.map((etapa, index) => {
      const quantidade = etapasCount[etapa] || 0
      const proximaEtapa = ETAPAS_ORDEM[index + 1]
      const qtdProxima = proximaEtapa ? (etapasCount[proximaEtapa] || 0) : 0
      const taxaConversao = quantidade > 0 ? Math.round((qtdProxima / quantidade) * 100) : 0

      const negociacoesEtapa = todasNegociacoes.filter(n => n.etapaKanban === etapa)
      let tempoMedioDias = 0
      if (negociacoesEtapa.length > 0) {
        const tempos = negociacoesEtapa.map(n => {
          const diff = new Date().getTime() - new Date(n.atualizadoEm).getTime()
          return Math.round(diff / (1000 * 60 * 60 * 24))
        })
        tempoMedioDias = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
      }

      return {
        etapa,
        nome: NOMES_ETAPAS[etapa] || etapa,
        quantidade,
        tempoMedioDias,
        taxaConversao,
        cor: CORES_ETAPAS[etapa] || '#64748b',
      }
    })

    const vgvSemanal = []
    for (let i = 3; i >= 0; i--) {
      const inicioSemana = getInicioSemana(hoje, i)
      const fimSemana = getFimSemana(inicioSemana)
      
      const vendasSemana = await prisma.negociacao.findMany({
        where: {
          usuarioId,
          etapaKanban: 'VENDIDO',
          atualizadoEm: { gte: inicioSemana, lte: fimSemana },
        },
        include: {
          imovel: true,
          unidade: true,
          imovelUsado: true,
        },
      })

      const valorSemana = vendasSemana.reduce((acc, v) => acc + getValorNegociacao(v), 0)
      
      const semanaLabel = `Sem ${4 - i}`
      vgvSemanal.push({ semana: semanaLabel, valor: valorSemana })
    }

    const calcularUrgencia = (dataAtividade: Date): 'hoje' | 'amanha' | 'semana' | 'futuro' => {
      const hojeDate = new Date()
      hojeDate.setHours(0, 0, 0, 0)
      const atividadeDate = new Date(dataAtividade)
      atividadeDate.setHours(0, 0, 0, 0)
      
      const diffDias = Math.round((atividadeDate.getTime() - hojeDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDias <= 0) return 'hoje'
      if (diffDias === 1) return 'amanha'
      if (diffDias <= 7) return 'semana'
      return 'futuro'
    }

    return {
      periodo: {
        inicio: inicioMesAtual.toISOString(),
        fim: fimMesAtual.toISOString(),
      },
      novosLeads: {
        valor: leadsAtual,
        variacao: calcularVariacao(leadsAtual, leadsAnterior),
      },
      vendasRealizadas: {
        valor: vendasAtual.length,
        variacao: calcularVariacao(vendasAtual.length, vendasAnterior.length),
      },
      taxaConversao: {
        valor: Math.round(taxaConversaoAtual * 10) / 10,
        variacao: calcularVariacao(taxaConversaoAtual, taxaConversaoAnterior),
      },
      vgvTotal: {
        valor: vgvAtual,
        variacao: calcularVariacao(vgvAtual, vgvAnterior),
      },
      cicloMedioVendas: {
        valor: cicloAtual,
        variacao: cicloAnterior > 0 ? cicloAtual - cicloAnterior : 0,
      },
      funil,
      vgvSemanal,
      proximasAtividades: proximasAtividades.map(a => ({
        id: a.id,
        tipo: a.tipo,
        descricao: a.descricao,
        dataAtividade: a.dataAtividade.toISOString(),
        leadNome: a.negociacao.lead?.nome || 'Sem lead',
        urgencia: calcularUrgencia(a.dataAtividade),
      })),
    }
  })
}
