import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../utils/prisma.js'
import { z } from 'zod'

const tipologiaSchema = z.object({
  empreendimentoId: z.number(),
  nome: z.string().min(1),
  areaPrivativa: z.number().positive(),
  quartos: z.number().min(0).optional(),
  suites: z.number().min(0).optional(),
  vagas: z.number().min(0).optional(),
  precoBase: z.number().positive(),
  diferenciais: z.array(z.string()).optional(),
})

export async function tipologiaRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Token inválido' })
    }
  })

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { empreendimentoId } = request.query as { empreendimentoId?: string }

    if (!empreendimentoId) {
      return reply.status(400).send({ error: 'empreendimentoId é obrigatório' })
    }

    const empreendimento = await prisma.empreendimento.findFirst({
      where: { id: parseInt(empreendimentoId), usuarioId: user.id },
    })

    if (!empreendimento) {
      return reply.status(404).send({ error: 'Empreendimento não encontrado' })
    }

    const tipologias = await prisma.tipologia.findMany({
      where: { empreendimentoId: parseInt(empreendimentoId) },
      include: {
        _count: { select: { unidades: true } },
      },
      orderBy: { nome: 'asc' },
    })

    return reply.send({ tipologias })
  })

  fastify.get('/empreendimento/:empreendimentoId', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { empreendimentoId } = request.params as { empreendimentoId: string }

    const empreendimento = await prisma.empreendimento.findFirst({
      where: { id: parseInt(empreendimentoId), usuarioId: user.id },
    })

    if (!empreendimento) {
      return reply.status(404).send({ error: 'Empreendimento não encontrado' })
    }

    const tipologias = await prisma.tipologia.findMany({
      where: { empreendimentoId: parseInt(empreendimentoId) },
      include: {
        _count: { select: { unidades: true } },
      },
      orderBy: { nome: 'asc' },
    })

    return reply.send(tipologias)
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const tipologia = await prisma.tipologia.findFirst({
      where: { id: parseInt(id) },
      include: {
        empreendimento: true,
        unidades: {
          select: { id: true, codigo: true, andar: true, status: true, preco: true },
        },
      },
    })

    if (!tipologia || tipologia.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Tipologia não encontrada' })
    }

    return reply.send(tipologia)
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const body = tipologiaSchema.parse(request.body)

    const empreendimento = await prisma.empreendimento.findFirst({
      where: { id: body.empreendimentoId, usuarioId: user.id },
    })

    if (!empreendimento) {
      return reply.status(404).send({ error: 'Empreendimento não encontrado' })
    }

    const tipologia = await prisma.tipologia.create({
      data: {
        empreendimentoId: body.empreendimentoId,
        nome: body.nome,
        areaPrivativa: body.areaPrivativa,
        quartos: body.quartos || 0,
        suites: body.suites || 0,
        vagas: body.vagas || 0,
        precoBase: body.precoBase,
        diferenciais: body.diferenciais,
      },
    })

    return reply.status(201).send(tipologia)
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }
    const body = tipologiaSchema.partial().parse(request.body)

    const tipologia = await prisma.tipologia.findFirst({
      where: { id: parseInt(id) },
      include: { empreendimento: true },
    })

    if (!tipologia || tipologia.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Tipologia não encontrada' })
    }

    const updated = await prisma.tipologia.update({
      where: { id: parseInt(id) },
      data: body,
    })

    return reply.send(updated)
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const tipologia = await prisma.tipologia.findFirst({
      where: { id: parseInt(id) },
      include: { empreendimento: true },
    })

    if (!tipologia || tipologia.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Tipologia não encontrada' })
    }

    await prisma.tipologia.delete({ where: { id: parseInt(id) } })

    return reply.send({ success: true })
  })

  fastify.post('/:id/aplicar-unidades', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }
    const body = z.object({
      unidadeIds: z.array(z.number()),
      atualizarPreco: z.boolean().optional(),
    }).parse(request.body)

    const tipologia = await prisma.tipologia.findFirst({
      where: { id: parseInt(id) },
      include: { empreendimento: true },
    })

    if (!tipologia || tipologia.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Tipologia não encontrada' })
    }

    const updateData: any = { tipologiaId: parseInt(id) }
    if (body.atualizarPreco) {
      updateData.preco = tipologia.precoBase
    }

    await prisma.unidade.updateMany({
      where: { id: { in: body.unidadeIds } },
      data: updateData,
    })

    return reply.send({ success: true, updated: body.unidadeIds.length })
  })
}
