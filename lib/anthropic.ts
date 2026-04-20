import { createGroq } from '@ai-sdk/groq'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is not set')
}

// Export as `anthropic` so existing imports in evaluate/route.ts don't need to change
export const anthropic = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})
