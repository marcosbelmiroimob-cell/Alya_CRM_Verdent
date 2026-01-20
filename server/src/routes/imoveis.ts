import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'

const imovelSchema = z.object({
  tipoNegocio: z.enum(['LANCAMENTO', 'TERCEIROS']),
  titulo: z.string().min(3),
  descricao: z.string().optional(),
  valor: z.number().positive(),
  comissaoPercentual: z.number().min(0).max(100),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  caracteristicas: z.any().optional(),
  fotos: z.array(z.string()).optional(),
  construtora: z.string().optional(),
  nomeProprietario: z.string().optional(),
  telefoneProprietario: z.string().optional(),
})

export async function imovelRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', async (request: any) => {
    const { tipo, ativo } = request.query as { tipo?: string; ativo?: string }
    
    const where: any = { usuarioId: request.user.id }
    if (tipo) where.tipoNegocio = tipo
    if (ativo !== undefined) where.ativo = ativo === 'true'

    const imoveis = await prisma.imovel.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
    })
    return { imoveis }
  })

  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    const imovel = await prisma.imovel.findFirst({
      where: { id: parseInt(id), usuarioId: request.user.id },
      include: {
        negociacoes: {
          include: {
            lead: { select: { nome: true, telefone: true } },
          },
          orderBy: { criadoEm: 'desc' },
        },
      },
    })

    if (!imovel) {
      return reply.status(404).send({ error: 'Imóvel não encontrado' })
    }

    return { imovel }
  })

  fastify.post('/', async (request: any, reply) => {
    try {
      const body = imovelSchema.parse(request.body)
      const imovel = await prisma.imovel.create({
        data: {
          ...body,
          usuarioId: request.user.id,
        },
      })
      return reply.status(201).send({ imovel })
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
      const body = imovelSchema.partial().parse(request.body)
      const result = await prisma.imovel.updateMany({
        where: { id: parseInt(id), usuarioId: request.user.id },
        data: body,
      })

      if (result.count === 0) {
        return reply.status(404).send({ error: 'Imóvel não encontrado' })
      }

      const updated = await prisma.imovel.findUnique({ where: { id: parseInt(id) } })
      return { imovel: updated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params as { id: string }
    const result = await prisma.imovel.deleteMany({
      where: { id: parseInt(id), usuarioId: request.user.id },
    })

    if (result.count === 0) {
      return reply.status(404).send({ error: 'Imóvel não encontrado' })
    }

    return { success: true }
  })
}
