import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Palette, Globe, Sun, Moon, Monitor, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import LocaleSwitcher from '#/components/LocaleSwitcher'

export const Route = createFileRoute('/pengaturan')({
  component: PengaturanTampilanPage,
})

function PengaturanTampilanPage() {
  return (
    <main className="page-wrap py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sea-ink)]">
            Pengaturan Tampilan
          </h1>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            Kelola preferensi bahasa dan tampilan aplikasi.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[var(--sea-ink)]">
                  Bahasa
                </CardTitle>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  Pilih bahasa antarmuka yang nyaman untuk Anda.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <LocaleSwitcher variant="full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[var(--sea-ink)]">
                  Mode Tampilan
                </CardTitle>
                <p className="text-xs text-[var(--sea-ink-soft)]">
                  Atur mode terang, gelap, atau mengikuti sistem.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ThemeSettings />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function ThemeSettings() {
  const [mode, setMode] = useState<'light' | 'dark' | 'auto'>('auto')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      setMode(stored)
    }
  }, [])

  function applyThemeMode(nextMode: 'light' | 'dark' | 'auto') {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    const resolved =
      nextMode === 'auto' ? (prefersDark ? 'dark' : 'light') : nextMode

    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)

    if (nextMode === 'auto') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', nextMode)
    }

    document.documentElement.style.colorScheme = resolved
    window.localStorage.setItem('theme', nextMode)
  }

  function handleChange(nextMode: 'light' | 'dark' | 'auto') {
    setMode(nextMode)
    applyThemeMode(nextMode)
  }

  const options = [
    {
      value: 'light',
      label: 'Terang',
      icon: Sun,
      desc: 'Selalu gunakan mode terang',
    },
    {
      value: 'dark',
      label: 'Gelap',
      icon: Moon,
      desc: 'Selalu gunakan mode gelap',
    },
    {
      value: 'auto',
      label: 'Otomatis',
      icon: Monitor,
      desc: 'Ikuti pengaturan sistem',
    },
  ] as const

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map((opt) => {
        const Icon = opt.icon
        const active = mode === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleChange(opt.value)}
            aria-pressed={active}
            className={`relative flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition ${
              active
                ? 'border-[var(--lagoon-deep)] bg-[rgba(79,184,178,0.14)] shadow-[0_8px_24px_rgba(50,143,151,0.18)]'
                : 'border-[var(--line)] bg-white/60 hover:border-[var(--lagoon)] hover:bg-white/90'
            }`}
          >
            <div
              className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition ${
                active
                  ? 'bg-[var(--lagoon-deep)] text-white'
                  : 'bg-neutral-100 text-[var(--sea-ink-soft)] dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p
                className={`font-semibold text-sm ${active ? 'text-[var(--lagoon-deep)]' : 'text-[var(--sea-ink)]'}`}
              >
                {opt.label}
              </p>
              <p className="text-xs text-[var(--sea-ink-soft)] truncate max-w-[140px]">
                {opt.desc}
              </p>
            </div>
            {active && (
              <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lagoon-deep)] text-white shadow-sm">
                <Sparkles className="h-3 w-3" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
