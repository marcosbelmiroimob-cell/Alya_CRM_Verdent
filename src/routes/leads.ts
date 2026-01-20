import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'

const leadSchema = z.object({
  nome: z.string().min(2),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  origem: z.string().optional(),
  perfilComprador: z.any().optional(),
  observacoes: z.string().optional(),
})

export async function leadRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', async (request: any) => {
    const leads = await prisma.lead.findMany({
      where: { usuarioId: request.user.id },
      orderBy: { criadoEm: 'desc' },
      include: {
        negociacoes: {
          select: {
            id: true,
            etapaKanban: true,
            imovel: {
              select: { titulo: true },
            },
          },
        },
      },
    })
    return { leads }
  })

  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    const lead = await prisma.lead.findFirst({
      where: { id: parseInt(id), usuarioId: request.user.id },
      include: {
        negociacoes: {
          include: {
            imovel: true,
            atividades: { orderBy: { dataAtividade: 'desc' }, take: 5 },
          },
        },
      },
    })

    if (!lead) {
      return reply.status(404).send({ error: 'Lead não encontrado' })
    }

    return { lead }
  })

  fastify.post('/', async (request: any, reply) => {
    try {
      const body = leadSchema.parse(request.body)
      const lead = await prisma.lead.create({
        data: {
          ...body,
          email: body.email || null,
          usuarioId: request.user.id,
        },
      })
      return reply.status(201).send({ lead })
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
      const body = leadSchema.partial().parse(request.body)
      const lead = await prisma.lead.updateMany({
        where: { id: parseInt(id), usuarioId: request.user.id },
        data: body,
      })

      if (lead.count === 0) {
        return reply.status(404).send({ error: 'Lead não encontrado' })
      }

      const updated = await prisma.lead.findUnique({ where: { id: parseInt(id) } })
      return { lead: updated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    const result = await prisma.lead.deleteMany({
      where: { id: parseInt(id), usuarioId: request.user.id },
    })

    if (result.count === 0) {
      return reply.status(404).send({ error: 'Lead não encontrado' })
    }

    return { success: true }
  })
}
