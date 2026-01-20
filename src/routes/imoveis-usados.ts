import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../utils/prisma.js'
import { z } from 'zod'

const imovelUsadoSchema = z.object({
  tipoImovel: z.enum(['APARTAMENTO', 'CASA', 'TERRENO', 'SALA_COMERCIAL', 'COBERTURA', 'LOFT']),
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  areaUtil: z.number().positive().optional(),
  areaTotal: z.number().positive().optional(),
  quartos: z.number().min(0).optional(),
  suites: z.number().min(0).optional(),
  vagas: z.number().min(0).optional(),
  valorAvaliacao: z.number().positive().optional(),
  valorVenda: z.number().positive(),
  comissaoPercentual: z.number().min(0).max(100).optional(),
  documentacao: z.enum(['ESCRITURADO', 'FINANCIADO', 'INVENTARIO', 'IRREGULAR']).optional(),
  nomeProprietario: z.string().optional(),
  telefoneProprietario: z.string().optional(),
  emailProprietario: z.string().email().optional().or(z.literal('')),
  caracteristicas: z.array(z.string()).optional(),
  fotos: z.array(z.string()).optional(),
})

export async function imovelUsadoRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Token inválido' })
    }
  })

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { tipoImovel, ativo, cidade, bairro } = request.query as {
      tipoImovel?: string
      ativo?: string
      cidade?: string
      bairro?: string
    }

    const where: any = { usuarioId: user.id }
    if (tipoImovel) where.tipoImovel = tipoImovel
    if (ativo !== undefined) where.ativo = ativo === 'true'
    if (cidade) where.cidade = { contains: cidade }
    if (bairro) where.bairro = { contains: bairro }

    const imoveis = await prisma.imovelUsado.findMany({
      where,
      include: {
        _count: { select: { negociacoes: true } },
      },
      orderBy: { criadoEm: 'desc' },
    })

    return reply.send({ imoveisUsados: imoveis })
  })

  fastify.get('/ativos', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }

    const imoveis = await prisma.imovelUsado.findMany({
      where: { usuarioId: user.id, ativo: true },
      select: {
        id: true,
        titulo: true,
        tipoImovel: true,
        valorVenda: true,
        cidade: true,
        bairro: true,
        quartos: true,
        areaUtil: true,
      },
      orderBy: { titulo: 'asc' },
    })

    return reply.send({ imoveisUsados: imoveis })
  })

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const imovel = await prisma.imovelUsado.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
      include: {
        negociacoes: {
          include: { lead: true },
          orderBy: { criadoEm: 'desc' },
        },
      },
    })

    if (!imovel) {
      return reply.status(404).send({ error: 'Imóvel não encontrado' })
    }

    return reply.send(imovel)
  })

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const body = imovelUsadoSchema.parse(request.body)

    const imovel = await prisma.imovelUsado.create({
      data: {
        usuarioId: user.id,
        tipoImovel: body.tipoImovel,
        titulo: body.titulo,
        descricao: body.descricao,
        endereco: body.endereco,
        cidade: body.cidade,
        bairro: body.bairro,
        areaUtil: body.areaUtil,
        areaTotal: body.areaTotal,
        quartos: body.quartos || 0,
        suites: body.suites || 0,
        vagas: body.vagas || 0,
        valorAvaliacao: body.valorAvaliacao,
        valorVenda: body.valorVenda,
        comissaoPercentual: body.comissaoPercentual || 6.0,
        documentacao: body.documentacao || 'ESCRITURADO',
        nomeProprietario: body.nomeProprietario,
        telefoneProprietario: body.telefoneProprietario,
        emailProprietario: body.emailProprietario || null,
        caracteristicas: body.caracteristicas,
        fotos: body.fotos,
      },
    })

    return reply.status(201).send(imovel)
  })

  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }
    const body = imovelUsadoSchema.partial().parse(request.body)

    const existing = await prisma.imovelUsado.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Imóvel não encontrado' })
    }

    const imovel = await prisma.imovelUsado.update({
      where: { id: parseInt(id) },
      data: body,
    })

    return reply.send(imovel)
  })

  fastify.patch('/:id/ativo', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }
    const body = z.object({ ativo: z.boolean() }).parse(request.body)

    const existing = await prisma.imovelUsado.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Imóvel não encontrado' })
    }

    const imovel = await prisma.imovelUsado.update({
      where: { id: parseInt(id) },
      data: { ativo: body.ativo },
    })

    return reply.send(imovel)
  })

  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const existing = await prisma.imovelUsado.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Imóvel não encontrado' })
    }

    await prisma.imovelUsado.delete({ where: { id: parseInt(id) } })

    return reply.send({ success: true })
  })
}
