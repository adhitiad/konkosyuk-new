import { Link } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'

type FooterLink =
  | { label: string; to: LinkProps['to']; href?: undefined }
  | { label: string; href: string; to?: undefined }

const sections: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Konkosyuk',
    links: [
      { label: 'Tentang Kami', to: '/about' },
      { label: 'Cara Booking', href: '/#cara-booking' },
      { label: 'Pencarian Detail', to: '/cari' },
      { label: 'Karier', href: 'mailto:karir@konkosyuk.id' },
    ],
  },
  {
    title: 'Untuk Pencari Kos',
    links: [
      { label: 'Semua Kos', to: '/properties' },
      { label: 'Kategori Kos', href: '/#kategori' },
      { label: 'Kota Populer', href: '/#kota' },
      { label: 'Kos Rekomendasi', href: '/#rekomendasi' },
    ],
  },
  {
    title: 'Untuk Pemilik Kos',
    links: [
      { label: 'Pasang Iklan Gratis', to: '/owner/properties/new' },
      { label: 'Kelola Properti', to: '/owner/properties' },
      { label: 'Dashboard Pemilik', to: '/pemilik/dashboard' },
      { label: 'Bantuan Owner', href: '/bantuan?tab=owner' },
    ],
  },
  {
    title: 'Bantuan & Akun',
    links: [
      { label: 'Pusat Bantuan & FAQ', to: '/bantuan' },
      {
        label: 'Hubungi Customer Care',
        href: 'mailto:support@konkosyuk.id?subject=Bantuan%20Konkosyuk',
      },
      { label: 'Masuk Akun', to: '/sign-in' },
      { label: 'Daftar Akun Baru', to: '/sign-up' },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-20 px-4 pb-12 pt-14 text-[var(--sea-ink-soft)]">
      <div className="page-wrap">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-[0.65rem] font-bold text-white">
                K
              </span>
              Konkosyuk
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Platform pencarian & booking kos #1 di Indonesia. Temukan kos
              favoritmu dengan mudah, aman, dan transparan.
            </p>
          </div>
          {sections.map((s) => (
            <div key={s.title}>
              <h3 className="m-0 mb-3 text-sm font-semibold text-[var(--sea-ink)]">
                {s.title}
              </h3>
              <ul className="m-0 list-none space-y-2 p-0 text-sm">
                {s.links.map((l) =>
                  'to' in l ? (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
                      >
                        {l.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] pt-6 text-center text-xs sm:flex-row sm:text-left">
          <p className="m-0">
            &copy; {year} Konkosyuk. Semua hak cipta dilindungi.
          </p>
          <p className="island-kicker m-0">Dibuat di Indonesia 🇮🇩</p>
        </div>
      </div>
    </footer>
  )
}
