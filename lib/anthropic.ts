import { createAnthropic } from '@ai-sdk/anthropic'

const globalForAnthropic = globalThis as unknown as { anthropic: ReturnType<typeof createAnthropic> }

export const anthropic = globalForAnthropic.anthropic || createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

if (process.env.NODE_ENV !== 'production') globalForAnthropic.anthropic = anthropic

export function createAnthropicClient() {
  return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}
