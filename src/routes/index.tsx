import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bath,
  Bed,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
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
import {
  categories,
  facilities,
  popularCities,
  testimonials,
  whyUs,
} from '#/data/landing'

export const Route = createFileRoute('/')({ component: HomePage })

const currency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

function HomePage() {
  return (
    <main className="page-wrap px-4 pb-24 pt-8 sm:pt-12 space-y-16 sm:space-y-24">
      <Hero />
      <CategoriesSection />
      <HowItWorks />
      <PopularCitiesSection />
      <FeaturedListings />
      <ValueProposition />
      <WhyUsSection />
      <TestimonialsSection />
      <OwnerCTA />
    </main>
  )
}

function Hero() {
  const { data: stats } = useQuery(orpc.getPlatformPublicStats.queryOptions({}))

  const formattedProperties = stats
    ? `${stats.totalProperties >= 1000 ? `${(stats.totalProperties / 1000).toFixed(0)}K+` : `${stats.totalProperties}+`}`
    : '50K+'
  const formattedCities = stats ? `${stats.totalCities}+` : '50+'
  const formattedVerified = stats ? `${stats.verifiedRate}%` : '100%'

  return (
    <section className="island-shell rise-in relative overflow-hidden rounded-[2.5rem] px-6 py-10 sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.35),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.22),transparent_70%)]" />

      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <Badge
            variant="outline"
            className="island-kicker mb-4 inline-flex items-center gap-1.5 border-[var(--chip-line)] bg-[var(--chip-bg)] px-3.5 py-1.5 text-xs text-[var(--kicker)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
            #1 Platform Pencarian & Booking Kos
          </Badge>
          <h1 className="display-title mb-5 max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl lg:text-6xl">
            Cari kos idaman,{' '}
            <span className="bg-gradient-to-r from-[var(--lagoon-deep)] to-[var(--palm)] bg-clip-text text-transparent">
              booking tanpa ribet.
            </span>
          </h1>
          <p className="mb-8 max-w-xl text-base text-[var(--sea-ink-soft)] sm:text-lg leading-relaxed">
            Konkosyuk menghubungkan pencari kos dengan ribuan kos putri, putra,
            campur, dan sewa harian. Foto terverifikasi, harga transparan, dan
            langsung terhubung ke pemilik.
          </p>

          <HeroSearch />

          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-left">
            <Stat icon={Home} value={formattedProperties} label="Kos aktif" />
            <Stat
              icon={Building2}
              value={formattedCities}
              label="Kota di Indonesia"
            />
            <Stat
              icon={ShieldCheck}
              value={formattedVerified}
              label="Terverifikasi"
            />
          </dl>
        </div>

        <div className="relative hidden h-full min-h-[420px] lg:block">
          <div className="absolute inset-0 rounded-[2.5rem] border border-[var(--line)] bg-gradient-to-br from-[rgba(79,184,178,0.18)] via-[rgba(255,255,255,0.65)] to-[rgba(47,106,74,0.14)] shadow-[0_30px_60px_rgba(30,90,72,0.18)]" />
          <Card className="island-shell absolute -left-6 top-6 w-64 gap-2 rounded-2xl border-[var(--line)] bg-white/90 py-4 shadow-xl backdrop-blur-md">
            <CardContent className="space-y-1 px-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--kicker)]">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{' '}
                4.9 · 128 review
              </p>
              <p className="text-sm font-semibold text-[var(--sea-ink)]">
                Kos Putri Mawar
              </p>
              <p className="flex items-center gap-1 text-xs text-[var(--sea-ink-soft)]">
                <MapPin className="h-3 w-3 text-[var(--lagoon-deep)]" /> Beji,
                Depok
              </p>
              <p className="pt-1 text-sm font-bold text-[var(--lagoon-deep)]">
                {currency(1_650_000)}
                <span className="text-xs font-normal text-[var(--sea-ink-soft)]">
                  /bulan
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="island-shell absolute right-2 top-32 w-60 gap-2 rounded-2xl border-[var(--line)] bg-white/90 py-4 shadow-xl backdrop-blur-md">
            <CardContent className="space-y-1 px-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--kicker)]">
                Promo Booking Online
              </p>
              <p className="text-sm font-semibold text-[var(--sea-ink)]">
                Diskon 25% Bulan Pertama
              </p>
              <p className="text-xs text-[var(--sea-ink-soft)]">
                Khusus booking via sistem Konkosyuk
              </p>
            </CardContent>
          </Card>
          <Card className="island-shell absolute -right-4 bottom-8 w-64 gap-2 rounded-2xl border-[var(--line)] bg-white/90 py-4 shadow-xl backdrop-blur-md">
            <CardContent className="space-y-1 px-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--kicker)]">
                <Wallet className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />{' '}
                Bayar Fleksibel
              </p>
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Didukung DP ringan & verifikasi identitas instan yang aman.
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

  const canSearch =
    location.length > 0 || keyword.length > 0 || roomType.length > 0

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
      className="island-shell flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-2 shadow-lg"
      onSubmit={onSubmit}
    >
      <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-white/40">
        <Search className="h-4 w-4 text-[var(--lagoon-deep)] shrink-0" />
        <div className="flex w-full flex-col">
          <Label htmlFor="hero-keyword" className="sr-only">
            Cari kos
          </Label>
          <Input
            id="hero-keyword"
            type="text"
            placeholder="Nama kos, kampus, atau area?"
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
        <MapPin className="h-4 w-4 text-[var(--lagoon-deep)] shrink-0" />
        <div className="flex w-full flex-col">
          <Label htmlFor="hero-location" className="sr-only">
            Lokasi
          </Label>
          <Input
            id="hero-location"
            type="text"
            placeholder="Kota tujuan?"
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
        <CalendarDays className="h-4 w-4 text-[var(--lagoon-deep)] shrink-0" />
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
        <Bath className="h-4 w-4 text-[var(--lagoon-deep)] shrink-0" />
        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger
            id="hero-room-type"
            name="roomType"
            size="sm"
            className="h-auto w-full border-0 bg-transparent p-0 text-sm font-medium text-[var(--sea-ink)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--sea-ink-soft)]/80 [&_svg]:hidden"
            aria-label="Tipe kos"
          >
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="putri">Kos Putri</SelectItem>
            <SelectItem value="putra">Kos Putra</SelectItem>
            <SelectItem value="campur">Kos Campur</SelectItem>
            <SelectItem value="harian">Sewa Harian</SelectItem>
            <SelectItem value="bulanan">Sewa Bulanan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={!canSearch}
        className="rounded-full bg-[var(--lagoon-deep)] px-6 text-white shadow-[0_8px_24px_rgba(50,143,151,0.32)] hover:bg-[#246f76] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Search className="h-4 w-4 mr-1.5" />
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
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <dt className="text-lg font-bold text-[var(--sea-ink)] leading-tight">
          {value}
        </dt>
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
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="island-kicker mb-2">{kicker}</p>
        <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
          {subtitle}
        </p>
      </div>
      {cta ? (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="self-start rounded-full border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] hover:border-[var(--lagoon)] shadow-sm"
        >
          <Link to={cta.href}>
            {cta.label}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

function CategoriesSection() {
  return (
    <section id="kategori" className="scroll-mt-24">
      <SectionHeader
        kicker="Kategori Kos"
        title="Temukan Kos Sesuai Kebutuhanmu"
        subtitle="Pilihan kos putra, putri, campur, hingga opsi sewa fleksibel harian dan bulanan."
        cta={{ label: 'Lihat Katalog Lengkap', href: '/properties' }}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, index) => (
          <Link
            key={cat.key}
            to="/properties"
            search={{ type: cat.key } as any}
            className="group block no-underline"
          >
            <Card
              className="island-shell feature-card rise-in h-full rounded-2xl border-[var(--line)] p-6 transition-all duration-300 hover:border-[var(--lagoon)] hover:shadow-xl hover:-translate-y-1"
              style={{ animationDelay: `${index * 80 + 40}ms` }}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.accent} font-bold text-lg text-[var(--sea-ink)] shadow-sm`}
                >
                  {cat.icon}
                </div>
                <span className="inline-flex items-center text-xs font-semibold text-[var(--lagoon-deep)] group-hover:translate-x-1 transition-transform">
                  Cari Sekarang <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </span>
              </div>
              <CardTitle className="mt-4 text-lg font-bold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)] transition-colors">
                {cat.label}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-[var(--sea-ink-soft)] leading-relaxed">
                {cat.desc}
              </CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: '1. Cari & Filter',
      desc: 'Cari kos berdasarkan kota, area kampus, tipe kamar, rentang harga, dan fasilitas.',
    },
    {
      icon: Star,
      title: '2. Bandingkan & Review',
      desc: 'Lihat foto asli ruangan, fasilitas lengkap, dan ulasan autentik dari penghuni sebelumnya.',
    },
    {
      icon: CalendarDays,
      title: '3. Booking Online',
      desc: 'Ajukan sewa langsung ke pemilik dengan konfirmasi instan dan pembayaran DP aman.',
    },
    {
      icon: Bed,
      title: '4. Siap Huni',
      desc: 'Pindah masuk tepat waktu dengan jaminan kamar sesuai spesifikasi yang tertera.',
    },
  ]

  return (
    <section id="cara-booking" className="scroll-mt-24">
      <SectionHeader
        kicker="Cara Kerja"
        title="Cari dan booking kos dalam 4 langkah mudah"
        subtitle="Dari pencarian santai hingga serah terima kunci, semua serba transparan dan praktis."
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
                  <Icon className="h-6 w-6" />
                </span>
                <CardTitle className="text-base font-semibold text-[var(--sea-ink)]">
                  {step.title}
                </CardTitle>
                <CardDescription className="text-sm text-[var(--sea-ink-soft)] leading-relaxed">
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

function PopularCitiesSection() {
  return (
    <section id="kota" className="scroll-mt-24">
      <SectionHeader
        kicker="Kota Populer"
        title="Kos di Kota-Kota Terfavorit"
        subtitle="Temukan hunian nyaman dekat kampus ternama, stasiun transit, dan pusat perkantoran."
        cta={{ label: 'Jelajahi Peta', href: '/properties' }}
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {popularCities.map((city, index) => (
          <Link
            key={city.slug}
            to="/properties"
            search={{ city: city.name } as any}
            className="group block no-underline"
          >
            <div
              className="island-shell rise-in rounded-2xl border border-[var(--line)] p-4 text-center transition-all duration-300 hover:border-[var(--lagoon)] hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 50 + 40}ms` }}
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.15)] text-[var(--lagoon-deep)] group-hover:scale-110 transition-transform">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon-deep)] transition-colors">
                {city.name}
              </h3>
              <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
                {city.count.toLocaleString('id-ID')} kos
              </p>
            </div>
          </Link>
        ))}
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
    <section id="rekomendasi" className="scroll-mt-24">
      <SectionHeader
        kicker="Rekomendasi"
        title="Properti Pilihan & Unggulan"
        subtitle="Pilihan kos terbaik berdasarkan verifikasi langsung, rating tinggi, dan ulasan penyewa."
        cta={{ label: 'Lihat Semua Kos', href: '/properties' }}
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
        <div className="island-shell rounded-2xl border border-[var(--line)] py-12 text-center">
          <Home className="mx-auto h-10 w-10 text-[var(--sea-ink-soft)]/50 mb-3" />
          <p className="text-sm font-medium text-[var(--sea-ink)]">
            Belum ada listing yang ditandai khusus.
          </p>
          <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">
            Jelajahi seluruh koleksi kos kami melalui katalog properti.
          </p>
          <Button
            asChild
            size="sm"
            className="mt-4 rounded-full bg-[var(--lagoon-deep)] text-white"
          >
            <Link to="/properties">Buka Katalog Properti</Link>
          </Button>
        </div>
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

function ValueProposition() {
  return (
    <section className="scroll-mt-24">
      <SectionHeader
        kicker="Kenyamanan Lengkap"
        title="Fasilitas Lengkap Sesuai Kebutuhanmu"
        subtitle="Setiap kos dilengkapi fasilitas pilihan agar aktivitas belajar maupun bekerjamu semakin produktif."
      />
      <Card className="island-shell rise-in border-[var(--line)]">
        <CardContent className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
          {facilities.map((f, index) => {
            const Icon = f.icon
            return (
              <div
                key={f.name}
                className="flex flex-col items-center gap-3 text-center"
                style={{ animationDelay: `${index * 40 + 40}ms` }}
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

function WhyUsSection() {
  return (
    <section className="scroll-mt-24">
      <SectionHeader
        kicker="Mengapa Konkosyuk"
        title="Jaminan Kenyamanan & Transparansi"
        subtitle="Kami memastikan setiap langkah pencarian hunianmu bebas drama dan tanpa biaya tersembunyi."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {whyUs.map((item, index) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              className="island-shell feature-card rise-in flex h-full flex-col gap-3 rounded-2xl border-[var(--line)] p-6"
              style={{ animationDelay: `${index * 90 + 50}ms` }}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(47,106,74,0.16)] text-[var(--palm)]">
                <Icon className="h-5 w-5" />
              </span>
              <CardTitle className="text-base font-semibold text-[var(--sea-ink)]">
                {item.title}
              </CardTitle>
              <CardDescription className="text-sm text-[var(--sea-ink-soft)] leading-relaxed">
                {item.desc}
              </CardDescription>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="scroll-mt-24">
      <SectionHeader
        kicker="Testimoni"
        title="Cerita Nyata dari Komunitas Konkosyuk"
        subtitle="Ribuan mahasiswa, pekerja perantau, dan pemilik kos telah merasakan kemudahan bertransaksi di Konkosyuk."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <Card
            key={t.name}
            className="island-shell feature-card rise-in flex h-full flex-col justify-between rounded-2xl border-[var(--line)] p-6 shadow-sm"
            style={{ animationDelay: `${index * 100 + 50}ms` }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[var(--sea-ink)] leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-[var(--line)] pt-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.hue} font-bold text-sm text-[var(--sea-ink)] shadow-inner`}
              >
                {t.avatar}
              </div>
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                  {t.name}
                </p>
                <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                  {t.role}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

function OwnerCTA() {
  return (
    <section
      id="pemilik"
      className="island-shell rise-in scroll-mt-24 overflow-hidden rounded-3xl p-6 sm:p-10 border border-[var(--line)]"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Badge
            variant="outline"
            className="island-kicker mb-3 inline-flex items-center gap-1.5 border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs text-[var(--kicker)]"
          >
            <Users className="h-3.5 w-3.5 text-[var(--palm)]" />
            Khusus Pemilik Kos
          </Badge>
          <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl lg:text-4xl">
            Punya kos kosong? Daftarkan sekarang, raih penyewa dalam hitungan
            hari.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[var(--sea-ink-soft)] sm:text-base leading-relaxed">
            Pasang iklan gratis, kelola ketersediaan kamar, pantau status
            tagihan, dan terima pembayaran DP langsung ke rekening kamu tanpa
            potongan tersembunyi.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[var(--lagoon-deep)] px-6 text-white shadow-[0_8px_24px_rgba(50,143,151,0.32)] hover:bg-[#246f76]"
            >
              <Link to="/owner/properties/new">
                Pasang Iklan Gratis
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-[var(--chip-line)] bg-white/70 text-[var(--sea-ink)] hover:border-[var(--lagoon)]"
            >
              <Link to="/properties">Jelajahi Listing</Link>
            </Button>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 p-0 m-0 list-none">
          {[
            [
              '100% Gratis Iklan',
              'Pasang listing kos tanpa dipungut biaya bulanan',
            ],
            [
              'Penyewa Cepat',
              'Penyewa terhubung langsung melalui verifikasi instan',
            ],
            [
              'Sistem Otomatis',
              'Manajemen kamar dan reminder pembayaran otomatis',
            ],
          ].map(([title, desc]) => (
            <li
              key={title}
              className="island-shell flex items-start gap-3 rounded-2xl p-4 border border-[var(--line)]"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(47,106,74,0.18)] text-[var(--palm)]">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                  {title}
                </p>
                <p className="m-0 text-xs text-[var(--sea-ink-soft)] mt-0.5">
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
