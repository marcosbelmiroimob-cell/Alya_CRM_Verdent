import { geminiChat, geminiGenerate, isGeminiAvailable } from './gemini.js'
import OpenAI from 'openai'

let openaiClient: OpenAI | null = null
let openaiMonthlySpend = 0
const OPENAI_MONTHLY_LIMIT = parseFloat(process.env.OPENAI_MONTHLY_LIMIT_USD || '5.00')

const TOKEN_COSTS = {
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
}

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada')
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

function isOpenAIWithinLimit(): boolean {
  return openaiMonthlySpend < OPENAI_MONTHLY_LIMIT
}

function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  const costs = TOKEN_COSTS[model as keyof typeof TOKEN_COSTS] || TOKEN_COSTS['gpt-3.5-turbo']
  return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output
}

export type AIProvider = 'gemini' | 'openai'

export interface AIResponse {
  content: string
  provider: AIProvider
  model: string
  estimatedCost?: number
}

export async function aiChat(
  systemPrompt: string,
  userMessage: string,
  options?: {
    temperature?: number
    maxTokens?: number
    preferredProvider?: AIProvider
    fallbackModel?: string
  }
): Promise<AIResponse> {
  if (isGeminiAvailable() && options?.preferredProvider !== 'openai') {
    try {
      const content = await geminiChat(systemPrompt, userMessage, {
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      })
      return {
        content,
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        estimatedCost: 0,
      }
    } catch (error) {
      console.error('Gemini error, falling back to OpenAI:', error)
    }
  }

  if (!isOpenAIWithinLimit()) {
    throw new Error('Limite mensal de gastos com IA atingido. Aguarde o próximo mês ou aumente o limite.')
  }

  const openai = getOpenAI()
  const model = options?.fallbackModel || 'gpt-4-turbo-preview'

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 500,
  })

  const inputTokens = response.usage?.prompt_tokens || 0
  const outputTokens = response.usage?.completion_tokens || 0
  const cost = estimateCost(inputTokens, outputTokens, model)
  openaiMonthlySpend += cost

  console.log(`[AI Router] OpenAI used. Cost: $${cost.toFixed(4)}. Monthly total: $${openaiMonthlySpend.toFixed(4)}/${OPENAI_MONTHLY_LIMIT}`)

  return {
    content: response.choices[0].message.content || '',
    provider: 'openai',
    model,
    estimatedCost: cost,
  }
}

export async function aiGenerate(
  prompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
    jsonOutput?: boolean
    preferredProvider?: AIProvider
    fallbackModel?: string
  }
): Promise<AIResponse> {
  if (isGeminiAvailable() && options?.preferredProvider !== 'openai') {
    try {
      const content = await geminiGenerate(prompt, {
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
        jsonOutput: options?.jsonOutput,
      })
      return {
        content,
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        estimatedCost: 0,
      }
    } catch (error) {
      console.error('Gemini error, falling back to OpenAI:', error)
    }
  }

  if (!isOpenAIWithinLimit()) {
    throw new Error('Limite mensal de gastos com IA atingido.')
  }

  const openai = getOpenAI()
  const model = options?.fallbackModel || 'gpt-4-turbo-preview'

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 500,
    response_format: options?.jsonOutput ? { type: 'json_object' } : undefined,
  })

  const inputTokens = response.usage?.prompt_tokens || 0
  const outputTokens = response.usage?.completion_tokens || 0
  const cost = estimateCost(inputTokens, outputTokens, model)
  openaiMonthlySpend += cost

  return {
    content: response.choices[0].message.content || '',
    provider: 'openai',
    model,
    estimatedCost: cost,
  }
}

export function getAIStatus() {
  return {
    geminiAvailable: isGeminiAvailable(),
    openaiAvailable: !!process.env.OPENAI_API_KEY,
    openaiMonthlySpend,
    openaiMonthlyLimit: OPENAI_MONTHLY_LIMIT,
    openaiWithinLimit: isOpenAIWithinLimit(),
  }
}
