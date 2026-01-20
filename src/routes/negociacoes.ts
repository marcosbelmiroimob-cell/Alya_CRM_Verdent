import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'

const negociacaoSchema = z.object({
  leadId: z.number(),
  imovelId: z.number().optional(),
  unidadeId: z.number().optional(),
  imovelUsadoId: z.number().optional(),
  etapaKanban: z.enum([
    'NOVO_LEAD',
    'PRIMEIRO_CONTATO',
    'QUALIFICADO',
    'VISITA_AGENDADA',
    'PROPOSTA_ENVIADA',
    'FECHAMENTO',
    'VENDIDO',
    'PERDIDO',
  ]).optional(),
  valorProposta: z.number().optional(),
  observacoes: z.string().optional(),
  proximoContato: z.string().optional(),
})

const moveSchema = z.object({
  etapaKanban: z.enum([
    'NOVO_LEAD',
    'PRIMEIRO_CONTATO',
    'QUALIFICADO',
    'VISITA_AGENDADA',
    'PROPOSTA_ENVIADA',
    'FECHAMENTO',
    'VENDIDO',
    'PERDIDO',
  ]),
  ordem: z.number().optional(),
})

export async function negociacaoRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', async (request: any) => {
    const negociacoes = await prisma.negociacao.findMany({
      where: { usuarioId: request.user.id },
      orderBy: [{ etapaKanban: 'asc' }, { ordem: 'asc' }],
      include: {
        lead: { select: { id: true, nome: true, telefone: true, email: true, scoreQualificacao: true } },
        imovel: { select: { id: true, titulo: true, valor: true, tipoNegocio: true, comissaoPercentual: true } },
        unidade: { 
          select: { id: true, codigo: true, andar: true, posicao: true, preco: true, status: true },
          include: { 
            tipologia: { select: { nome: true, areaPrivativa: true } },
            torre: { select: { nome: true, empreendimento: { select: { nome: true, incorporadora: true } } } }
          }
        },
        imovelUsado: { select: { id: true, titulo: true, tipoImovel: true, valorVenda: true, comissaoPercentual: true } },
        atividades: { orderBy: { dataAtividade: 'desc' }, take: 1 },
      },
    })
    return { negociacoes }
  })

  fastify.get('/kanban', async (request: any) => {
    const negociacoes = await prisma.negociacao.findMany({
      where: { 
        usuarioId: request.user.id,
        etapaKanban: { not: 'PERDIDO' },
      },
      orderBy: [{ ordem: 'asc' }, { criadoEm: 'desc' }],
      include: {
        lead: { select: { id: true, nome: true, telefone: true, scoreQualificacao: true } },
        imovel: { select: { id: true, titulo: true, valor: true, comissaoPercentual: true } },
        unidade: { 
          include: { 
            tipologia: { select: { nome: true, areaPrivativa: true } },
            torre: { select: { nome: true, empreendimento: { select: { nome: true } } } }
          }
        },
        imovelUsado: { select: { id: true, titulo: true, tipoImovel: true, valorVenda: true, comissaoPercentual: true } },
      },
    })

    const kanban = {
      NOVO_LEAD: negociacoes.filter(n => n.etapaKanban === 'NOVO_LEAD'),
      PRIMEIRO_CONTATO: negociacoes.filter(n => n.etapaKanban === 'PRIMEIRO_CONTATO'),
      QUALIFICADO: negociacoes.filter(n => n.etapaKanban === 'QUALIFICADO'),
      VISITA_AGENDADA: negociacoes.filter(n => n.etapaKanban === 'VISITA_AGENDADA'),
      PROPOSTA_ENVIADA: negociacoes.filter(n => n.etapaKanban === 'PROPOSTA_ENVIADA'),
      FECHAMENTO: negociacoes.filter(n => n.etapaKanban === 'FECHAMENTO'),
      VENDIDO: negociacoes.filter(n => n.etapaKanban === 'VENDIDO'),
    }

    return { kanban }
  })

  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    const negociacao = await prisma.negociacao.findFirst({
      where: { id: parseInt(id), usuarioId: request.user.id },
      include: {
        lead: true,
        imovel: true,
        unidade: { 
          include: { 
            tipologia: true,
            torre: { include: { empreendimento: true } }
          }
        },
        imovelUsado: true,
        atividades: { orderBy: { dataAtividade: 'desc' } },
        historicosIA: { orderBy: { criadoEm: 'desc' }, take: 10 },
      },
    })

    if (!negociacao) {
      return reply.status(404).send({ error: 'Negociação não encontrada' })
    }

    return { negociacao }
  })

  fastify.post('/', async (request: any, reply) => {
    try {
      const body = negociacaoSchema.parse(request.body)
      
      const lead = await prisma.lead.findFirst({
        where: { id: body.leadId, usuarioId: request.user.id },
      })

      if (!lead) {
        return reply.status(400).send({ error: 'Lead não encontrado' })
      }

      if (body.imovelId) {
        const imovel = await prisma.imovel.findFirst({
          where: { id: body.imovelId, usuarioId: request.user.id },
        })
        if (!imovel) {
          return reply.status(400).send({ error: 'Imóvel não encontrado' })
        }
      }

      if (body.unidadeId) {
        const unidade = await prisma.unidade.findFirst({
          where: { 
            id: body.unidadeId,
            torre: { empreendimento: { usuarioId: request.user.id } }
          },
        })
        if (!unidade) {
          return reply.status(400).send({ error: 'Unidade não encontrada' })
        }
      }

      if (body.imovelUsadoId) {
        const imovelUsado = await prisma.imovelUsado.findFirst({
          where: { id: body.imovelUsadoId, usuarioId: request.user.id },
        })
        if (!imovelUsado) {
          return reply.status(400).send({ error: 'Imóvel usado não encontrado' })
        }
      }

      const maxOrdem = await prisma.negociacao.aggregate({
        where: { usuarioId: request.user.id, etapaKanban: body.etapaKanban || 'NOVO_LEAD' },
        _max: { ordem: true },
      })

      const negociacao = await prisma.negociacao.create({
        data: {
          ...body,
          proximoContato: body.proximoContato ? new Date(body.proximoContato) : null,
          usuarioId: request.user.id,
          ordem: (maxOrdem._max.ordem || 0) + 1,
        },
        include: {
          lead: true,
          imovel: true,
          unidade: { include: { tipologia: true, torre: { include: { empreendimento: true } } } },
          imovelUsado: true,
        },
      })

      return reply.status(201).send({ negociacao })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.patch('/:id/move', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    try {
      const body = moveSchema.parse(request.body)
      
      const result = await prisma.negociacao.updateMany({
        where: { id: parseInt(id), usuarioId: request.user.id },
        data: {
          etapaKanban: body.etapaKanban,
          ordem: body.ordem ?? 0,
        },
      })

      if (result.count === 0) {
        return reply.status(404).send({ error: 'Negociação não encontrada' })
      }

      const updated = await prisma.negociacao.findUnique({
        where: { id: parseInt(id) },
        include: { 
          lead: true, 
          imovel: true,
          unidade: { include: { tipologia: true, torre: { include: { empreendimento: true } } } },
          imovelUsado: true,
        },
      })

      return { negociacao: updated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.put('/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    try {
      const body = negociacaoSchema.partial().parse(request.body)
      const result = await prisma.negociacao.updateMany({
        where: { id: parseInt(id), usuarioId: request.user.id },
        data: {
          ...body,
          proximoContato: body.proximoContato ? new Date(body.proximoContato) : undefined,
        },
      })

      if (result.count === 0) {
        return reply.status(404).send({ error: 'Negociação não encontrada' })
      }

      const updated = await prisma.negociacao.findUnique({
        where: { id: parseInt(id) },
        include: { 
          lead: true, 
          imovel: true,
          unidade: { include: { tipologia: true, torre: { include: { empreendimento: true } } } },
          imovelUsado: true,
        },
      })

      return { negociacao: updated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    const result = await prisma.negociacao.deleteMany({
      where: { id: parseInt(id), usuarioId: request.user.id },
    })

    if (result.count === 0) {
      return reply.status(404).send({ error: 'Negociação não encontrada' })
    }

    return { success: true }
  })
}
