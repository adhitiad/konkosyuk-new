import midtransClient from 'midtrans-client'
import type { SnapTransactionResponse } from 'midtrans-client'

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY ?? '',
})

const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY ?? '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY ?? '',
})

export async function createSnapTransaction({
  orderId,
  grossAmount,
  customerDetails,
  itemDetails,
}: {
  orderId: string
  grossAmount: number
  customerDetails?: Record<string, string>
  itemDetails?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}): Promise<SnapTransactionResponse> {
  const parameter: Record<string, unknown> = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    credit_card: {
      secure: true,
    },
  }

  if (customerDetails) {
    parameter.customer_details = customerDetails
  }

  if (itemDetails && itemDetails.length > 0) {
    parameter.item_details = itemDetails
  }

  return snap.createTransaction(parameter as any)
}

export async function getSnapTransactionStatus(orderId: string) {
  return (core as any).transaction.status(orderId)
}

export function verifyMidtransSignature(
  rawBody: string,
  signature: string,
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    return false
  }

  const expected = `${rawBody}${serverKey}`
  const hash = Array.from(
    new Uint8Array(
      require('node:crypto').createHash('sha512').update(expected).digest(),
    ),
  )
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return hash === signature
}

export { snap, core }
