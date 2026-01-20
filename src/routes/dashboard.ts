import { FastifyInstance } from 'fastify'
import { prisma } from '../utils/prisma.js'

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
}
