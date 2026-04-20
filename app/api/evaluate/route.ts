import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { streamText } from 'ai'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/anthropic'
import { buildEvaluationPrompt } from '@/lib/prompt'
import { evaluateSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json()
  const parsed = evaluateSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { url, jdText: rawJdText } = parsed.data
  let jdText = rawJdText ?? ''

  if (url) {
    try {
      const res = await fetch(url)
      const urlText = await res.text()
      jdText = jdText ? `${jdText}\n\n${urlText}` : urlText
    } catch {
      // continue with whatever jdText we have
    }
  }

  if (!jdText.trim()) {
    return new Response(JSON.stringify({ error: 'Could not extract job description text' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  if (!profile) {
    return new Response(JSON.stringify({ error: 'Profile not found. Please complete onboarding first.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const evaluationPrompt = buildEvaluationPrompt(profile, jdText, url)

  const userId = session.user.id
  const capturedJdText = jdText
  const capturedUrl = url

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt: evaluationPrompt,
  })

  const encoder = new TextEncoder()
  let fullText = ''

  const transformedStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.textStream) {
        fullText += chunk
        controller.enqueue(encoder.encode(chunk))
      }
      // After stream ends, save to DB
      try {
        const scoreMatch = fullText.match(/SCORE:\s*(\d+\.?\d*)/)
        const score = scoreMatch ? parseFloat(scoreMatch[1]) : null
        const legitMatch = fullText.match(/LEGITIMACY:\s*(REAL|SUSPICIOUS|FAKE)/)
        const legitimacy = legitMatch ? legitMatch[1] : null
        const lastApp = await prisma.application.findFirst({
          where: { userId },
          orderBy: { num: 'desc' },
          select: { num: true },
        })
        const nextNum = (lastApp?.num ?? 0) + 1
        const lines = capturedJdText.trim().split('\n').filter(Boolean)
        const company = lines[0]?.substring(0, 100) || 'Unknown Company'
        const role = lines[1]?.substring(0, 100) || 'Unknown Role'
        const app = await prisma.application.create({
          data: { userId, num: nextNum, company, role, score, status: 'Evaluated' },
        })
        const report = await prisma.report.create({
          data: { userId, applicationId: app.id, url: capturedUrl || null, content: fullText, legitimacy },
        })
        // Send special final chunk with report ID
        controller.enqueue(encoder.encode(`\n\nREPORT_ID:${report.id}`))
      } catch (e) {
        console.error('Failed to save evaluation:', e)
      }
      controller.close()
    },
  })

  return new Response(transformedStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
