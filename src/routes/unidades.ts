import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../utils/prisma.js'
import { z } from 'zod'

const unidadeUpdateSchema = z.object({
  tipologiaId: z.number().nullable().optional(),
  posicaoSolar: z.enum(['NASCENTE', 'POENTE', 'NORTE', 'SUL']).nullable().optional(),
  preco: z.number().positive().nullable().optional(),
  status: z.enum(['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'BLOQUEADO']).optional(),
  extras: z.any().optional(),
})

export async function unidadeRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Token inválido' })
    }
  })

  fastify.get('/torre/:torreId', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { torreId } = request.params as { torreId: string }

    const torre = await prisma.torre.findFirst({
      where: { id: parseInt(torreId) },
      include: { empreendimento: true },
    })

    if (!torre || torre.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Torre não encontrada' })
    }

    const unidades = await prisma.unidade.findMany({
      where: { torreId: parseInt(torreId) },
      include: { tipologia: true },
      orderBy: [{ andar: 'desc' }, { posicao: 'asc' }],
    })

    return reply.send(unidades)
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const unidade = await prisma.unidade.findFirst({
      where: { id: parseInt(id) },
      include: {
        tipologia: true,
        torre: {
          include: { empreendimento: true },
        },
        negociacoes: {
          include: { lead: true },
          orderBy: { criadoEm: 'desc' },
        },
      },
    })

    if (!unidade || unidade.torre.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Unidade não encontrada' })
    }

    return reply.send(unidade)
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }
    const body = unidadeUpdateSchema.parse(request.body)

    const unidade = await prisma.unidade.findFirst({
      where: { id: parseInt(id) },
      include: { tipologia: true, torre: { include: { empreendimento: true } } },
    })

    if (!unidade || unidade.torre.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Unidade não encontrada' })
    }

    const updateData: any = {}
    if (body.tipologiaId !== undefined) updateData.tipologiaId = body.tipologiaId
    if (body.posicaoSolar !== undefined) updateData.posicaoSolar = body.posicaoSolar
    if (body.preco !== undefined) updateData.preco = body.preco
    if (body.status !== undefined) updateData.status = body.status
    if (body.extras !== undefined) updateData.extras = body.extras

    if (body.preco && unidade.tipologia) {
      updateData.precoM2 = body.preco / Number(unidade.tipologia.areaPrivativa)
    }

    const updated = await prisma.unidade.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { tipologia: true },
    })

    return reply.send(updated)
  })

  fastify.patch('/:id/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }
    const body = z.object({
      status: z.enum(['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'BLOQUEADO']),
    }).parse(request.body)

    const unidade = await prisma.unidade.findFirst({
      where: { id: parseInt(id) },
      include: { torre: { include: { empreendimento: true } } },
    })

    if (!unidade || unidade.torre.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Unidade não encontrada' })
    }

    const updated = await prisma.unidade.update({
      where: { id: parseInt(id) },
      data: { status: body.status },
    })

    return reply.send(updated)
  })

  fastify.post('/bulk-update', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const body = z.object({
      unidadeIds: z.array(z.number()),
      tipologiaId: z.number().optional(),
      status: z.enum(['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'BLOQUEADO']).optional(),
      posicaoSolar: z.enum(['NASCENTE', 'POENTE', 'NORTE', 'SUL']).optional(),
    }).parse(request.body)

    const unidades = await prisma.unidade.findMany({
      where: { id: { in: body.unidadeIds } },
      include: { torre: { include: { empreendimento: true } } },
    })

    const allBelongToUser = unidades.every(u => u.torre.empreendimento.usuarioId === user.id)
    if (!allBelongToUser) {
      return reply.status(403).send({ error: 'Acesso negado a algumas unidades' })
    }

    const updateData: any = {}
    if (body.tipologiaId !== undefined) updateData.tipologiaId = body.tipologiaId
    if (body.status !== undefined) updateData.status = body.status
    if (body.posicaoSolar !== undefined) updateData.posicaoSolar = body.posicaoSolar

    await prisma.unidade.updateMany({
      where: { id: { in: body.unidadeIds } },
      data: updateData,
    })

    return reply.send({ success: true, updated: body.unidadeIds.length })
  })

  fastify.get('/disponiveis', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { empreendimentoId } = request.query as { empreendimentoId?: string }

    const where: any = {
      status: 'DISPONIVEL',
      torre: {
        empreendimento: { usuarioId: user.id },
      },
    }

    if (empreendimentoId) {
      where.torre.empreendimentoId = parseInt(empreendimentoId)
    }

    const unidades = await prisma.unidade.findMany({
      where,
      include: {
        tipologia: true,
        torre: {
          include: { empreendimento: { select: { id: true, nome: true } } },
        },
      },
      orderBy: [
        { torre: { empreendimento: { nome: 'asc' } } },
        { torre: { nome: 'asc' } },
        { andar: 'desc' },
      ],
    })

    return reply.send(unidades)
  })
}
