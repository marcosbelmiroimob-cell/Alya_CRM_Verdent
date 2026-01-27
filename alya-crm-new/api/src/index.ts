import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { config } from 'dotenv'
import { webhookRoutes } from './routes/webhooks.js'

config()

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
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization']
  })

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
