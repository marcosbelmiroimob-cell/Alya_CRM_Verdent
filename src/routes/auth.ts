import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'

const registroSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  telefone: z.string().optional(),
  creci: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/registro', async (request, reply) => {
    try {
      const body = registroSchema.parse(request.body)
      
      const existente = await prisma.usuario.findUnique({
        where: { email: body.email },
      })

      if (existente) {
        return reply.status(400).send({ error: 'Email já cadastrado' })
      }

      const senhaHash = await bcrypt.hash(body.senha, 12)

      const usuario = await prisma.usuario.create({
        data: {
          nome: body.nome,
          email: body.email,
          senhaHash,
          telefone: body.telefone,
          creci: body.creci,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          creci: true,
          plano: true,
          criadoEm: true,
        },
      })

      const token = fastify.jwt.sign(
        { id: usuario.id, email: usuario.email },
        { expiresIn: '7d' }
      )

      return { usuario, token }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body)

      const usuario = await prisma.usuario.findUnique({
        where: { email: body.email },
      })

      if (!usuario) {
        return reply.status(401).send({ error: 'Email ou senha incorretos' })
      }

      const senhaValida = await bcrypt.compare(body.senha, usuario.senhaHash)

      if (!senhaValida) {
        return reply.status(401).send({ error: 'Email ou senha incorretos' })
      }

      const token = fastify.jwt.sign(
        { id: usuario.id, email: usuario.email },
        { expiresIn: '7d' }
      )

      return {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          creci: usuario.creci,
          plano: usuario.plano,
          avatar: usuario.avatar,
        },
        token,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message })
      }
      throw error
    }
  })

  fastify.get('/me', {
    preHandler: [fastify.authenticate],
  }, async (request: any) => {
    const usuario = await prisma.usuario.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        creci: true,
        plano: true,
        avatar: true,
        criadoEm: true,
      },
    })

    return { usuario }
  })
}
