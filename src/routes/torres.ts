import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../utils/prisma.js'
import { z } from 'zod'

const torreSchema = z.object({
  empreendimentoId: z.number(),
  nome: z.string().min(1),
  totalAndares: z.number().min(1),
  unidadesPorAndar: z.number().min(1),
})

function gerarCodigoUnidade(torreNome: string, andar: number, posicaoIndex: number): string {
  const torreNum = torreNome.match(/\d+/)?.[0] || '1'
  const andarStr = andar.toString().padStart(2, '0')
  const posicaoStr = (posicaoIndex + 1).toString().padStart(2, '0')
  return `${torreNum}${andarStr}${posicaoStr}`
}

function getPosicaoLetra(index: number): string {
  return String.fromCharCode(65 + index)
}

export async function torreRoutes(fastify: FastifyInstance) {
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

    const torres = await prisma.torre.findMany({
      where: { empreendimentoId: parseInt(empreendimentoId) },
      include: {
        _count: { select: { unidades: true } },
        unidades: {
          select: { status: true },
        },
      },
      orderBy: { nome: 'asc' },
    })

    const torresComStats = torres.map((torre: any) => ({
      ...torre,
      stats: {
        total: torre.unidades.length,
        disponiveis: torre.unidades.filter((u: any) => u.status === 'DISPONIVEL').length,
        reservados: torre.unidades.filter((u: any) => u.status === 'RESERVADO').length,
        vendidos: torre.unidades.filter((u: any) => u.status === 'VENDIDO').length,
        bloqueados: torre.unidades.filter((u: any) => u.status === 'BLOQUEADO').length,
      },
      unidades: undefined,
    }))

    return reply.send({ torres: torresComStats })
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

    const torres = await prisma.torre.findMany({
      where: { empreendimentoId: parseInt(empreendimentoId) },
      include: {
        _count: { select: { unidades: true } },
        unidades: {
          select: { status: true },
        },
      },
      orderBy: { nome: 'asc' },
    })

    const torresComStats = torres.map(torre => ({
      ...torre,
      stats: {
        total: torre.unidades.length,
        disponiveis: torre.unidades.filter(u => u.status === 'DISPONIVEL').length,
        reservados: torre.unidades.filter(u => u.status === 'RESERVADO').length,
        vendidos: torre.unidades.filter(u => u.status === 'VENDIDO').length,
        bloqueados: torre.unidades.filter(u => u.status === 'BLOQUEADO').length,
      },
      unidades: undefined,
    }))

    return reply.send(torresComStats)
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const torre = await prisma.torre.findFirst({
      where: { id: parseInt(id) },
      include: {
        empreendimento: true,
        unidades: {
          include: { tipologia: true },
          orderBy: [{ andar: 'desc' }, { posicao: 'asc' }],
        },
      },
    })

    if (!torre || torre.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Torre não encontrada' })
    }

    return reply.send(torre)
  })

  fastify.get('/:id/grid', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const torre = await prisma.torre.findFirst({
      where: { id: parseInt(id) },
      include: {
        empreendimento: true,
        unidades: {
          include: { 
            tipologia: true,
            negociacoes: {
              where: { etapaKanban: { notIn: ['VENDIDO', 'PERDIDO'] } },
              take: 1,
            },
          },
          orderBy: [{ andar: 'desc' }, { posicao: 'asc' }],
        },
      },
    })

    if (!torre || torre.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Torre não encontrada' })
    }

    const grid: Record<number, any[]> = {}
    for (let andar = torre.totalAndares; andar >= 1; andar--) {
      grid[andar] = torre.unidades.filter(u => u.andar === andar)
    }

    return reply.send({
      torre: {
        id: torre.id,
        nome: torre.nome,
        totalAndares: torre.totalAndares,
        unidadesPorAndar: torre.unidadesPorAndar,
      },
      empreendimento: {
        id: torre.empreendimento.id,
        nome: torre.empreendimento.nome,
      },
      grid,
    })
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const body = torreSchema.parse(request.body)

    const empreendimento = await prisma.empreendimento.findFirst({
      where: { id: body.empreendimentoId, usuarioId: user.id },
    })

    if (!empreendimento) {
      return reply.status(404).send({ error: 'Empreendimento não encontrado' })
    }

    const torre = await prisma.torre.create({
      data: {
        empreendimentoId: body.empreendimentoId,
        nome: body.nome,
        totalAndares: body.totalAndares,
        unidadesPorAndar: body.unidadesPorAndar,
      },
    })

    const unidadesData = []
    for (let andar = 1; andar <= body.totalAndares; andar++) {
      for (let posIndex = 0; posIndex < body.unidadesPorAndar; posIndex++) {
        unidadesData.push({
          torreId: torre.id,
          codigo: gerarCodigoUnidade(body.nome, andar, posIndex),
          andar,
          posicao: getPosicaoLetra(posIndex),
          status: 'DISPONIVEL' as const,
        })
      }
    }

    await prisma.unidade.createMany({ data: unidadesData })

    const torreCompleta = await prisma.torre.findUnique({
      where: { id: torre.id },
      include: { _count: { select: { unidades: true } } },
    })

    return reply.status(201).send(torreCompleta)
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }
    const body = z.object({
      nome: z.string().optional(),
    }).parse(request.body)

    const torre = await prisma.torre.findFirst({
      where: { id: parseInt(id) },
      include: { empreendimento: true },
    })

    if (!torre || torre.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Torre não encontrada' })
    }

    const updated = await prisma.torre.update({
      where: { id: parseInt(id) },
      data: body,
    })

    return reply.send(updated)
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const torre = await prisma.torre.findFirst({
      where: { id: parseInt(id) },
      include: { empreendimento: true },
    })

    if (!torre || torre.empreendimento.usuarioId !== user.id) {
      return reply.status(404).send({ error: 'Torre não encontrada' })
    }

    await prisma.torre.delete({ where: { id: parseInt(id) } })

    return reply.send({ success: true })
  })
}
