import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  Bath,
  Building2,
  CalendarDays,
  ChevronRight,
  Compass,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import {
  categories,
  facilities,
  featuredKos,
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
    <main className="page-wrap px-4 pb-20 pt-8 sm:pt-12">
      <Hero />
      <Categories />
      <PopularCities />
      <FeaturedKos />
      <WhyUs />
      <OwnerCta />
      <Testimonials />
      <PromoBanner />
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

          <SearchBar />

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

function SearchBar() {
  const navigate = useNavigate()

  return (
    <form
      className="island-shell flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-1.5"
      onSubmit={(e) => {
        e.preventDefault()
        navigate({ to: '/properties' })
      }}
    >
      <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-white/40">
        <MapPin className="h-4 w-4 text-[var(--lagoon-deep)]" />
        <div className="flex w-full flex-col">
          <Label htmlFor="hero-location" className="sr-only">
            Lokasi
          </Label>
          <Input
            id="hero-location"
            type="text"
            placeholder="Mau cari kos di kota mana?"
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
            type="text"
            placeholder="Tanggal masuk"
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
        <Select name="roomType">
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
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        size="lg"
        className="rounded-full bg-[var(--lagoon-deep)] px-5 text-white shadow-[0_8px_24px_rgba(50,143,151,0.32)] hover:bg-[#246f76]"
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

function Categories() {
  return (
    <section id="kategori" className="mt-12">
      <SectionHeader
        kicker="Kategori"
        title="Pilih tipe kos sesuai kebutuhanmu"
        subtitle="Dari kos harian untuk transit sampai kos bulanan untuk jangka panjang."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, index) => (
          <Link
            key={c.key}
            to="/properties"
            search={{ type: c.key }}
            className="island-shell feature-card rise-in relative overflow-hidden rounded-2xl p-5 no-underline"
            style={{ animationDelay: `${index * 60 + 80}ms` }}
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.accent} opacity-70`}
            />
            <div className="relative flex items-start justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-lg font-bold text-[var(--sea-ink)] shadow-sm">
                {c.icon}
              </span>
              <ChevronRight className="h-5 w-5 text-[var(--sea-ink-soft)]" />
            </div>
            <h3 className="relative mt-4 text-base font-semibold text-[var(--sea-ink)]">
              {c.label}
            </h3>
            <p className="relative mt-1 text-sm text-[var(--sea-ink-soft)]">
              {c.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function PopularCities() {
  return (
    <section id="kota" className="mt-12">
      <SectionHeader
        kicker="Lokasi"
        title="Cari kos di kota populer"
        subtitle="Telusuri kos-kos terdekat dari kampus, kantor, atau tempat kerjamu."
      />
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {popularCities.map((city, index) => (
          <Link
            key={city.slug}
            to="/properties"
            className="island-shell feature-card rise-in flex items-center justify-between rounded-xl p-4 no-underline"
            style={{ animationDelay: `${index * 40 + 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                <Compass className="h-4 w-4" />
              </span>
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                  Kos di {city.name}
                </p>
                <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                  {city.count.toLocaleString('id-ID')} kos
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--sea-ink-soft)]" />
          </Link>
        ))}
      </div>
    </section>
  )
}

function FeaturedKos() {
  return (
    <section id="rekomendasi" className="mt-12">
      <SectionHeader
        kicker="Rekomendasi"
        title="Kos favorit minggu ini"
        subtitle="Pilihan terbaik berdasarkan rating, lokasi, dan review pengguna asli."
        cta={{ label: 'Lihat semua', href: '/properties' }}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featuredKos.map((kos, index) => (
          <Link key={kos.id} to="/properties" className="no-underline">
            <Card
              className="island-shell feature-card rise-in gap-0 overflow-hidden rounded-2xl border-[var(--line)] py-0"
              style={{ animationDelay: `${index * 60 + 60}ms` }}
            >
              <div
                className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${kos.hue}`}
              >
                <span className="text-6xl font-bold text-white/70">
                  {kos.initial}
                </span>
                {kos.badge ? (
                  <Badge className="absolute left-3 top-3 border-0 bg-white/85 text-[var(--lagoon-deep)] shadow-sm hover:bg-white/85">
                    <Sparkles className="h-3 w-3" />
                    {kos.badge}
                  </Badge>
                ) : null}
                <Badge className="absolute right-3 top-3 border-0 bg-black/40 text-white hover:bg-black/40">
                  <Star className="h-3 w-3 fill-current text-amber-300" />
                  {kos.rating.toFixed(1)}
                </Badge>
              </div>
              <CardHeader className="px-4 pt-4">
                <CardTitle className="line-clamp-2 text-sm font-semibold text-[var(--sea-ink)]">
                  {kos.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs text-[var(--sea-ink-soft)]">
                  <MapPin className="h-3 w-3" />
                  {kos.district}, {kos.city}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {kos.facilities.slice(0, 3).map((f) => (
                    <Badge
                      key={f}
                      variant="outline"
                      className="border-[var(--chip-line)] bg-[var(--chip-bg)] px-2 py-0.5 text-[0.65rem] font-normal text-[var(--sea-ink-soft)]"
                    >
                      {f}
                    </Badge>
                  ))}
                  {kos.facilities.length > 3 ? (
                    <Badge
                      variant="outline"
                      className="border-[var(--chip-line)] bg-[var(--chip-bg)] px-2 py-0.5 text-[0.65rem] font-normal text-[var(--sea-ink-soft)]"
                    >
                      +{kos.facilities.length - 3}
                    </Badge>
                  ) : null}
                </div>
                <Separator className="bg-[var(--line)]" />
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-[var(--sea-ink-soft)]">
                      Mulai dari
                    </p>
                    <p className="text-base font-bold text-[var(--lagoon-deep)]">
                      {currency(kos.price)}
                      <span className="text-xs font-normal text-[var(--sea-ink-soft)]">
                        /{kos.period}
                      </span>
                    </p>
                  </div>
                  <span className="text-[0.65rem] text-[var(--sea-ink-soft)]">
                    {kos.reviews} review
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

function WhyUs() {
  return (
    <section className="mt-12">
      <SectionHeader
        kicker="Kenapa Konkosyuk"
        title="Cara paling mudah cari kos di Indonesia"
        subtitle="Ribuan pengguna mempercayakan pencarian kos mereka setiap bulannya."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {whyUs.map((item, index) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              className="island-shell feature-card rise-in gap-3 rounded-2xl border-[var(--line)] py-5"
              style={{ animationDelay: `${index * 80 + 60}ms` }}
            >
              <CardContent className="space-y-2 px-5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-base font-semibold text-[var(--sea-ink)]">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm text-[var(--sea-ink-soft)]">
                  {item.desc}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function OwnerCta() {
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

function Testimonials() {
  return (
    <section className="mt-12">
      <SectionHeader
        kicker="Cerita mereka"
        title="Apa kata pengguna Konkosyuk"
        subtitle="Ribuan anak kos & pemilik kos sudah menemukan pasangan yang tepat lewat platform kami."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, index) => (
          <Card
            key={t.name}
            className="island-shell feature-card rise-in h-full gap-3 rounded-2xl border-[var(--line)] py-5"
            style={{ animationDelay: `${index * 80 + 60}ms` }}
          >
            <CardContent className="flex h-full flex-col gap-3 px-5">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm text-[var(--sea-ink-soft)]">
                “{t.quote}”
              </blockquote>
              <Separator className="bg-[var(--line)]" />
              <div className="flex items-center gap-3">
                <Avatar
                  size="lg"
                  className={`bg-gradient-to-br ${t.hue} text-white`}
                >
                  <AvatarFallback
                    className={`bg-gradient-to-br ${t.hue} text-sm font-bold text-white`}
                  >
                    {t.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                    {t.name}
                  </p>
                  <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                    {t.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function PromoBanner() {
  return (
    <section
      id="app"
      className="island-shell rise-in mt-12 overflow-hidden rounded-2xl"
    >
      <div className="grid items-center gap-6 p-6 sm:grid-cols-[1.2fr_0.8fr] sm:p-8">
        <div>
          <p className="island-kicker mb-2">App Segera Hadir</p>
          <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
            Download aplikasi Konkosyuk dan dapatkan voucher Rp 100.000
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
            Booking kos dari mana aja, notifikasi kos baru di area favoritmu,
            dan promo eksklusif hanya di aplikasi.
          </p>
        </div>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
          {facilities.slice(0, 6).map((f) => {
            const Icon = f.icon
            return (
              <li
                key={f.name}
                className="island-shell flex flex-col items-center gap-1 rounded-xl p-2 text-center"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[0.65rem] font-medium text-[var(--sea-ink-soft)]">
                  {f.name}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
