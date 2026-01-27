import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { apiKeyAuth } from '../middleware/apiKeyAuth.js'
import { createLeadFromWebhook, getDefaultUserId } from '../services/leadService.js'

const webhookLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  source: z.string().min(1, 'Source is required'),
  campaign: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  budget_min: z.number().optional().nullable(),
  budget_max: z.number().optional().nullable(),
  user_id: z.string().uuid().optional(),
})

type WebhookLeadBody = z.infer<typeof webhookLeadSchema>

export async function webhookRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', apiKeyAuth)

  fastify.post<{ Body: WebhookLeadBody }>('/api/v1/leads/webhook', async (request, reply) => {
    try {
      const validation = webhookLeadSchema.safeParse(request.body)
      
      if (!validation.success) {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        })
      }

      const body = validation.data
      
      let userId = body.user_id
      if (!userId) {
        userId = await getDefaultUserId() || undefined
        if (!userId) {
          return reply.status(400).send({
            success: false,
            error: 'No user_id provided and no default user found'
          })
        }
      }

      const result = await createLeadFromWebhook({
        name: body.name,
        email: body.email || undefined,
        phone: body.phone || undefined,
        source: body.source,
        campaign: body.campaign || undefined,
        message: body.message || undefined,
        budget_min: body.budget_min || undefined,
        budget_max: body.budget_max || undefined,
        user_id: userId
      })

      if (!result.success) {
        return reply.status(500).send({
          success: false,
          error: result.error || 'Failed to create lead'
        })
      }

      return reply.status(201).send({
        success: true,
        lead_id: result.lead_id,
        deal_id: result.deal_id,
        message: 'Lead criado com sucesso'
      })

    } catch (error) {
      console.error('Webhook error:', error)
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      })
    }
  })

  fastify.get('/api/v1/leads/webhook/test', async (request, reply) => {
    return reply.send({
      success: true,
      message: 'Webhook endpoint is working',
      timestamp: new Date().toISOString()
    })
  })
}
