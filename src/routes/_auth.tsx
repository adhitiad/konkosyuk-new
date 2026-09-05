import { Outlet, createFileRoute, Link } from '@tanstack/react-router'
import { Sparkles } from 'lucide-react'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

      <main className="page-wrap flex flex-col items-center justify-center px-4 py-10 sm:py-16">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline shadow-sm"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-[0.65rem] font-bold text-white">
            K
          </span>
          Konkosyuk
          <Sparkles className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
        </Link>
        <Outlet />
      </main>
    </div>
  )
}
