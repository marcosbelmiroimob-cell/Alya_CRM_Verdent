import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { qualificarLead, calcularScoreQualificacao } from '../services/ai/qualificadorHumanizado.js'
import { assistenteChat, buscarDadosCRM } from '../services/ai/assistenteGlobal.js'

const chatSchema = z.object({
  mensagem: z.string().min(1),
  contexto: z.string().optional(),
  paginaAtual: z.string().optional(),
})

const qualificarSchema = z.object({
  mensagem: z.string().min(1),
  conversaId: z.number().nullable().optional(),
  leadId: z.number().optional(),
})

export async function alyaRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.post('/chat', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const body = chatSchema.parse(request.body)

    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: user.id },
        select: { nome: true },
      })

      const resposta = await assistenteChat(body.mensagem, {
        usuarioId: user.id,
        pagina: body.paginaAtual || 'desconhecida',
        contexto: body.contexto || 'geral',
      })

      return { resposta }
    } catch (error) {
      console.error('Erro no chat Alya:', error)
      return reply.status(500).send({ error: 'Erro ao processar mensagem' })
    }
  })

  fastify.post('/qualificar', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const body = qualificarSchema.parse(request.body)

    try {
      let conversa
      let historicoMensagens: Array<{ remetente: string; conteudo: string }> = []

      if (body.conversaId) {
        conversa = await prisma.conversaAlya.findFirst({
          where: { id: body.conversaId, usuarioId: user.id },
          include: { mensagens: { orderBy: { criadoEm: 'asc' } } },
        })

        if (conversa) {
          historicoMensagens = conversa.mensagens.map(m => ({
            remetente: m.remetente,
            conteudo: m.conteudo,
          }))
        }
      }

      if (!conversa) {
        conversa = await prisma.conversaAlya.create({
          data: {
            usuarioId: user.id,
            leadId: body.leadId || null,
            tipo: 'QUALIFICACAO',
            status: 'ATIVA',
          },
        })
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: user.id },
        select: { nome: true },
      })

      await prisma.mensagemAlya.create({
        data: {
          conversaId: conversa.id,
          remetente: 'lead',
          conteudo: body.mensagem,
        },
      })

      const resultado = await qualificarLead(body.mensagem, {
        nomeCorretor: usuario?.nome || 'Corretor',
        historicoMensagens,
        perfilColetado: (conversa.perfilColetado as object) || {},
      })

      await prisma.mensagemAlya.create({
        data: {
          conversaId: conversa.id,
          remetente: 'alya',
          conteudo: resultado.resposta,
        },
      })

      const score = await calcularScoreQualificacao(resultado.perfilAtualizado)

      await prisma.conversaAlya.update({
        where: { id: conversa.id },
        data: {
          perfilColetado: resultado.perfilAtualizado,
          scoreQualificacao: score,
          status: resultado.qualificacaoCompleta ? 'FINALIZADA' : 'ATIVA',
          finalizadoEm: resultado.qualificacaoCompleta ? new Date() : null,
        },
      })

      return {
        resposta: resultado.resposta,
        conversaId: conversa.id,
        perfilColetado: resultado.perfilAtualizado,
        scoreQualificacao: score,
        qualificacaoCompleta: resultado.qualificacaoCompleta,
      }
    } catch (error) {
      console.error('Erro na qualificacao:', error)
      return reply.status(500).send({ error: 'Erro ao qualificar lead' })
    }
  })

  fastify.get('/sugestoes', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }

    try {
      const sugestoes = []

      const followUpsPendentes = await prisma.negociacao.findMany({
        where: {
          usuarioId: user.id,
          etapaKanban: { notIn: ['VENDIDO', 'PERDIDO'] },
          proximoContato: { lte: new Date() },
        },
        include: { lead: { select: { nome: true } } },
        take: 3,
      })

      for (const neg of followUpsPendentes) {
        sugestoes.push({
          id: `follow_up_${neg.id}`,
          tipo: 'follow_up',
          titulo: `Follow-up pendente`,
          descricao: `${neg.lead.nome} esta aguardando seu contato`,
          negociacaoId: neg.id,
        })
      }

      const leadsNovos = await prisma.lead.findMany({
        where: {
          usuarioId: user.id,
          criadoEm: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          negociacoes: { none: {} },
        },
        take: 2,
      })

      for (const lead of leadsNovos) {
        sugestoes.push({
          id: `novo_lead_${lead.id}`,
          tipo: 'dica',
          titulo: `Novo lead sem negociacao`,
          descricao: `${lead.nome} entrou ontem e ainda nao tem negociacao`,
          leadId: lead.id,
        })
      }

      return { sugestoes }
    } catch (error) {
      console.error('Erro ao buscar sugestoes:', error)
      return { sugestoes: [] }
    }
  })

  fastify.get('/conversas', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { status } = request.query as { status?: string }

    const where: any = { usuarioId: user.id }
    if (status) where.status = status

    const conversas = await prisma.conversaAlya.findMany({
      where,
      orderBy: { atualizadoEm: 'desc' },
      take: 20,
      include: {
        mensagens: {
          orderBy: { criadoEm: 'desc' },
          take: 1,
        },
      },
    })

    return { conversas }
  })

  fastify.get('/conversa/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const { id } = request.params as { id: string }

    const conversa = await prisma.conversaAlya.findFirst({
      where: { id: parseInt(id), usuarioId: user.id },
      include: {
        mensagens: { orderBy: { criadoEm: 'asc' } },
      },
    })

    if (!conversa) {
      return reply.status(404).send({ error: 'Conversa nao encontrada' })
    }

    return { conversa }
  })

  fastify.post('/criar-lead-qualificado', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: number }
    const body = z.object({
      conversaId: z.number(),
      nome: z.string().optional(),
    }).parse(request.body)

    const conversa = await prisma.conversaAlya.findFirst({
      where: { id: body.conversaId, usuarioId: user.id },
    })

    if (!conversa) {
      return reply.status(404).send({ error: 'Conversa nao encontrada' })
    }

    const perfil = (conversa.perfilColetado as any) || {}

    const lead = await prisma.lead.create({
      data: {
        usuarioId: user.id,
        nome: body.nome || perfil.nome || 'Lead Qualificado',
        telefone: perfil.telefone || null,
        email: perfil.email || null,
        origem: 'Alya - Qualificacao',
        scoreQualificacao: conversa.scoreQualificacao || 0,
        perfilComprador: perfil,
      },
    })

    await prisma.conversaAlya.update({
      where: { id: conversa.id },
      data: { leadId: lead.id },
    })

    return { lead }
  })
}
