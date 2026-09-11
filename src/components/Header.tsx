import { Link } from '@tanstack/react-router'
import { Compass, Home, Menu, Sparkles, Wallet, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import { Button } from './ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet'
import ParaglideLocaleSwitcher from './LocaleSwitcher.tsx'
import ThemeToggle from './ThemeToggle'
import NotificationSheet from './notifications/NotificationSheet.tsx'

type NavItem = {
  label: string
  href: string
  icon: typeof Home
  isRoute?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Beranda', href: '/', icon: Home, isRoute: true },
  { label: 'Cari Kos', href: '/#kategori', icon: Compass },
  { label: 'Rekomendasi', href: '/#rekomendasi', icon: Sparkles },
  { label: 'Pasang Iklan', href: '/#pemilik', icon: Wallet },
]

function isActiveRoute(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [pathname, setPathname] = useState('/')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setPathname(window.location.pathname)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex items-center gap-2 py-3 sm:gap-3 sm:py-4">
        <Link
          to="/"
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          aria-label="Konkosyuk, ke beranda"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-[0.65rem] font-bold text-white">
            K
          </span>
          <span className="hidden sm:inline">Konkosyuk</span>
        </Link>

        <DesktopNav pathname={pathname} />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
            <BetterAuthHeader />
            <ParaglideLocaleSwitcher />
          </div>
          <NotificationSheet />
          <ThemeToggle />
          <MobileMenuButton onClick={() => setOpen(true)} />
        </div>
      </nav>

      <MobileSidebar open={open} onOpenChange={setOpen} pathname={pathname} />
    </header>
  )
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <div className="ml-2 hidden items-center gap-1 lg:flex">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = item.isRoute && isActiveRoute(pathname, item.href)
        const className = `nav-link inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
          isActive ? 'nav-link is-active' : ''
        }`

        if (item.isRoute) {
          return (
            <Link key={item.label} to={item.href} className={className}>
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          )
        }
        return (
          <a key={item.label} href={item.href} className={className}>
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </a>
        )
      })}
    </div>
  )
}

function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] hover:bg-[var(--link-bg-hover)] lg:hidden"
      aria-label="Buka menu navigasi"
    >
      <Menu className="h-5 w-5" />
    </Button>
  )
}

function MobileSidebar({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  pathname: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-full max-w-xs flex-col gap-0 border-r-[var(--line)] bg-[var(--bg-base)] p-0 sm:max-w-sm"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-sm font-bold text-white">
              K
            </span>
            <SheetTitle className="text-base text-[var(--sea-ink)]">
              Konkosyuk
            </SheetTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>
        <SheetDescription className="sr-only">
          Menu navigasi utama Konkosyuk
        </SheetDescription>

        <nav
          aria-label="Navigasi utama"
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.isRoute && isActiveRoute(pathname, item.href)
            const className = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-[var(--lagoon)]/15 text-[var(--lagoon-deep)]'
                : 'text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]'
            }`

            if (item.isRoute) {
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => onOpenChange(false)}
                  className={className}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            }
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={className}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="border-t border-[var(--line)] px-3 py-4">
          <p className="island-kicker px-3 pb-2">Akun</p>
          <div className="flex flex-col gap-2">
            <BetterAuthHeader />
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs text-[var(--sea-ink-soft)]">Bahasa</span>
              <ParaglideLocaleSwitcher />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
