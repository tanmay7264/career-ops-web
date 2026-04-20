import { createGroq } from '@ai-sdk/groq'

const globalForGroq = globalThis as unknown as { groqClient: ReturnType<typeof createGroq> }

function getGroq() {
  if (!globalForGroq.groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }
    globalForGroq.groqClient = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    })
  }
  return globalForGroq.groqClient
}

// Exported as `anthropic` so existing imports in evaluate/route.ts don't need to change
export const anthropic: ReturnType<typeof createGroq> = new Proxy({} as ReturnType<typeof createGroq>, {
  apply(_target, _thisArg, args) {
    return (getGroq() as unknown as (...a: unknown[]) => unknown)(...args)
  },
  get(_target, prop) {
    const instance = getGroq()
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
