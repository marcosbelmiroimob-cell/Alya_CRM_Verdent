import { FastifyRequest, FastifyReply } from 'fastify'

export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers['x-api-key']
  const validApiKey = process.env.WEBHOOK_API_KEY

  if (!validApiKey) {
    console.error('WEBHOOK_API_KEY not configured')
    return reply.status(500).send({
      success: false,
      error: 'Server configuration error'
    })
  }

  if (!apiKey) {
    return reply.status(401).send({
      success: false,
      error: 'API key required',
      message: 'Include X-API-Key header'
    })
  }

  if (apiKey !== validApiKey) {
    return reply.status(401).send({
      success: false,
      error: 'Invalid API key'
    })
  }
}
