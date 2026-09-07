import { prisma } from '#/db'
import { calculateRefundFee } from '#/lib/services/platform-config.js'

export interface CreatePaymentParams {
  tipeTransaksi: 'DP' | 'PELUNASAN' | 'REFUND'
  jumlah: number
  bookingId?: string | null
}

export interface CreatedPayment {
  transactionId: string
  status: 'PENDING' | 'BERHASIL' | 'GAGAL' | 'DIBATALKAN'
  referensiGateway: string
  metadata: Record<string, unknown> | null
}

export interface RefundParams {
  originalTransactionId: string
  jumlah: number
  bookingId?: string | null
  isOwner: boolean
}

export interface RefundedPayment {
  transactionId: string
  status: 'PENDING' | 'BERHASIL' | 'GAGAL' | 'DIBATALKAN'
  referensiGateway: string
  metadata: Record<string, unknown> | null
  biayaRefund: number
}

function toStatusTransaksi(status: string): CreatedPayment['status'] {
  if (status === 'BERHASIL') return 'BERHASIL'
  if (status === 'GAGAL') return 'GAGAL'
  if (status === 'DIBATALKAN') return 'DIBATALKAN'
  return 'PENDING'
}

export async function createPayment(
  params: CreatePaymentParams,
): Promise<CreatedPayment> {
  const referensiGateway = `mock_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`

  const transaction = await prisma.paymentTransaction.create({
    data: {
      tipeTransaksi: params.tipeTransaksi,
      jumlah: params.jumlah,
      status: 'PENDING',
      referensiGateway,
      metadata: {
        provider: 'mock_gateway',
        simulated: true,
        ...(params.bookingId ? { booking_id: params.bookingId } : {}),
      },
    },
  })

  return {
    transactionId: transaction.id,
    status: 'PENDING',
    referensiGateway: transaction.referensiGateway ?? referensiGateway,
    metadata: transaction.metadata as Record<string, unknown> | null,
  }
}

export async function verifyPayment(
  transactionId: string,
): Promise<CreatedPayment> {
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { id: transactionId },
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  const updated = await prisma.paymentTransaction.update({
    where: { id: transactionId },
    data: { status: 'BERHASIL' },
  })

  return {
    transactionId: updated.id,
    status: toStatusTransaksi(updated.status),
    referensiGateway: updated.referensiGateway ?? '',
    metadata: updated.metadata as Record<string, unknown> | null,
  }
}

export async function refundPayment(
  params: RefundParams,
): Promise<RefundedPayment> {
  const original = await prisma.paymentTransaction.findUnique({
    where: { id: params.originalTransactionId },
  })

  if (!original) {
    throw new Error('Original transaction not found')
  }

  const biayaRefund = await calculateRefundFee(params.jumlah, params.isOwner)

  const referensiGateway = `mock_refund_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`

  const refundTransaction = await prisma.paymentTransaction.create({
    data: {
      tipeTransaksi: 'REFUND',
      jumlah: params.jumlah,
      status: 'BERHASIL',
      referensiGateway,
      metadata: {
        provider: 'mock_gateway',
        simulated: true,
        biaya_refund: biayaRefund,
        original_transaction_id: params.originalTransactionId,
        ...(params.bookingId ? { booking_id: params.bookingId } : {}),
      },
    },
  })

  await prisma.paymentTransaction.update({
    where: { id: params.originalTransactionId },
    data: { status: 'DIBATALKAN' },
  })

  return {
    transactionId: refundTransaction.id,
    status: toStatusTransaksi(refundTransaction.status),
    referensiGateway: refundTransaction.referensiGateway ?? referensiGateway,
    metadata: refundTransaction.metadata as Record<string, unknown> | null,
    biayaRefund,
  }
}

export async function getPaymentStatus(
  transactionId: string,
): Promise<CreatedPayment> {
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { id: transactionId },
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  return {
    transactionId: transaction.id,
    status: toStatusTransaksi(transaction.status),
    referensiGateway: transaction.referensiGateway ?? '',
    metadata: transaction.metadata as Record<string, unknown> | null,
  }
}
