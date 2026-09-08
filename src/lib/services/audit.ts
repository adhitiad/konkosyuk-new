import type { Prisma } from '#/generated/prisma/client.js'

import { prisma } from '#/db'

export type AuditAction =
  | 'update_user_role'
  | 'update_user_status'
  | 'update_platform_config'
  | 'approve_kyc'
  | 'reject_kyc'
  | 'process_refund_dp'
  | 'verify_payment'
  | 'approve_booking'
  | 'reject_booking'

type LogAuditInput = {
  adminId: string
  action: AuditAction
  targetType: string
  targetId: string
  details?: Prisma.JsonObject
}

export async function logAudit({
  adminId,
  action,
  targetType,
  targetId,
  details,
}: LogAuditInput) {
  return prisma.audit_logs.create({
    data: {
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details ?? {},
    },
  })
}
