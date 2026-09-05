import { Check, Globe, Sparkles } from 'lucide-react'
import { getLocale, locales, setLocale } from '#/paraglide/runtime'
import { LOCALES, SUGGESTED_LOCALE, getLocaleMeta } from '#/data/locales'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { cn } from '#/lib/utils'

type LocaleSwitcherProps = {
  variant?: 'compact' | 'full'
  className?: string
  /** Called after locale is switched. Useful for analytics or custom persistence. */
  onLocaleChange?: (code: string) => void
}

export default function LocaleSwitcher({
  variant = 'compact',
  className,
  onLocaleChange,
}: LocaleSwitcherProps) {
  const currentLocale = getLocale()
  const current = getLocaleMeta(currentLocale) ?? LOCALES[0]

  function handleSelect(code: string) {
    if (!locales.includes(code as (typeof locales)[number])) return
    setLocale(code as (typeof locales)[number])
    onLocaleChange?.(code)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {variant === 'full' ? (
          <Button
            variant="ghost"
            className={cn(
              'justify-start gap-2 rounded-full px-3 text-sm font-semibold text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]',
              className,
            )}
            aria-label="Ganti bahasa"
          >
            <span aria-hidden className="text-base leading-none">
              {current.flag}
            </span>
            <span>{current.nativeName}</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'rounded-full border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] hover:border-[var(--lagoon)]',
              className,
            )}
            aria-label="Ganti bahasa"
          >
            <Globe className="h-4 w-4 text-[var(--lagoon-deep)]" />
            <span aria-hidden className="text-base leading-none">
              {current.flag}
            </span>
            <span className="font-semibold uppercase">{current.code}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden border-[var(--line)] bg-[var(--bg-base)] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-[var(--line)] bg-gradient-to-br from-[rgba(79,184,178,0.18)] to-[rgba(47,106,74,0.08)] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[var(--lagoon-deep)] shadow-sm">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-[var(--sea-ink)]">
                Pilih Bahasa
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--sea-ink-soft)]">
                Pilih bahasa antarmuka yang nyaman untuk kamu. Preferensi akan
                tersimpan otomatis.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2">
          {LOCALES.map((l) => {
            const active = l.code === currentLocale
            const suggested = l.code === SUGGESTED_LOCALE
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => handleSelect(l.code)}
                aria-pressed={active}
                className={cn(
                  'group relative flex items-start gap-3 rounded-xl border p-3 text-left transition',
                  active
                    ? 'border-[var(--lagoon-deep)] bg-[rgba(79,184,178,0.14)] shadow-[0_8px_24px_rgba(50,143,151,0.18)]'
                    : 'border-[var(--line)] bg-white/60 hover:border-[var(--lagoon)] hover:bg-white/90',
                )}
              >
                <span
                  aria-hidden
                  className="text-3xl leading-none transition group-hover:scale-110"
                >
                  {l.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-[var(--sea-ink)]">
                      {l.nativeName}
                    </p>
                    {suggested ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-[rgba(47,106,74,0.16)] px-1.5 py-0.5 text-[0.6rem] font-semibold text-[var(--palm)]">
                        <Sparkles className="h-2.5 w-2.5" />
                        Disarankan
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--sea-ink-soft)]">
                    {l.englishName} · {l.region}
                  </p>
                </div>
                {active ? (
                  <span
                    aria-hidden
                    className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lagoon-deep)] text-white shadow-sm"
                  >
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="border-t border-[var(--line)] bg-white/40 px-4 py-3 text-xs text-[var(--sea-ink-soft)] sm:px-6">
          Tidak menemukan bahasa yang kamu cari? Bahasa akan ditambah
          berdasarkan permintaan pengguna.
        </div>
      </DialogContent>
    </Dialog>
  )
}
