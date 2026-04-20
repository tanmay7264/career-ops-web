import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = file.name.toLowerCase()

    let text = ''

    if (filename.endsWith('.pdf')) {
      // Dynamically import to avoid build-time issues
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParseMod = await import('pdf-parse') as any
      const pdfParse = pdfParseMod.default ?? pdfParseMod
      const data = await pdfParse(buffer)
      text = data.text
    } else if (filename.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (filename.endsWith('.md') || filename.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    // Clean up the extracted text and convert to basic markdown
    const markdown = cleanToMarkdown(text)

    return NextResponse.json({ markdown })
  } catch (err) {
    console.error('CV parse error:', err)
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 })
  }
}

function cleanToMarkdown(raw: string): string {
  return raw
    // Normalise line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Collapse 3+ blank lines into 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim trailing whitespace per line
    .split('\n')
    .map(l => l.trimEnd())
    .join('\n')
    .trim()
}
