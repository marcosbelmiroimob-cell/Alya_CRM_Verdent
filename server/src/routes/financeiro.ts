import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'

const transacaoSchema = z.object({
  tipo: z.enum(['RECEITA', 'DESPESA']),
  categoria: z.string().min(1),
  descricao: z.string().optional(),
  valor: z.number().positive(),
  dataVencimento: z.string().optional(),
  dataPagamento: z.string().optional(),
  status: z.enum(['PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO']).optional(),
  recorrente: z.boolean().optional(),
  negociacaoId: z.number().optional(),
})

export async function financeiroRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/transacoes', async (request: any) => {
    const { mes, ano, tipo } = request.query as { mes?: string; ano?: string; tipo?: string }
    
    const where: any = { usuarioId: request.user.id }
    
    if (tipo) where.tipo = tipo
    
    if (mes && ano) {
      const inicio = new Date(parseInt(ano), parseInt(mes) - 1, 1)
      const fim = new Date(parseInt(ano), parseInt(mes), 0)
      where.OR = [
        { dataVencimento: { gte: inicio, lte: fim } },
        { dataPagamento: { gte: inicio, lte: fim } },
      ]
    }

    const transacoes = await prisma.transacaoFinanceira.findMany({
      where,
      orderBy: { dataVencimento: 'desc' },
      include: {
        negociacao: {
          select: { id: true, lead: { select: { nome: true } }, imovel: { select: { titulo: true } } },
        },
      },
    })

    return { transacoes }
  })

  fastify.get('/resumo', async (request: any) => {
    const { mes, ano } = request.query as { mes?: string; ano?: string }
    
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear()
    
    const inicio = new Date(anoAtual, mesAtual - 1, 1)
    const fim = new Date(anoAtual, mesAtual, 0)

    const transacoes = await prisma.transacaoFinanceira.findMany({
      where: {
        usuarioId: request.user.id,
        OR: [
          { dataVencimento: { gte: inicio, lte: fim } },
          { dataPagamento: { gte: inicio, lte: fim } },
        ],
      },
    })

    const receitas = transacoes
      .filter(t => t.tipo === 'RECEITA' && t.status === 'PAGO')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const despesas = transacoes
      .filter(t => t.tipo === 'DESPESA' && t.status === 'PAGO')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const receitasPendentes = transacoes
      .filter(t => t.tipo === 'RECEITA' && t.status === 'PENDENTE')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const despesasPendentes = transacoes
      .filter(t => t.tipo === 'DESPESA' && t.status === 'PENDENTE')
      .reduce((acc, t) => acc + Number(t.valor), 0)

    const negociacoesVendidas = await prisma.negociacao.findMany({
      where: {
        usuarioId: request.user.id,
        etapaKanban: 'VENDIDO',
      },
      include: {
        imovel: { select: { valor: true, comissaoPercentual: true } },
      },
    })

    const comissoesPipeline = await prisma.negociacao.findMany({
      where: {
        usuarioId: request.user.id,
        etapaKanban: { in: ['PROPOSTA_ENVIADA', 'FECHAMENTO'] },
      },
      include: {
        imovel: { select: { valor: true, comissaoPercentual: true } },
      },
    })

    const previsaoComissoes = comissoesPipeline.reduce((acc, n) => {
      if (n.imovel) {
        const comissao = Number(n.imovel.valor) * (Number(n.imovel.comissaoPercentual) / 100)
        const probabilidade = n.etapaKanban === 'FECHAMENTO' ? 0.8 : 0.4
        return acc + (comissao * probabilidade)
      }
      return acc
    }, 0)

    return {
      resumo: {
        receitas,
        despesas,
        saldo: receitas - despesas,
        receitasPendentes,
        despesasPendentes,
        previsaoComissoes,
      },
    }
  })

  fastify.get('/categorias', async (request: any) => {
    const categorias = await prisma.transacaoFinanceira.groupBy({
      by: ['categoria', 'tipo'],
      where: { usuarioId: request.user.id },
      _sum: { valor: true },
      _count: true,
    })

    return { categorias }
  })

  fastify.post('/transacoes', async (request: any, reply) => {
    try {
      const body = transacaoSchema.parse(request.body)
      
      const transacao = await prisma.transacaoFinanceira.create({
        data: {
          ...body,
          dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : null,
          dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : null,
          usuarioId: request.user.id,
        },
      })

      return reply.status(201).send({ transacao })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.put('/transacoes/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    try {
      const body = transacaoSchema.partial().parse(request.body)
      
      const result = await prisma.transacaoFinanceira.updateMany({
        where: { id: parseInt(id), usuarioId: request.user.id },
        data: {
          ...body,
          dataVencimento: body.dataVencimento ? new Date(body.dataVencimento) : undefined,
          dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : undefined,
        },
      })

      if (result.count === 0) {
        return reply.status(404).send({ error: 'Transação não encontrada' })
      }

      const updated = await prisma.transacaoFinanceira.findUnique({ where: { id: parseInt(id) } })
      return { transacao: updated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.delete('/transacoes/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    const result = await prisma.transacaoFinanceira.deleteMany({
      where: { id: parseInt(id), usuarioId: request.user.id },
    })

    if (result.count === 0) {
      return reply.status(404).send({ error: 'Transação não encontrada' })
    }

    return { success: true }
  })
}
