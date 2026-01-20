import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../utils/prisma.js'
import { z } from 'zod'

const empreendimentoSchema = z.object({
  nome: z.string().min(1),
  incorporadora: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  status: z.enum(['FUTURO_LANCAMENTO', 'EM_CONSTRUCAO', 'PRONTO']).optional(),
  dataLancamento: z.string().optional(),
  dataEntrega: z.string().optional(),
  comissaoPercentual: z.number().min(0).max(100).optional(),
  descricao: z.string().optional(),
  caracteristicas: z.any().optional(),
  fotos: z.array(z.string()).optional(),
})

export async function empreendimentoRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Token inválido' })
    }
  })

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { status, ativo } = request.query as { status?: string; ativo?: string }

    const where: any = { usuarioId: user.id }
    if (status) where.status = status
    if (ativo !== undefined) where.ativo = ativo === 'true'

    const empreendimentos = await prisma.empreendimento.findMany({
      where,
      include: {
        torres: {
          include: {
            _count: { select: { unidades: true } },
          },
        },
        tipologias: true,
        _count: {
          select: { torres: true, tipologias: true },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return reply.send(empreendimentos)
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const empreendimento = await prisma.empreendimento.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
      include: {
        torres: {
          include: {
            unidades: {
              include: { tipologia: true },
              orderBy: [{ andar: 'desc' }, { posicao: 'asc' }],
            },
          },
        },
        tipologias: true,
      },
    })

    if (!empreendimento) {
      return reply.status(404).send({ error: 'Empreendimento não encontrado' })
    }

    return reply.send(empreendimento)
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const body = empreendimentoSchema.parse(request.body)

    const empreendimento = await prisma.empreendimento.create({
      data: {
        usuarioId: user.id,
        nome: body.nome,
        incorporadora: body.incorporadora,
        endereco: body.endereco,
        cidade: body.cidade,
        bairro: body.bairro,
        status: body.status || 'EM_CONSTRUCAO',
        dataLancamento: body.dataLancamento ? new Date(body.dataLancamento) : null,
        dataEntrega: body.dataEntrega ? new Date(body.dataEntrega) : null,
        comissaoPercentual: body.comissaoPercentual || 5.0,
        descricao: body.descricao,
        caracteristicas: body.caracteristicas,
        fotos: body.fotos,
      },
    })

    return reply.status(201).send(empreendimento)
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }
    const body = empreendimentoSchema.partial().parse(request.body)

    const existing = await prisma.empreendimento.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Empreendimento não encontrado' })
    }

    const empreendimento = await prisma.empreendimento.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        dataLancamento: body.dataLancamento ? new Date(body.dataLancamento) : undefined,
        dataEntrega: body.dataEntrega ? new Date(body.dataEntrega) : undefined,
      },
    })

    return reply.send(empreendimento)
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const existing = await prisma.empreendimento.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Empreendimento não encontrado' })
    }

    await prisma.empreendimento.delete({ where: { id: parseInt(id) } })

    return reply.send({ success: true })
  })

  fastify.get('/:id/estatisticas', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const empreendimento = await prisma.empreendimento.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
    })

    if (!empreendimento) {
      return reply.status(404).send({ error: 'Empreendimento não encontrado' })
    }

    const unidades = await prisma.unidade.findMany({
      where: { torre: { empreendimentoId: parseInt(id) } },
      include: { tipologia: true },
    })

    const stats = {
      totalUnidades: unidades.length,
      disponiveis: unidades.filter(u => u.status === 'DISPONIVEL').length,
      reservados: unidades.filter(u => u.status === 'RESERVADO').length,
      vendidos: unidades.filter(u => u.status === 'VENDIDO').length,
      bloqueados: unidades.filter(u => u.status === 'BLOQUEADO').length,
      vgvTotal: unidades.reduce((acc, u) => acc + (Number(u.preco) || 0), 0),
      vgvVendido: unidades.filter(u => u.status === 'VENDIDO').reduce((acc, u) => acc + (Number(u.preco) || 0), 0),
    }

    return reply.send(stats)
  })
}
