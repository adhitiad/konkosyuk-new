import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  UserCheck,
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

const helpSearchSchema = z.object({
  tab: z.enum(['penyewa', 'owner']).optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute('/bantuan')({
  validateSearch: (search) => helpSearchSchema.parse(search),
  component: HelpCenterPage,
  head: () => ({
    meta: [
      { title: 'Pusat Bantuan & Panduan — Konkosyuk' },
      {
        name: 'description',
        content:
          'Pusat bantuan Konkosyuk untuk pencari kos dan panduan lengkap pemilik kos (Bantuan Owner).',
      },
    ],
  }),
})

type FaqItem = {
  id: string
  question: string
  answer: string
  category: string
}

const FAQS_PENYEWA: FaqItem[] = [
  {
    id: 'p-1',
    category: 'Booking & Sewa',
    question: 'Bagaimana cara mencari dan memesan kamar di Konkosyuk?',
    answer:
      'Gunakan kolom pencarian di halaman utama atau halaman katalog untuk memilih kota, area, kampus terdekat, dan filter fasilitas. Setelah memilih kos yang sesuai, klik tombol "Ajukan Booking", pilih tanggal masuk dan tipe kamar yang diinginkan, kemudian ikuti instruksi pembayaran uang muka (DP).',
  },
  {
    id: 'p-2',
    category: 'Pembayaran',
    question: 'Metode pembayaran apa saja yang didukung untuk pembayaran DP?',
    answer:
      'Konkosyuk mendukung pembayaran instan via Midtrans (QRIS, Transfer Bank/Virtual Account BCA, BNI, BRI, Mandiri, Permata, serta e-Wallet GoPay/ShopeePay). Seluruh transaksi dilindungi sistem keamanan escrow sampai Anda berhasil check-in.',
  },
  {
    id: 'p-3',
    category: 'Verifikasi & Keamanan',
    question: 'Apakah foto dan harga kamar di Konkosyuk sesuai kenyataan?',
    answer:
      'Ya. Tim verifikator Konkosyuk melakukan pengecekan data dan GPS lokasi untuk setiap properti yang berstatus terverifikasi. Kami juga menerapkan ulasan jujur dari penghuni sebelumnya untuk menjaga transparansi.',
  },
  {
    id: 'p-4',
    category: 'Pembatalan & Refund',
    question:
      'Apakah uang muka (DP) bisa dikembalikan jika saya batal menyewa?',
    answer:
      'Kebijakan pengembalian DP mengikuti batas waktu pembatalan yang ditentukan. Pengajuan pembatalan yang dilakukan sebelum batas waktu H-3 tanggal masuk dapat diproses refund sesuai syarat dan ketentuan platform.',
  },
  {
    id: 'p-5',
    category: 'Kontak Pemilik',
    question: 'Kapan saya bisa berkomunikasi langsung dengan pemilik kos?',
    answer:
      'Setelah pengajuan sewa dibuat atau disetujui, Anda dapat menggunakan fitur Chat langsung di Konkosyuk untuk menanyakan detail aturan kos, janji survei, atau konfirmasi waktu tiba.',
  },
]

const FAQS_OWNER: FaqItem[] = [
  {
    id: 'o-1',
    category: 'Pendaftaran Kos',
    question: 'Apakah ada biaya untuk memasang iklan properti di Konkosyuk?',
    answer:
      'Tidak ada biaya sama sekali (100% Gratis). Pemilik dapat mendaftarkan kos, menambahkan kamar tanpa batas, mengunggah foto, dan menentukan harga sewa secara mandiri.',
  },
  {
    id: 'o-2',
    category: 'Verifikasi & Keamanan',
    question:
      'Bagaimana proses verifikasi properti dan identitas pemilik (KYC)?',
    answer:
      'Pemilik mengunggah foto KTP dan sertifikat/bukti kepemilikan atau pengelolaan properti di dashboard. Tim admin Konkosyuk akan meninjau dokumen dalam waktu 1x24 jam kerja untuk memberikan lencana Terverifikasi yang meningkatkan kepercayaan calon penyewa.',
  },
  {
    id: 'o-3',
    category: 'Manajemen Kamar',
    question:
      'Bagaimana cara mengatur kamar yang terisi, kosong, atau renovasi?',
    answer:
      'Buka menu "Kelola Properti" atau "Dashboard Pemilik", pilih properti yang ingin diatur, lalu pada tab Unit Anda dapat mengubah status kamar menjadi Available, Occupied, atau Maintenance kapan saja.',
  },
  {
    id: 'o-4',
    category: 'Pencairan Dana',
    question: 'Kapan uang muka (DP) sewa ditransfer ke rekening pemilik?',
    answer:
      'Setelah calon penyewa melakukan check-in atau mengonfirmasi kedatangan di lokasi kos, dana DP akan langsung diteruskan ke nomor rekening bank pemilik kos yang telah didaftarkan.',
  },
  {
    id: 'o-5',
    category: 'Pemberitahuan & Tagihan',
    question: 'Apakah Konkosyuk memiliki pengingat jatuh tempo sewa otomatis?',
    answer:
      'Ya! Konkosyuk menyediakan dashboard pengingat sewa aktif dan jatuh tempo sehingga Anda tidak perlu repot menagih secara manual setiap bulan.',
  },
]

function HelpCenterPage() {
  const search = useSearch({ from: '/bantuan' })
  const defaultTab = search.tab === 'owner' ? 'owner' : 'penyewa'
  const [activeTab, setActiveTab] = useState<'penyewa' | 'owner'>(defaultTab)
  const [searchQuery, setSearchQuery] = useState('')

  const currentFaqs = activeTab === 'penyewa' ? FAQS_PENYEWA : FAQS_OWNER
  const filteredFaqs = searchQuery.trim()
    ? currentFaqs.filter(
        (f) =>
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : currentFaqs

  return (
    <main className="page-wrap px-4 py-12 space-y-12 sm:space-y-16">
      {/* Hero Banner */}
      <section className="island-shell rise-in relative overflow-hidden rounded-3xl p-6 sm:p-12">
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.2),transparent_70%)]" />

        <div className="relative max-w-3xl">
          <Badge
            variant="outline"
            className="island-kicker mb-3 inline-flex items-center gap-1.5 border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs text-[var(--kicker)]"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
            Pusat Bantuan & Panduan
          </Badge>
          <h1 className="display-title mb-4 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl lg:text-5xl">
            Ada yang bisa kami bantu?
          </h1>
          <p className="text-base text-[var(--sea-ink-soft)] sm:text-lg leading-relaxed">
            Temukan jawaban cepat seputar pemesanan kos, pembayaran DP, aturan
            sewa, hingga panduan operasional lengkap bagi pemilik kos.
          </p>

          <div className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/90 px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-[var(--lagoon-deep)] dark:bg-neutral-900/90">
            <Search className="h-5 w-5 text-[var(--lagoon-deep)] shrink-0" />
            <Label htmlFor="faq-search" className="sr-only">
              Cari pertanyaan
            </Label>
            <Input
              id="faq-search"
              type="text"
              placeholder="Ketik kata kunci (contoh: DP, verifikasi, batal sewa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-auto w-full border-0 bg-transparent p-0 text-sm font-medium text-[var(--sea-ink)] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[var(--sea-ink-soft)]/70"
            />
          </div>
        </div>
      </section>

      {/* Tabs FAQ */}
      <section className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'penyewa' | 'owner')}
          className="w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--line)] pb-4">
            <div>
              <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
                Pilih kategori bantuan di bawah ini sesuai kebutuhan Anda.
              </p>
            </div>
            <TabsList className="rounded-full bg-[rgba(79,184,178,0.12)] p-1 border border-[var(--line)]">
              <TabsTrigger
                value="penyewa"
                className="rounded-full px-5 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-[var(--lagoon-deep)] data-[state=active]:text-white transition"
              >
                <UserCheck className="h-4 w-4 mr-1.5" />
                Pencari Kos
              </TabsTrigger>
              <TabsTrigger
                value="owner"
                className="rounded-full px-5 py-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-[var(--lagoon-deep)] data-[state=active]:text-white transition"
              >
                <Building2 className="h-4 w-4 mr-1.5" />
                Pemilik Kos (Owner)
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="penyewa" className="pt-6">
            <FaqAccordion items={filteredFaqs} />
          </TabsContent>

          <TabsContent value="owner" className="pt-6">
            <FaqAccordion items={filteredFaqs} ownerBadge />
          </TabsContent>
        </Tabs>
      </section>

      {/* Contact Support Cards */}
      <section className="space-y-6">
        <div>
          <p className="island-kicker mb-1">Dukungan Responsif</p>
          <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)]">
            Butuh Bantuan Langsung dari Tim Kami?
          </h2>
          <p className="text-sm text-[var(--sea-ink-soft)] mt-1">
            Customer support Konkosyuk siap membantu kendala Anda setiap hari.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="island-shell feature-card rise-in rounded-2xl border-[var(--line)] p-6">
            <CardHeader className="p-0 space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <MessageCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-[var(--sea-ink)]">
                WhatsApp Customer Service
              </CardTitle>
              <CardDescription className="text-xs text-[var(--sea-ink-soft)] leading-relaxed">
                Chat cepat untuk konfirmasi darurat, verifikasi booking, atau
                kendala check-in.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <Button
                asChild
                size="sm"
                className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Konkosyuk,%20saya%20butuh%20bantuan"
                  target="_blank"
                  rel="noreferrer"
                >
                  Hubungi via WhatsApp
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="island-shell feature-card rise-in rounded-2xl border-[var(--line)] p-6">
            <CardHeader className="p-0 space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.18)] text-[var(--lagoon-deep)]">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-[var(--sea-ink)]">
                Email Dukungan Resmi
              </CardTitle>
              <CardDescription className="text-xs text-[var(--sea-ink-soft)] leading-relaxed">
                Kirim pertanyaan formal, bukti pembayaran, atau pengajuan
                kerjasama properti.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full rounded-full border-[var(--chip-line)]"
              >
                <a href="mailto:support@konkosyuk.id?subject=Pusat%20Bantuan%20Konkosyuk">
                  support@konkosyuk.id
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="island-shell feature-card rise-in rounded-2xl border-[var(--line)] p-6">
            <CardHeader className="p-0 space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                <Phone className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-[var(--sea-ink)]">
                Jam Operasional Layanan
              </CardTitle>
              <CardDescription className="text-xs text-[var(--sea-ink-soft)] leading-relaxed">
                Senin - Minggu: 08.00 - 21.00 WIB
                <br />
                Waktu respons rata-rata: &lt; 15 menit.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--palm)]">
                <CheckCircle2 className="h-4 w-4" />
                Online &amp; Siap Melayani
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Action Banner for Owners */}
      <section className="island-shell rounded-3xl p-6 sm:p-10 border border-[var(--line)]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <Badge
              variant="outline"
              className="island-kicker mb-3 inline-flex items-center gap-1.5 border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs text-[var(--kicker)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--lagoon-deep)]" />
              Solusi Pemilik Properti
            </Badge>
            <h2 className="display-title text-2xl font-bold text-[var(--sea-ink)] sm:text-3xl">
              Ingin mendaftarkan kos atau butuh panduan khusus owner?
            </h2>
            <p className="mt-2 text-sm text-[var(--sea-ink-soft)] sm:text-base leading-relaxed">
              Mulai pasang iklan kos Anda secara gratis atau buka dashboard
              pemilik untuk mengelola inventaris kamar dan riwayat pencairan
              dana.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[var(--lagoon-deep)] text-white hover:bg-[#246f76]"
            >
              <Link to="/owner/properties/new">
                Pasang Iklan Kos
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-[var(--chip-line)]"
            >
              <Link to="/pemilik/dashboard">Buka Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function FaqAccordion({
  items,
  ownerBadge,
}: {
  items: FaqItem[]
  ownerBadge?: boolean
}) {
  if (items.length === 0) {
    return (
      <div className="island-shell rounded-2xl border border-[var(--line)] py-12 text-center">
        <p className="text-sm font-medium text-[var(--sea-ink)]">
          Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian.
        </p>
        <p className="text-xs text-[var(--sea-ink-soft)] mt-1">
          Coba gunakan kata kunci yang lebih umum atau hubungi tim customer
          service kami.
        </p>
      </div>
    )
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={items.slice(0, 1).map((i) => i.id)}
      className="flex flex-col gap-3"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="island-shell rounded-2xl border border-[var(--line)] px-5 py-0.5 transition-all duration-200"
        >
          <AccordionTrigger className="py-4 text-left hover:no-underline">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge
                variant="secondary"
                className="rounded-full bg-[rgba(79,184,178,0.14)] text-[var(--lagoon-deep)] font-semibold border-0 text-[0.7rem]"
              >
                {item.category}
              </Badge>
              {ownerBadge ? (
                <Badge
                  variant="outline"
                  className="rounded-full bg-[rgba(47,106,74,0.18)] text-[var(--palm)] border-0 text-[0.65rem] font-semibold"
                >
                  Khusus Owner
                </Badge>
              ) : null}
              <span className="font-semibold text-sm sm:text-base text-[var(--sea-ink)]">
                {item.question}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-[var(--sea-ink-soft)] leading-relaxed pt-1 pb-4">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
