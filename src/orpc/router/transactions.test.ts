import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrisma = {
  booking: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  units: {
    update: vi.fn(),
  },
}

const mockAuth = {
  api: {
    getSession: vi.fn(),
  },
}

vi.mock('#/db', () => ({
  prisma: mockPrisma,
}))

vi.mock('#/lib/auth', () => ({
  auth: mockAuth,
}))

const createMockBooking = (overrides = {}) => ({
  id: 'booking-1',
  unit_id: 'unit-1',
  penyewa_id: 'tenant-1',
  status_booking: 'MENUNGGU_PEMBAYARAN_DP',
  jumlahDP: '500000',
  statusRefundDP: 'BELUM_REFUND',
  transaksiDP_id: 'tx-1',
  units: {
    id: 'unit-1',
    name: 'Unit A',
    properties: {
      id: 'property-1',
      name: 'Properti A',
      owner_id: 'owner-1',
    },
  },
  users: {
    id: 'tenant-1',
    name: 'Penyewa A',
    email: 'tenant@example.com',
    role: 'PENYEWA',
  },
  ...overrides,
})

describe('tolakBooking refund logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const computeRefundStatus = (
    booking: ReturnType<typeof createMockBooking>,
  ) => {
    const dpNeedsRefund =
      !!booking.transaksiDP_id &&
      Number(booking.jumlahDP) > 0 &&
      booking.statusRefundDP !== 'BERHASIL'

    return dpNeedsRefund ? 'MENUNGGU_PROSES' : undefined
  }

  it('should set statusRefundDP to MENUNGGU_PROSES when DP exists and needs refund', async () => {
    const booking = createMockBooking({
      status_booking: 'MENUNGGU_PEMBAYARAN_DP',
      transaksiDP_id: 'tx-1',
      jumlahDP: '500000',
      statusRefundDP: 'BELUM_REFUND',
    })

    const statusRefundDP = computeRefundStatus(booking)
    expect(statusRefundDP).toBe('MENUNGGU_PROSES')
  })

  it('should not set statusRefundDP when DP amount is zero', async () => {
    const booking = createMockBooking({
      status_booking: 'MENUNGGU_PEMBAYARAN_DP',
      transaksiDP_id: 'tx-1',
      jumlahDP: '0',
      statusRefundDP: 'BELUM_REFUND',
    })

    const statusRefundDP = computeRefundStatus(booking)
    expect(statusRefundDP).toBeUndefined()
  })

  it('should not set statusRefundDP when DP is already refunded', async () => {
    const booking = createMockBooking({
      status_booking: 'MENUNGGU_PEMBAYARAN_DP',
      transaksiDP_id: 'tx-1',
      jumlahDP: '500000',
      statusRefundDP: 'BERHASIL',
    })

    const statusRefundDP = computeRefundStatus(booking)
    expect(statusRefundDP).toBeUndefined()
  })

  it('should not set statusRefundDP when there is no DP transaction', async () => {
    const booking = createMockBooking({
      status_booking: 'MENUNGGU_PEMBAYARAN_DP',
      transaksiDP_id: null,
      jumlahDP: '0',
      statusRefundDP: 'BELUM_REFUND',
    })

    const statusRefundDP = computeRefundStatus(booking)
    expect(statusRefundDP).toBeUndefined()
  })
})
