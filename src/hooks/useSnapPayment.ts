import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { client } from '#/orpc/client'
import { loadSnapScript } from '#/lib/snap-loader'

type PaymentState = 'idle' | 'loading' | 'paying' | 'success' | 'failed'

const POLL_INTERVAL = 3000
const POLL_TIMEOUT = 2 * 60 * 1000

export function useSnapPayment(bookingId: string | null) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<PaymentState>('idle')
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef(0)
  const transactionIdRef = useRef<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [])

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!bookingId) {
        throw new Error('Booking ID tidak valid')
      }

      return client.createMidtransPayment({ booking_id: bookingId })
    },
    onSuccess: (result) => {
      transactionIdRef.current = result.transaction_id
      void openSnap(result)
    },
    onError: (error) => {
      setState('failed')
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal memulai pembayaran. Coba lagi.',
      )
    },
  })

  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['transaction-status', transactionIdRef.current],
    queryFn: async () => {
      if (!bookingId || !transactionIdRef.current) {
        return null
      }

      return client.getTransactionStatus({ booking_id: bookingId })
    },
    enabled: false,
    refetchInterval: false,
  })

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  const pollStatus = () => {
    if (!mountedRef.current) {
      return
    }

    if (Date.now() - startTimeRef.current > POLL_TIMEOUT) {
      stopPolling()
      if (state !== 'success') {
        setState('failed')
        toast.error(
          'Pembayaran belum selesai. Cek riwayat pembayaran Anda nanti.',
        )
      }
      return
    }

    refetchStatus().then(({ data }) => {
      if (!mountedRef.current) {
        return
      }

      if (data?.status === 'SUCCESS') {
        stopPolling()
        setState('success')
        toast.success('Pembayaran berhasil!')
        queryClient.invalidateQueries({
          queryKey: ['transaction-status'],
        })
        return
      }

      if (data?.status === 'FAILED' || data?.status === 'EXPIRED') {
        stopPolling()
        setState('failed')
        toast.error(
          data.status === 'EXPIRED'
            ? 'Sesi pembayaran sudah kadaluarsa.'
            : 'Pembayaran gagal. Coba lagi.',
        )
        return
      }

      pollTimerRef.current = setTimeout(pollStatus, POLL_INTERVAL)
    })
  }

  const openSnap = async (result: {
    token: string
    payment_url: string
    transaction_id: string
  }) => {
    try {
      await loadSnapScript()

      if (!mountedRef.current) {
        return
      }

      const snap = window.snap
      if (!snap) {
        throw new Error('Midtrans Snap belum siap')
      }

      setState('paying')
      startTimeRef.current = Date.now()

      snap.embed(result.token, {
        onSuccess: () => {
          if (!mountedRef.current) {
            return
          }
          pollTimerRef.current = setTimeout(pollStatus, POLL_INTERVAL)
        },
        onPending: () => {
          if (!mountedRef.current) {
            return
          }
          pollTimerRef.current = setTimeout(pollStatus, POLL_INTERVAL)
        },
        onError: () => {
          if (!mountedRef.current) {
            return
          }
          stopPolling()
          setState('failed')
          toast.error('Pembayaran dibatalkan atau gagal.')
        },
        onClose: () => {
          if (!mountedRef.current) {
            return
          }
          if (state === 'paying') {
            stopPolling()
            setState('idle')
            toast.info('Popup pembayaran ditutup.')
          }
        },
      })
    } catch (error) {
      if (!mountedRef.current) {
        return
      }
      stopPolling()
      setState('failed')
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal membuka pembayaran Midtrans.',
      )
    }
  }

  const pay = () => {
    if (state === 'loading' || state === 'paying') {
      return
    }
    setState('loading')
    createMutation.mutate()
  }

  const reset = () => {
    stopPolling()
    setState('idle')
    transactionIdRef.current = null
  }

  return {
    state,
    pay,
    reset,
    statusData,
  }
}

declare global {
  interface Window {
    snap?: {
      embed: (
        token: string,
        callbacks: {
          onSuccess: () => void
          onPending: () => void
          onError: () => void
          onClose: () => void
        },
      ) => void
    }
  }
}
