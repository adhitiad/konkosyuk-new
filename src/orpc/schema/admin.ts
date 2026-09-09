import { z } from 'zod'

export const getStatistikPlatformSchema = z.object({})

export const getKonfigurasiPlatformSchema = z.object({})

export const updateKonfigurasiPlatformSchema = z.object({
  platform_fee_percent: z.number().min(0).max(100).optional(),
  featured_listing_price: z.number().min(0).optional(),
})

export const getAllBookingsSchema = z.object({
  status: z
    .enum([
      'DRAFT',
      'PENDING_PAYMENT',
      'CONFIRMED',
      'ACTIVE',
      'COMPLETED',
      'CANCELLED',
      'EXPIRED',
    ])
    .optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const RoleSchema = z.enum(['PENYEWA', 'PEMILIK', 'ADMIN', 'STAFF'])

export const getAllUsersSchema = z.object({
  search: z.string().optional(),
  role: RoleSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const updateUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: RoleSchema,
})

export const updateUserStatusSchema = z.object({
  user_id: z.string().uuid(),
  is_active: z.boolean(),
})

export const StatusKycSchema = z.enum(['MENUNGGU', 'TERVERIFIKASI', 'DITOLAK'])

export const getKycVerificationsSchema = z.object({
  status: StatusKycSchema.optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const InspectionStatusSchema = z.enum([
  'pending',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
])

export const getInspectionsSchema = z.object({
  status: InspectionStatusSchema.optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const MaintenanceReportStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
])

export const getMaintenanceReportsSchema = z.object({
  status: MaintenanceReportStatusSchema.optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

export const getAuditLogsSchema = z.object({
  action: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})
