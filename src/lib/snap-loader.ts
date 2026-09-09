let snapScriptPromise: Promise<void> | null = null

export function loadSnapScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (snapScriptPromise) {
    return snapScriptPromise
  }

  snapScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-snap-script]')
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src =
      import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute(
      'data-client-key',
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? '',
    )
    script.setAttribute('data-snap-script', 'true')

    script.onload = () => resolve()
    script.onerror = () => {
      snapScriptPromise = null
      reject(new Error('Gagal memuat script Midtrans Snap'))
    }

    document.body.appendChild(script)
  })

  return snapScriptPromise
}
