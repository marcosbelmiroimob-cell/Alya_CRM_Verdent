import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { alyaCoach } from '../services/ai/alya.js'
import { geradorMensagens } from '../services/ai/mensagens.js'
import { qualificadorLeads } from '../services/ai/qualificador.js'

const chatSchema = z.object({
  negociacaoId: z.number(),
  mensagem: z.string().min(1),
})

const mensagemSchema = z.object({
  negociacaoId: z.number(),
  tipoMensagem: z.enum([
    'PRIMEIRO_CONTATO',
    'FOLLOW_UP',
    'CONVITE_VISITA',
    'PROPOSTA',
    'NEGOCIACAO',
    'POS_VENDA',
  ]),
  contextoAdicional: z.string().optional(),
})

const qualificarSchema = z.object({
  leadId: z.number(),
})

export async function iaRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.post('/chat', async (request: any, reply) => {
    try {
      const body = chatSchema.parse(request.body)

      const negociacao = await prisma.negociacao.findFirst({
        where: { id: body.negociacaoId, usuarioId: request.user.id },
        include: {
          lead: true,
          imovel: true,
          atividades: { orderBy: { dataAtividade: 'desc' }, take: 5 },
          historicosIA: { orderBy: { criadoEm: 'desc' }, take: 5 },
        },
      })

      if (!negociacao) {
        return reply.status(404).send({ error: 'Negociação não encontrada' })
      }

      const resposta = await alyaCoach(negociacao, body.mensagem)

      await prisma.historicoIA.create({
        data: {
          negociacaoId: body.negociacaoId,
          tipoAgente: 'ALYA_COACH',
          prompt: body.mensagem,
          resposta,
        },
      })

      return { resposta }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.post('/gerar-mensagem', async (request: any, reply) => {
    try {
      const body = mensagemSchema.parse(request.body)

      const negociacao = await prisma.negociacao.findFirst({
        where: { id: body.negociacaoId, usuarioId: request.user.id },
        include: {
          lead: true,
          imovel: true,
        },
      })

      if (!negociacao) {
        return reply.status(404).send({ error: 'Negociação não encontrada' })
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: request.user.id },
        select: { nome: true },
      })

      const mensagem = await geradorMensagens(negociacao, body.tipoMensagem, usuario!.nome, body.contextoAdicional)

      await prisma.historicoIA.create({
        data: {
          negociacaoId: body.negociacaoId,
          tipoAgente: 'GERADOR_MENSAGEM',
          prompt: `Tipo: ${body.tipoMensagem}`,
          resposta: mensagem,
        },
      })

      return { mensagem }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.post('/qualificar', async (request: any, reply) => {
    try {
      const body = qualificarSchema.parse(request.body)

      const lead = await prisma.lead.findFirst({
        where: { id: body.leadId, usuarioId: request.user.id },
        include: {
          negociacoes: {
            include: { imovel: true },
          },
        },
      })

      if (!lead) {
        return reply.status(404).send({ error: 'Lead não encontrado' })
      }

      const resultado = await qualificadorLeads(lead)

      await prisma.lead.update({
        where: { id: body.leadId },
        data: { scoreQualificacao: resultado.score },
      })

      return { qualificacao: resultado }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.get('/historico/:negociacaoId', async (request: any, reply) => {
    const { negociacaoId } = request.params as { negociacaoId: string }

    const negociacao = await prisma.negociacao.findFirst({
      where: { id: parseInt(negociacaoId), usuarioId: request.user.id },
    })

    if (!negociacao) {
      return reply.status(404).send({ error: 'Negociação não encontrada' })
    }

    const historico = await prisma.historicoIA.findMany({
      where: { negociacaoId: parseInt(negociacaoId) },
      orderBy: { criadoEm: 'desc' },
      take: 50,
    })

    return { historico }
  })
}
