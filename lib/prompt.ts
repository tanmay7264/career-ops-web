import type { Profile } from './generated/prisma'

export function buildEvaluationPrompt(profile: Profile, jdText: string, url?: string): string {
  const salaryRange = `${profile.salaryMin}–${profile.salaryMax} ${profile.currency ?? 'USD'}`

  const lines: string[] = [
    '# Job Offer Evaluation',
    '',
    '## Candidate Profile',
    `- **Name:** ${profile.fullName}`,
    `- **Location:** ${profile.location}`,
    `- **Target Roles:** ${profile.targetRoles}`,
    `- **Seniority:** ${profile.seniority}`,
    `- **Salary Target:** ${salaryRange}`,
    `- **Superpower:** ${profile.superpower}`,
    '',
    '## Candidate CV',
    profile.cvMarkdown,
    '',
    '## Job Description',
  ]

  if (url) {
    lines.push(`**URL:** ${url}`)
    lines.push('')
  }

  lines.push(jdText)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Evaluation Instructions')
  lines.push('')
  lines.push('Evaluate this job offer and produce the following 7 blocks in order. Be concise and specific.')
  lines.push('')
  lines.push('**Block A: Role Fit** — Does this role match the candidate\'s target roles and seniority level? Note any mismatches.')
  lines.push('')
  lines.push('**Block B: Compensation** — Does the salary/comp package match the candidate\'s target range? Assess total comp, equity, and benefits.')
  lines.push('')
  lines.push('**Block C: Company & Culture** — Assess company legitimacy, culture signals, growth trajectory, and any red flags.')
  lines.push('')
  lines.push('**Block D: CV Alignment** — How well does the candidate\'s CV align with the JD requirements? List strong matches and gaps.')
  lines.push('')
  lines.push('**Block E: Application Strategy** — Should the candidate apply? Provide key talking points, angles to emphasize, and gaps to address.')
  lines.push('')
  lines.push('**Block F: Score** — Give a final numeric score from 0.0 to 5.0 reflecting overall fit.')
  lines.push('Output exactly: SCORE: X.X')
  lines.push('where X.X is a number from 0.0 to 5.0 with exactly one decimal place (e.g. SCORE: 3.7).')
  lines.push('')
  lines.push('**Block G: Legitimacy** — Is this a real job posting or potentially fake/scam? Output one of:')
  lines.push('LEGITIMACY: REAL')
  lines.push('LEGITIMACY: SUSPICIOUS')
  lines.push('LEGITIMACY: FAKE')
  lines.push('Output exactly one of the three lines above, with no other text on that line.')
  lines.push('')
  lines.push('**Block H: Metadata** — At the very end of your response, output these two lines exactly:')
  lines.push('COMPANY: [company name from the job posting]')
  lines.push('ROLE: [exact job title from the posting]')

  return lines.join('\n')
}
