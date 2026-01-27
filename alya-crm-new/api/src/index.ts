import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { config } from 'dotenv'
import { webhookRoutes } from './routes/webhooks.js'

config()

// Validação de variáveis de ambiente obrigatórias
function validateEnvironment() {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'API_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    console.error('\nConfigure essas variáveis no arquivo .env antes de iniciar.')
    process.exit(1)
  }

  console.log('✅ Variáveis de ambiente validadas')
}

validateEnvironment()

const PORT = parseInt(process.env.PORT || '3001', 10)
const HOST = process.env.HOST || '0.0.0.0'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
})

async function main() {
  // CORS: Configuração segura com fallback
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : (process.env.NODE_ENV === 'production'
        ? ['https://alyacrm.com.br']
        : ['*'])

  await fastify.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization']
  })

  fastify.log.info(`CORS: ${allowedOrigins.join(', ')}`)

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.'
    })
  })

  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'alya-crm-api'
  }))

  fastify.get('/', async () => ({
    name: 'Alya CRM API',
    version: '1.0.0',
    docs: '/api/v1/leads/webhook',
    health: '/health'
  }))

  await fastify.register(webhookRoutes)

  try {
    await fastify.listen({ port: PORT, host: HOST })
    console.log(`
╔════════════════════════════════════════════════════════╗
║         ALYA CRM API - Webhook Server                  ║
╠════════════════════════════════════════════════════════╣
║  Status:    Running                                    ║
║  Port:      ${PORT}                                        ║
║  Host:      ${HOST}                                   ║
║  Health:    http://${HOST}:${PORT}/health                   ║
║  Webhook:   POST /api/v1/leads/webhook                 ║
╚════════════════════════════════════════════════════════╝
    `)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

main()
