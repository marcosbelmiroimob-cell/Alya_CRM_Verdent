import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import fastifyStatic from '@fastify/static'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import { authRoutes } from './routes/auth.js'
import { leadRoutes } from './routes/leads.js'
import { imovelRoutes } from './routes/imoveis.js'
import { negociacaoRoutes } from './routes/negociacoes.js'
import { financeiroRoutes } from './routes/financeiro.js'
import { iaRoutes } from './routes/ia.js'
import { alyaRoutes } from './routes/alya.js'
import { atividadeRoutes } from './routes/atividades.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { empreendimentoRoutes } from './routes/empreendimentos.js'
import { torreRoutes } from './routes/torres.js'
import { tipologiaRoutes } from './routes/tipologias.js'
import { unidadeRoutes } from './routes/unidades.js'
import { imovelUsadoRoutes } from './routes/imoveis-usados.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Validação de variáveis de ambiente obrigatórias
function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    console.error('\nConfigure essas variáveis no arquivo .env antes de iniciar.')
    process.exit(1)
  }

  // Validações de segurança
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn('⚠️  AVISO: Nenhuma API key de IA configurada (GEMINI ou OPENAI)')
    }

    if (process.env.JWT_SECRET === 'dev-secret-change-in-production') {
      console.error('❌ ERRO: JWT_SECRET ainda está com valor padrão em produção!')
      process.exit(1)
    }

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.error('❌ ERRO: JWT_SECRET deve ter no mínimo 32 caracteres em produção')
      process.exit(1)
    }
  }

  console.log('✅ Variáveis de ambiente validadas com sucesso')
}

async function bootstrap() {
  validateEnvironment()
  const fastify = Fastify({
    logger: true,
  })

  // CORS: Whitelist em produção, permissivo em desenvolvimento
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL?.split(',') || ['https://alyacrm.com.br'])
    : true

  await fastify.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  })

  fastify.log.info(`CORS configurado - Origens: ${
    allowedOrigins === true ? 'Todas (desenvolvimento)' : allowedOrigins
  }`)

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
  await fastify.register(alyaRoutes, { prefix: '/api/alya' })
  await fastify.register(atividadeRoutes, { prefix: '/api/atividades' })
  await fastify.register(dashboardRoutes, { prefix: '/api/dashboard' })
  await fastify.register(empreendimentoRoutes, { prefix: '/api/empreendimentos' })
  await fastify.register(torreRoutes, { prefix: '/api/torres' })
  await fastify.register(tipologiaRoutes, { prefix: '/api/tipologias' })
  await fastify.register(unidadeRoutes, { prefix: '/api/unidades' })
  await fastify.register(imovelUsadoRoutes, { prefix: '/api/imoveis-usados' })

  const publicPath = join(__dirname, '..', 'public')
  
  if (existsSync(publicPath)) {
    await fastify.register(fastifyStatic, {
      root: publicPath,
      prefix: '/',
    })

    fastify.setNotFoundHandler(async (request, reply) => {
      if (request.url.startsWith('/api')) {
        return reply.status(404).send({ error: 'Rota não encontrada' })
      }
      return reply.sendFile('index.html')
    })
  }

  const port = parseInt(process.env.PORT || '3000')
  
  try {
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Servidor Alya rodando na porta ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

bootstrap()
