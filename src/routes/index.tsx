import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  Bath,
  Bed,
  Building2,
  CalendarDays,
  ChevronRight,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react'

import { orpc } from '#/orpc/client'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Separator } from '#/components/ui/separator'
import { PropertyCardSkeleton } from '#/components/ui/skeleton-card'
import { PropertyCard } from '#/components/property/PropertyCard'
import { facilities } from '#/data/landing'

export const Route = createFileRoute('/')({ component: HomePage })

const currency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

function HomePage() {
  return (
    <main className="page-wrap px-4 pb-20 pt-8 sm:pt-12">
      <Hero />
      <HowItWorks />
      <ValueProposition />
      <FeaturedListings />
      <OwnerCTA />
    </main>
  )
}

function Hero() {
  return (
    <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

      <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <Badge
            variant="outline"
            className="island-kicker mb-3 inline-flex items-center gap-1.5 border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-[0.69rem] text-[var(--kicker)]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            #1 Cari Kos & Booking Online
          </Badge>
          <h1 className="display-title mb-5 max-w-2xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl lg:text-6xl">
            Cari kos nyaman,{' '}
            <span className="bg-gradient-to-r from-[var(--lagoon-deep)] to-[var(--palm)] bg-clip-text text-transparent">
              booking tanpa ribet.
            </span>
          </h1>
          <p className="mb-8 max-w-xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
            Konkosyuk bantu kamu menemukan kos putra, putri, campur, dan harian
            di lebih dari 50 kota. Foto asli, harga jujur, dan langsung
            terhubung ke pemilik.
          </p>

          <HeroSearch />

          <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4 text-left">
            <Stat icon={Home} value="50K+" label="Kos aktif" />
            <Stat icon={Building2} value="50+" label="Kota" />
            <Stat icon={ShieldCheck} value="100%" label="Terverifikasi" />
          </dl>
        </div>

        <div className="relative hidden h-full min-h-96 lg:block">
          <div className="absolute inset-0 rounded-[2rem] border border-[var(--line)] bg-gradient-to-br from-[rgba(79,184,178,0.18)] via-[rgba(255,255,255,0.55)] to-[rgba(47,106,74,0.12)] shadow-[0_30px_60px_rgba(30,90,72,0.18)]" />
          <Card className="island-shell absolute -left-6 top-6 w-64 gap-2 rounded-2xl border-[var(--line)] bg-white/85 py-4 shadow-lg backdrop-blur">
            <CardContent className="space-y-1 px-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--kicker)]">
                <Star className="h-3.5 w-3.5 fill-current" /> 4.9 · 128 review
              </p>
              <p className="text-sm font-semibold text-[var(--sea-ink)]">
                Kos Putri Mawar
              </p>
              <p className="flex items-center gap-1 text-xs text-[var(--sea-ink-soft)]">
                <MapPin className="h-3 w-3" /> Beji, Depok
              </p>
              <p className="pt-1 text-sm font-bold text-[var(--lagoon-deep)]">
                {currency(1_650_000)}
                <span className="text-xs font-normal text-[var(--sea-ink-soft)]">
                  /bulan
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="island-shell absolute right-2 top-32 w-56 gap-2 rounded-2xl border-[var(--line)] bg-white/85 py-4 shadow-lg backdrop-blur">
            <CardContent className="space-y-1 px-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--kicker)]">
                Promo Hari Ini
              </p>
              <p className="text-sm font-semibold text-[var(--sea-ink)]">
                Diskon 25% untuk booking pertama
              </p>
              <p className="text-xs text-[var(--sea-ink-soft)]">
                Berlaku sampai 30 September
              </p>
            </CardContent>
          </Card>
          <Card className="island-shell absolute -right-4 bottom-8 w-60 gap-2 rounded-2xl border-[var(--line)] bg-white/85 py-4 shadow-lg backdrop-blur">
            <CardContent className="space-y-1 px-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--kicker)]">
                <Wallet className="h-3.5 w-3.5" /> Hemat hingga 40%
              </p>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Cicilan tanpa kartu kredit, mulai dari{' '}
                <span className="font-semibold text-[var(--sea-ink)]">
                  300rb
                </span>
                /bulan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function HeroSearch() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [keyword, setKeyword] = useState('')
  const [date, setDate] = useState('')
  const [roomType, setRoomType] = useState('')

  const canSearch = location.length > 0 || keyword.length > 0

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSearch) return
    const params = new URLSearchParams()
    if (location) params.set('city', location)
    if (keyword) params.set('search', keyword)
    if (roomType) params.set('type', roomType)
    if (date) params.set('checkin', date)
    const qs = params.toString()
    navigate({ to: `/properties${qs ? `?${qs}` : ''}` })
  }

  return (
    <form
      className="island-shell flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
      onSubmit={onSubmit}
    >
      <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-white/40">
        <Search className="h-4 w-4 text-[var(--lagoon-deep)]" />
        <div className="flex w-full flex-col">
          <Label htmlFor="hero-keyword" className="sr-only">
            Cari kos
          </Label>
          <Input
            id="hero-keyword"
            type="text"
            placeholder="Nama kos, area, atau kota?"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-auto w-full border-0 bg-transparent p-0 text-sm font-medium text-[var(--sea-ink)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[var(--sea-ink-soft)]/80"
          />
        </div>
      </div>
      <Separator
        orientation="vertical"
        className="hidden h-8 sm:block bg-[var(--line)]"
      />
      <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-white/40">
        <MapPin className="h-4 w-4 text-[var(--lagoon-deep)]" />
        <div className="flex w-full flex-col">
          <Label htmlFor="hero-location" className="sr-only">
            Lokasi
          </Label>
          <Input
            id="hero-location"
            type="text"
            placeholder="Kota?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-auto w-full border-0 bg-transparent p-0 text-sm font-medium text-[var(--sea-ink)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[var(--sea-ink-soft)]/80"
          />
        </div>
      </div>
      <Separator
        orientation="vertical"
        className="hidden h-8 sm:block bg-[var(--line)]"
      />
      <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-white/40">
        <CalendarDays className="h-4 w-4 text-[var(--lagoon-deep)]" />
        <div className="flex w-full flex-col">
          <Label htmlFor="hero-date" className="sr-only">
            Tanggal masuk
          </Label>
          <Input
            id="hero-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-auto w-full border-0 bg-transparent p-0 text-sm font-medium text-[var(--sea-ink)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[var(--sea-ink-soft)]/80"
          />
        </div>
      </div>
      <Separator
        orientation="vertical"
        className="hidden h-8 sm:block bg-[var(--line)]"
      />
      <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-white/40">
        <Bath className="h-4 w-4 text-[var(--lagoon-deep)]" />
        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger
            id="hero-room-type"
            name="roomType"
            size="sm"
            className="h-auto w-full border-0 bg-transparent p-0 text-sm font-medium text-[var(--sea-ink)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--sea-ink-soft)]/80 [&_svg]:hidden"
            aria-label="Tipe kos"
          >
            <SelectValue placeholder="Tipe kos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="putri">Putri</SelectItem>
            <SelectItem value="putra">Putra</SelectItem>
            <SelectItem value="campur">Campur</SelectItem>
            <SelectItem value="harian">Harian</SelectItem>
            <SelectItem value="bulanan">Bulanan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={!canSearch}
        className="rounded-full bg-[var(--lagoon-deep)] px-5 text-white shadow-[0_8px_24px_rgba(50,143,151,0.32)] hover:bg-[#246f76] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Search className="h-4 w-4" />
        Cari Kos
      </Button>
    </form>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Home
  value: string
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <dt className="text-lg font-bold text-[var(--sea-ink)]">{value}</dt>
        <dd className="m-0 text-xs text-[var(--sea-ink-soft)]">{label}</dd>
      </div>
    </div>
  )
}

function SectionHeader({
  kicker,
  title,
  subtitle,
  cta,
}: {
  kicker: string
  title: string
  subtitle: string
  cta?: { label: string; href: string }
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="island-kicker mb-2">{kicker}</p>
        <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
          {subtitle}
        </p>
      </div>
      {cta ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="self-start rounded-full border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] hover:border-[var(--lagoon)]"
        >
          <Link to={cta.href}>
            {cta.label}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

function ValueProposition() {
  return (
    <section className="mt-12">
      <SectionHeader
        kicker="Kenyamanan"
        title="Kenyamanan yang kamu butuhkan, semua lengkap."
        subtitle="Setiap fasilitas kami pilih agar kamu merasa seperti di rumah."
      />
      <Card className="island-shell rise-in border-[var(--line)]">
        <CardContent className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
          {facilities.map((f, index) => {
            const Icon = f.icon
            return (
              <div
                key={f.name}
                className="flex flex-col items-center gap-3 text-center"
                style={{ animationDelay: `${index * 60 + 60}ms` }}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-[var(--sea-ink)]">
                  {f.name}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Cari',
      desc: 'Filter kos berdasarkan lokasi, tipe, harga, dan fasilitas.',
    },
    {
      icon: Star,
      title: 'Pilih',
      desc: 'Lihat foto asli dan ulasan pengguna lain.',
    },
    {
      icon: CalendarDays,
      title: 'Booking',
      desc: 'Konfirmasi instan dan lakukan pembayaran DP.',
    },
    {
      icon: Bed,
      title: 'Tinggal',
      desc: 'Pindah dengan mudah sesuai jadwal yang disepakati.',
    },
  ]

  return (
    <section className="mt-12">
      <SectionHeader
        kicker="Cara Kerja"
        title="Cari kos dalam 4 langkah mudah"
        subtitle="Dari pencarian hingga kunci rumah, semua dilakukan hanya di Konkosyuk."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <Card
              key={step.title}
              className="island-shell feature-card rise-in flex h-full flex-col gap-4 rounded-2xl border-[var(--line)] py-6"
              style={{ animationDelay: `${index * 120 + 60}ms` }}
            >
              <CardContent className="flex flex-1 flex-col items-center gap-3 px-5 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-base font-semibold text-[var(--sea-ink)]">
                  {step.title}
                </CardTitle>
                <CardDescription className="text-sm text-[var(--sea-ink-soft)]">
                  {step.desc}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function FeaturedListings() {
  const { data: featured = [], isLoading } = useQuery(
    orpc.listFeaturedProperties.queryOptions({ input: { limit: 12 } }),
  )

  const limited = useMemo(() => featured.slice(0, 8), [featured])

  return (
    <section className="mt-12">
      <SectionHeader
        kicker="Rekomendasi"
        title="Properti unggulan"
        subtitle="Pilihan terbaik berdasarkan lokasi, rating, dan review pengguna asli."
        cta={{ label: 'Lihat semua', href: '/properties' }}
      />
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ animationDelay: `${i * 60 + 60}ms` }}>
              <PropertyCardSkeleton />
            </div>
          ))}
        </div>
      ) : limited.length === 0 ? (
        <p className="col-span-full text-center text-sm text-[var(--sea-ink-soft)]">
          Belum ada properti unggulan. Cek lagi nanti!
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {limited.map((p, index) => (
            <div key={p.id} style={{ animationDelay: `${index * 60 + 60}ms` }}>
              <PropertyCard property={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function OwnerCTA() {
  return (
    <section
      id="pemilik"
      className="island-shell rise-in mt-12 overflow-hidden rounded-2xl p-6 sm:p-8"
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="island-kicker mb-2">Pemilik Kos</p>
          <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
            Punya kos kosong? Daftarkan sekarang, dapat penyewa dalam 7 hari.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
            Pasang iklan gratis, kelola kamar dan tagihan di satu tempat, dan
            terima pembayaran langsung ke rekening kamu.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full bg-[var(--lagoon-deep)] text-white shadow-[0_8px_24px_rgba(50,143,151,0.32)] hover:bg-[#246f76]"
            >
              Pasang Iklan Gratis
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-[var(--chip-line)] bg-white/70 text-[var(--sea-ink)] hover:border-[var(--lagoon)]"
            >
              Pelajari Fitur Owner
            </Button>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            ['Gratis', 'Pasang iklan tanpa biaya bulanan'],
            ['Cepat', 'Penerimaan penyewa dalam 7 hari*'],
            ['Aman', 'Verifikasi KTP & booking online'],
          ].map(([title, desc]) => (
            <li
              key={title}
              className="island-shell flex items-start gap-3 rounded-xl p-3"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(47,106,74,0.18)] text-[var(--palm)]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                  {title}
                </p>
                <p className="m-0 text-xs text-[var(--sea-ink-soft)]">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}


