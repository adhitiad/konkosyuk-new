import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/about')({
  component: About,
  head: () => ({
    meta: [
      { title: 'Tentang Kami — Konkosyuk' },
      {
        name: 'description',
        content:
          'Mengenal Konkosyuk, platform pencarian dan booking kos terpercaya di Indonesia.',
      },
    ],
  }),
})

function About() {
  return (
    <main className="page-wrap px-4 py-12 space-y-12 sm:space-y-16">
      <section className="island-shell rise-in relative overflow-hidden rounded-3xl p-6 sm:p-12">
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.3),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.2),transparent_70%)]" />

        <div className="relative max-w-3xl">
          <Badge
            variant="outline"
            className="island-kicker mb-3 inline-flex items-center gap-1.5 border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs text-[var(--kicker)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
            Tentang Konkosyuk
          </Badge>
          <h1 className="display-title mb-4 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl lg:text-5xl">
            Menghubungkan pencari hunian dengan pemilik kos secara transparan &
            aman.
          </h1>
          <p className="text-base text-[var(--sea-ink-soft)] sm:text-lg leading-relaxed">
            Konkosyuk lahir dari kebutuhan nyata mahasiswa dan pekerja perantau
            di seluruh Indonesia yang menginginkan pengalaman mencari kos tanpa
            repot survei berulang kali, tanpa calo, dan tanpa biaya siluman.
          </p>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: ShieldCheck,
            title: '100% Terverifikasi',
            desc: 'Setiap listing ditinjau keaslian lokasi, fasilitas, serta foto riil sebelum ditayangkan.',
          },
          {
            icon: HeartHandshake,
            title: 'Transaksi Aman',
            desc: 'Pembayaran uang muka (DP) dilindungi sistem escrow hingga penyewa tiba di lokasi.',
          },
          {
            icon: Users,
            title: 'Langsung ke Pemilik',
            desc: 'Komunikasi langsung via chat dan booking instan tanpa perantara atau biaya makelar.',
          },
          {
            icon: Building2,
            title: 'Jangkauan Luas',
            desc: 'Melayani pencarian hunian kos di lebih dari 50 kota pendidikan dan kawasan industri.',
          },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              className="island-shell feature-card rise-in h-full rounded-2xl border-[var(--line)] p-6"
              style={{ animationDelay: `${index * 80 + 40}ms` }}
            >
              <CardContent className="p-0 space-y-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-base font-semibold text-[var(--sea-ink)]">
                  {item.title}
                </CardTitle>
                <p className="text-sm text-[var(--sea-ink-soft)] leading-relaxed m-0">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="island-shell rounded-3xl p-6 sm:p-10 border border-[var(--line)]">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="island-kicker mb-2">Misi Kami</p>
            <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
              Memudahkan kehidupan merantau di Indonesia
            </h2>
            <p className="mt-3 text-sm text-[var(--sea-ink-soft)] sm:text-base leading-relaxed">
              Kami percaya tempat tinggal yang nyaman adalah fondasi penting
              untuk kesuksesan kuliah dan karier. Konkosyuk terus berinovasi
              menyediakan solusi digital terbaik bagi pencari kos dan pemilik
              properti.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-[var(--lagoon-deep)] text-white hover:bg-[#246f76]"
              >
                <Link to="/properties">
                  Cari Kos Sekarang
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-[var(--chip-line)] bg-white/70"
              >
                <Link to="/owner/properties/new">Daftarkan Kos Anda</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Verifikasi Identitas & GPS',
              'Sistem Booking Instan',
              'Tanpa Biaya Bagi Pencari',
              'Dukungan Layanan Ramah',
            ].map((text) => (
              <div
                key={text}
                className="island-shell flex items-center gap-2.5 rounded-xl p-3 border border-[var(--line)]"
              >
                <CheckCircle2 className="h-4 w-4 text-[var(--palm)] shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-[var(--sea-ink)]">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
