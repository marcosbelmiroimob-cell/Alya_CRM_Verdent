import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'

const atividadeSchema = z.object({
  negociacaoId: z.number(),
  tipo: z.enum(['LIGACAO', 'WHATSAPP', 'EMAIL', 'VISITA', 'REUNIAO', 'PROPOSTA', 'OUTRO']),
  descricao: z.string().min(1),
  dataAtividade: z.string(),
  concluida: z.boolean().optional(),
})

export async function atividadeRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/negociacao/:negociacaoId', async (request: any, reply) => {
    const { negociacaoId } = request.params as { negociacaoId: string }

    const negociacao = await prisma.negociacao.findFirst({
      where: { id: parseInt(negociacaoId), usuarioId: request.user.id },
    })

    if (!negociacao) {
      return reply.status(404).send({ error: 'Negociacao nao encontrada' })
    }

    const atividades = await prisma.atividade.findMany({
      where: { negociacaoId: parseInt(negociacaoId) },
      orderBy: { dataAtividade: 'desc' },
    })

    return { atividades }
  })

  fastify.post('/', async (request: any, reply) => {
    try {
      const body = atividadeSchema.parse(request.body)

      const negociacao = await prisma.negociacao.findFirst({
        where: { id: body.negociacaoId, usuarioId: request.user.id },
      })

      if (!negociacao) {
        return reply.status(404).send({ error: 'Negociacao nao encontrada' })
      }

      const atividade = await prisma.atividade.create({
        data: {
          negociacaoId: body.negociacaoId,
          tipo: body.tipo,
          descricao: body.descricao,
          dataAtividade: new Date(body.dataAtividade),
          concluida: body.concluida || false,
        },
      })

      return reply.status(201).send({ atividade })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.patch('/:id/concluir', async (request: any, reply) => {
    const { id } = request.params as { id: string }

    const atividade = await prisma.atividade.findUnique({
      where: { id: parseInt(id) },
      include: { negociacao: true },
    })

    if (!atividade || atividade.negociacao.usuarioId !== request.user.id) {
      return reply.status(404).send({ error: 'Atividade nao encontrada' })
    }

    const updated = await prisma.atividade.update({
      where: { id: parseInt(id) },
      data: { concluida: !atividade.concluida },
    })

    return { atividade: updated }
  })

  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }

    const atividade = await prisma.atividade.findUnique({
      where: { id: parseInt(id) },
      include: { negociacao: true },
    })

    if (!atividade || atividade.negociacao.usuarioId !== request.user.id) {
      return reply.status(404).send({ error: 'Atividade nao encontrada' })
    }

    await prisma.atividade.delete({ where: { id: parseInt(id) } })

    return { success: true }
  })
}
