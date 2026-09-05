import {
  Bath,
  Bed,
  Building2,
  Compass,
  DoorOpen,
  Hotel,
  Lock,
  MonitorSmartphone,
  Snowflake,
  Sofa,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Wifi,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type Facility = { name: string; icon: LucideIcon }

export const facilities: Facility[] = [
  { name: 'WiFi', icon: Wifi },
  { name: 'Kamar Mandi Dalam', icon: Bath },
  { name: 'AC', icon: Snowflake },
  { name: 'Kasur', icon: Bed },
  { name: 'Lemari', icon: DoorOpen },
  { name: 'Meja & Kursi', icon: MonitorSmartphone },
  { name: 'TV', icon: Tv },
  { name: 'Dapur Bersama', icon: UtensilsCrossed },
  { name: 'Ruang Tamu', icon: Sofa },
  { name: 'Laundry', icon: WashingMachine },
  { name: 'CCTV 24 Jam', icon: Lock },
  { name: 'Akses 24 Jam', icon: Compass },
]

export const categories = [
  {
    key: 'putri',
    label: 'Kos Putri',
    desc: 'Aman, nyaman, dan lingkungan yang terjaga untuk kamu.',
    accent: 'from-rose-400/30 to-pink-300/10',
    icon: 'P',
    link: '/properties?type=putri',
  },
  {
    key: 'putra',
    label: 'Kos Putra',
    desc: 'Fasilitas lengkap dengan akses mudah ke kampus & kantor.',
    accent: 'from-sky-400/30 to-cyan-300/10',
    icon: 'L',
    link: '/properties?type=putra',
  },
  {
    key: 'campur',
    label: 'Kos Campur',
    desc: 'Untuk pasangan atau komunitas profesional muda.',
    accent: 'from-violet-400/30 to-indigo-300/10',
    icon: 'C',
    link: '/properties?type=campur',
  },
  {
    key: 'harian',
    label: 'Kos Harian',
    desc: 'Sewa harian fleksibel, cocok untuk transit & liburan.',
    accent: 'from-amber-400/30 to-yellow-300/10',
    icon: 'H',
    link: '/properties?type=harian',
  },
  {
    key: 'mingguan',
    label: 'Kos Mingguan',
    desc: 'Solusi sementara yang lebih hemat dari harian.',
    accent: 'from-emerald-400/30 to-green-300/10',
    icon: 'M',
    link: '/properties?type=mingguan',
  },
  {
    key: 'bulanan',
    label: 'Kos Bulanan',
    desc: 'Paling dicari. Cicilan ringan, banyak promo.',
    accent: 'from-teal-400/30 to-emerald-300/10',
    icon: 'B',
    link: '/properties?type=bulanan',
  },
] as const

export type Category = (typeof categories)[number]

export const popularCities = [
  { name: 'Jakarta', count: 12_480, slug: 'jakarta' },
  { name: 'Bandung', count: 8_215, slug: 'bandung' },
  { name: 'Yogyakarta', count: 6_902, slug: 'yogyakarta' },
  { name: 'Surabaya', count: 7_310, slug: 'surabaya' },
  { name: 'Semarang', count: 4_180, slug: 'semarang' },
  { name: 'Depok', count: 3_540, slug: 'depok' },
  { name: 'Bekasi', count: 3_120, slug: 'bekasi' },
  { name: 'Bogor', count: 2_980, slug: 'bogor' },
  { name: 'Malang', count: 2_640, slug: 'malang' },
  { name: 'Denpasar', count: 1_910, slug: 'denpasar' },
  { name: 'Medan', count: 1_870, slug: 'medan' },
  { name: 'Makassar', count: 1_540, slug: 'makassar' },
] as const

export type Kos = {
  id: string
  name: string
  city: string
  district: string
  type: Category['key']
  price: number
  period: 'bulan' | 'minggu' | 'hari'
  rating: number
  reviews: number
  facilities: string[]
  badge?: string
  initial: string
  hue: string
}

export const featuredKos: Kos[] = [
  {
    id: 'k-001',
    name: 'Kost Putri Mawar Dekat Univ. Indonesia',
    city: 'Depok',
    district: 'Beji',
    type: 'putri',
    price: 1_650_000,
    period: 'bulan',
    rating: 4.9,
    reviews: 128,
    facilities: [
      'WiFi',
      'Kamar Mandi Dalam',
      'AC',
      'Lemari',
      'CCTV 24 Jam',
      'Akses 24 Jam',
    ],
    badge: 'Promo',
    initial: 'M',
    hue: 'from-rose-300 to-pink-200',
  },
  {
    id: 'k-002',
    name: 'Kos Putra Pelangi Seturan',
    city: 'Yogyakarta',
    district: 'Seturan',
    type: 'putra',
    price: 1_100_000,
    period: 'bulan',
    rating: 4.7,
    reviews: 86,
    facilities: [
      'WiFi',
      'Kamar Mandi Dalam',
      'Kasur',
      'Meja & Kursi',
      'Dapur Bersama',
    ],
    badge: 'Terlaris',
    initial: 'P',
    hue: 'from-sky-300 to-cyan-200',
  },
  {
    id: 'k-003',
    name: 'Kos Campur Sudirman Park Studio',
    city: 'Jakarta',
    district: 'Setiabudi',
    type: 'campur',
    price: 3_200_000,
    period: 'bulan',
    rating: 4.8,
    reviews: 214,
    facilities: [
      'WiFi',
      'AC',
      'TV',
      'Kamar Mandi Dalam',
      'Laundry',
      'Akses 24 Jam',
    ],
    badge: 'Premium',
    initial: 'S',
    hue: 'from-violet-300 to-indigo-200',
  },
  {
    id: 'k-004',
    name: 'Kos Harian Dago Asri',
    city: 'Bandung',
    district: 'Cidadap',
    type: 'harian',
    price: 185_000,
    period: 'hari',
    rating: 4.6,
    reviews: 47,
    facilities: ['WiFi', 'Kamar Mandi Dalam', 'TV', 'Kasur', 'Ruang Tamu'],
    initial: 'D',
    hue: 'from-amber-300 to-yellow-200',
  },
  {
    id: 'k-005',
    name: 'Kos Bulanan Gateway Pasteur',
    city: 'Bandung',
    district: 'Sukajadi',
    type: 'bulanan',
    price: 1_350_000,
    period: 'bulan',
    rating: 4.8,
    reviews: 162,
    facilities: ['WiFi', 'Kamar Mandi Dalam', 'AC', 'Lemari', 'CCTV 24 Jam'],
    badge: 'Baru',
    initial: 'G',
    hue: 'from-teal-300 to-emerald-200',
  },
  {
    id: 'k-006',
    name: 'Kos Putri Cendekia Tembalang',
    city: 'Semarang',
    district: 'Tembalang',
    type: 'putri',
    price: 1_250_000,
    period: 'bulan',
    rating: 4.7,
    reviews: 98,
    facilities: [
      'WiFi',
      'Kamar Mandi Dalam',
      'Kasur',
      'Lemari',
      'Akses 24 Jam',
    ],
    initial: 'C',
    hue: 'from-rose-300 to-pink-200',
  },
  {
    id: 'k-007',
    name: 'Kos Putra Darmo Permai',
    city: 'Surabaya',
    district: 'Wonokromo',
    type: 'putra',
    price: 1_400_000,
    period: 'bulan',
    rating: 4.6,
    reviews: 73,
    facilities: ['WiFi', 'Kamar Mandi Dalam', 'AC', 'Meja & Kursi', 'Laundry'],
    initial: 'D',
    hue: 'from-sky-300 to-cyan-200',
  },
  {
    id: 'k-008',
    name: 'Kos Mingguan Renon Sanur',
    city: 'Denpasar',
    district: 'Renon',
    type: 'mingguan',
    price: 750_000,
    period: 'minggu',
    rating: 4.5,
    reviews: 41,
    facilities: [
      'WiFi',
      'Kamar Mandi Dalam',
      'AC',
      'Dapur Bersama',
      'Ruang Tamu',
    ],
    initial: 'R',
    hue: 'from-emerald-300 to-green-200',
  },
]

export const whyUs = [
  {
    title: '100% Listing Terverifikasi',
    desc: 'Setiap kos dicek langsung oleh tim surveyor kami. Foto & harga sesuai kenyataan.',
    icon: Lock,
  },
  {
    title: 'Pencarian Paling Lengkap',
    desc: 'Filter berdasarkan fasilitas, jarak ke kampus, harga, tipe, dan tanggal masuk.',
    icon: Building2,
  },
  {
    title: 'Tanpa Biaya untuk Pencari',
    desc: 'Cari, bandingkan, dan booking kos favorit kamu gratis 100%.',
    icon: Hotel,
  },
  {
    title: 'Booking Aman & Cepat',
    desc: 'Konfirmasi instan, uang aman, dan bisa langsung pindah kapan saja.',
    icon: DoorOpen,
  },
] as const

export const testimonials = [
  {
    name: 'Aulia R.',
    role: 'Mahasiswi UI',
    avatar: 'A',
    quote:
      'Cari kos deket kampus cuma 10 menit. Banyak pilihan dan reviewnya jujur-jujur. Recommended!',
    hue: 'from-rose-300 to-pink-200',
  },
  {
    name: 'Bima P.',
    role: 'Karyawan Swasta, Jakarta',
    avatar: 'B',
    quote:
      'Pindah ke Sudirman karena kerjaan. Konkosyuk bantu aku dapet kos yang sesuai budget tanpa ribet survey.',
    hue: 'from-sky-300 to-cyan-200',
  },
  {
    name: 'Citra W.',
    role: 'Pemilik Kos, Bandung',
    avatar: 'C',
    quote:
      'Pasang iklan gratis, dapet 12 penyewa baru dalam sebulan. Fitur chat sama tur virtualnya membantu banget.',
    hue: 'from-violet-300 to-indigo-200',
  },
] as const
