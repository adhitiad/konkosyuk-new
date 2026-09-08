import { z } from 'zod'

export const getUpcomingExpirationsSchema = z.object({
  days: z.number().int().positive().max(90).optional(),
})

export const getMonthlyRevenueSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
})
