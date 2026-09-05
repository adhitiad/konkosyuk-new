import { Link } from '@tanstack/react-router'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from './ui/button'

export default function NotFound() {
  return (
    <main className="page-wrap flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="island-shell rise-in relative w-full max-w-2xl overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.28),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

        <p className="island-kicker mb-3">Error 404</p>
        <h1 className="display-title mb-4 text-5xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-7xl">
          4
          <span className="bg-gradient-to-r from-[var(--lagoon-deep)] to-[var(--palm)] bg-clip-text text-transparent">
            0
          </span>
          4
        </h1>
        <h2 className="display-title mb-3 text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
          Halaman tidak ditemukan
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm text-[var(--sea-ink-soft)] sm:text-base">
          Maaf, halaman yang kamu cari tidak ada. Mungkin alamatnya salah, sudah
          dipindahkan, atau sudah tidak tersedia.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-[var(--lagoon-deep)] text-white hover:bg-[#246f76]"
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              Ke Beranda
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-[var(--chip-line)] bg-white/70 text-[var(--sea-ink)] hover:border-[var(--lagoon)]"
          >
            <a href="#kategori">
              <Search className="h-4 w-4" />
              Cari Kos
            </a>
          </Button>
        </div>

        <p className="mt-8 text-xs text-[var(--sea-ink-soft)]">
          <ArrowLeft className="mr-1 inline h-3 w-3" />
          Tekan tombol kembali di browser untuk halaman sebelumnya.
        </p>
      </div>
    </main>
  )
}
