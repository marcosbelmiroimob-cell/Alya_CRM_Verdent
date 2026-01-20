import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './routes/auth.js'
import { leadRoutes } from './routes/leads.js'
import { imovelRoutes } from './routes/imoveis.js'
import { negociacaoRoutes } from './routes/negociacoes.js'
import { financeiroRoutes } from './routes/financeiro.js'
import { iaRoutes } from './routes/ia.js'
import { atividadeRoutes } from './routes/atividades.js'
import { dashboardRoutes } from './routes/dashboard.js'

async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  })

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  })

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  })

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Token inválido ou expirado' })
    }
  })

  fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(leadRoutes, { prefix: '/api/leads' })
  await fastify.register(imovelRoutes, { prefix: '/api/imoveis' })
  await fastify.register(negociacaoRoutes, { prefix: '/api/negociacoes' })
  await fastify.register(financeiroRoutes, { prefix: '/api/financeiro' })
  await fastify.register(iaRoutes, { prefix: '/api/ia' })
  await fastify.register(atividadeRoutes, { prefix: '/api/atividades' })
  await fastify.register(dashboardRoutes, { prefix: '/api/dashboard' })

  const port = parseInt(process.env.PORT || '3001')
  
  try {
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Servidor Alya rodando na porta ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

bootstrap()
