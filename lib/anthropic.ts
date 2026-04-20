import { createAnthropic } from '@ai-sdk/anthropic'

const globalForAnthropic = globalThis as unknown as { anthropic: ReturnType<typeof createAnthropic> }

function getAnthropic() {
  if (!globalForAnthropic.anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    globalForAnthropic.anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return globalForAnthropic.anthropic
}

export const anthropic: ReturnType<typeof createAnthropic> = new Proxy({} as ReturnType<typeof createAnthropic>, {
  apply(_target, _thisArg, args) {
    return (getAnthropic() as unknown as (...a: unknown[]) => unknown)(...args)
  },
  get(_target, prop) {
    const instance = getAnthropic()
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
