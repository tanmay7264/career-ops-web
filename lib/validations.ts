import { z } from 'zod'

export const profileStep1Schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  targetRoles: z.string().min(2, 'At least one target role is required'),
  seniority: z.string().min(2, 'Seniority is required'),
  salaryMin: z.number().min(1, 'Minimum salary is required'),
  salaryMax: z.number().min(1, 'Maximum salary is required'),
  superpower: z.string().min(10, 'Tell us more about your superpower'),
})

export const profileStep2Schema = z.object({
  cvMarkdown: z.string().min(50, 'Please add your CV content'),
})

export const profileStep3Schema = z.object({
  includeKw: z.string().min(2, 'At least one include keyword is required'),
  excludeKw: z.string().optional().default(''),
  portalsYaml: z.string().min(10, 'Portals config is required'),
})

export const evaluateSchema = z.object({
  url: z.string().url().optional().or(z.literal('')),
  jdText: z.string().optional(),
}).refine(d => d.url || d.jdText, {
  message: 'Provide a URL or paste JD text',
})

export const applicationUpdateSchema = z.object({
  status: z.enum(['Evaluated','Applied','Responded','Interview','Offer','Rejected','Discarded','SKIP']),
  notes: z.string().optional(),
  score: z.number().optional(),
})

export type ProfileStep1 = z.infer<typeof profileStep1Schema>
export type ProfileStep2 = z.infer<typeof profileStep2Schema>
export type ProfileStep3 = z.infer<typeof profileStep3Schema>
