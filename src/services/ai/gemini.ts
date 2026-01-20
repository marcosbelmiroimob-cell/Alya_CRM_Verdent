import { GoogleGenerativeAI } from '@google/generative-ai'

let geminiClient: GoogleGenerativeAI | null = null

function getGemini(): GoogleGenerativeAI {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada')
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return geminiClient
}

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export async function geminiChat(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const genAI = getGemini()
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 500,
    },
  })

  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: `INSTRUÇÕES DO SISTEMA:\n${systemPrompt}\n\n---\n\nResponda: OK, entendi as instruções.` }],
      },
      {
        role: 'model',
        parts: [{ text: 'OK, entendi as instruções.' }],
      },
    ],
  })

  const result = await chat.sendMessage(userMessage)
  const response = await result.response
  return response.text()
}

export async function geminiGenerate(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number; jsonOutput?: boolean }
): Promise<string> {
  const genAI = getGemini()
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 500,
      responseMimeType: options?.jsonOutput ? 'application/json' : 'text/plain',
    },
  })

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY
}
