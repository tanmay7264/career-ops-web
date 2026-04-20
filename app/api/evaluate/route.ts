import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { streamText } from 'ai'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/anthropic'
import { buildEvaluationPrompt } from '@/lib/prompt'
import { evaluateSchema } from '@/lib/validations'

function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return errorResponse('Unauthorized', 401)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse('Invalid JSON body', 400)
    }

    const parsed = evaluateSchema.safeParse(body)
    if (!parsed.success) return errorResponse(JSON.stringify(parsed.error.flatten()), 400)

    const { url, jdText: rawJdText } = parsed.data
    let jdText = rawJdText ?? ''

    if (url) {
      try {
        const fetchRes = await fetch(url, { signal: AbortSignal.timeout(10_000) })
        const rawText = await fetchRes.text()
        jdText = jdText ? `${jdText}\n\n${rawText.substring(0, 50_000)}` : rawText.substring(0, 50_000)
      } catch {
        // continue with whatever jdText we have
      }
    }

    if (!jdText.trim()) return errorResponse('Could not extract job description text', 400)

    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return errorResponse('Profile not found. Please complete onboarding first.', 400)

    const evaluationPrompt = buildEvaluationPrompt(profile, jdText, url)
    const userId = session.user.id
    const capturedUrl = url

    // Test Groq connectivity before opening the stream
    let result: ReturnType<typeof streamText>
    try {
      result = streamText({
        model: anthropic('llama-3.3-70b-versatile'),
        prompt: evaluationPrompt,
      })
    } catch (e) {
      console.error('Groq init error:', e)
      return errorResponse(`AI provider error: ${e instanceof Error ? e.message : String(e)}`)
    }

    const encoder = new TextEncoder()
    let fullText = ''

    const transformedStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            fullText += chunk
            controller.enqueue(encoder.encode(chunk))
          }

          const scoreMatch = fullText.match(/SCORE:\s*(\d+\.?\d*)/)
          const score = scoreMatch ? parseFloat(scoreMatch[1]) : null
          const legitMatch = fullText.match(/LEGITIMACY:\s*(REAL|SUSPICIOUS|FAKE)/)
          const legitimacy = legitMatch ? legitMatch[1] : null
          const companyMatch = fullText.match(/COMPANY:\s*(.+)/)
          const roleMatch = fullText.match(/ROLE:\s*(.+)/)
          const company = companyMatch?.[1]?.trim().substring(0, 100) || 'Unknown Company'
          const role = roleMatch?.[1]?.trim().substring(0, 100) || 'Unknown Role'

          const { app } = await prisma.$transaction(async (tx) => {
            const lastApp = await tx.application.findFirst({
              where: { userId },
              orderBy: { num: 'desc' },
              select: { num: true },
            })
            const nextNum = (lastApp?.num ?? 0) + 1
            const app = await tx.application.create({
              data: { userId, num: nextNum, company, role, score, status: 'Evaluated' },
            })
            return { app }
          })

          const report = await prisma.report.create({
            data: { userId, applicationId: app.id, url: capturedUrl || null, content: fullText, legitimacy },
          })

          controller.enqueue(encoder.encode(`\n\nREPORT_ID:${report.id}`))
        } catch (e) {
          console.error('Stream or DB error:', e)
          const errMsg = e instanceof Error ? e.message : String(e)
          controller.enqueue(encoder.encode(`\n\nERROR:${errMsg}`))
          controller.error(e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(transformedStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (e) {
    console.error('Evaluate route unhandled error:', e)
    return errorResponse(`Server error: ${e instanceof Error ? e.message : String(e)}`)
  }
}
