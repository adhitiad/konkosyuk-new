# Aturan Proyek

> Dokumen ini adalah sumber tunggal untuk aturan pengembangan. Saat aturan bentrok, yang berlaku adalah urutan: aturan lingkungan (`.kilo/rules/*.md`) > AGENTS.md > README.

## Daftar Isi

1. [Bahasa](#bahasa-indonesia)
2. [Stack teknis](#stack-teknis)
3. [Package manager](#package-manager-dan-runtime)
4. [Perintah & validasi](#perintah-dan-validasi)
5. [Prisma & database](#prisma-dan-database)
6. [Keamanan database](#keamanan-database)
7. [Environment & rahasia](#lingkungan-dan-rahasia)
8. [Konvensi sumber](#konvensi-sumber)
9. [UI & i18n](#ui-dan-i18n)
10. [Router & file yang dihasilkan](#tanstack-router-dan-file-yang-dihasilkan)
11. [Skill & intent](#skill-dan-intent)
12. [Keamanan API & auth](#keamanan-api-auth-dan-database)
13. [Alur kerja](#alur-kerja-dan-tinjauan-kode)
14. [Masalah diketahui](#masalah-yang-diketahui)

## Bahasa Indonesia

- Proyek menggunakan bahasa Indonesia sebagai bahasa utama untuk dokumentasi, komentar kode, string antarmuka pengguna, jawaban prompt, pesan commit, dan deskripsi PR. Gunakan bahasa yang jelas dan ringkas; hindari bahasa gaul, singkatan, atau istilah asing yang tidak perlu. Bahasa Inggris hanya untuk nama paket, dependensi, nama file, dan istilah teknis yang umum.
- Konsisten di seluruh proyek; jangan campur dua bahasa dalam satu string atau komentar.

## Stack teknis

| Lapisan        | Teknologi                                                                |
| -------------- | ------------------------------------------------------------------------ |
| Framework      | TanStack Start (React 19, Vite 8, Nitro)                                 |
| Routing & data | TanStack Router, TanStack Query, TanStack Form                           |
| API            | oRPC (dual transport OpenAPI di `/api` + RPC di `/api/rpc`)              |
| Autentikasi    | Better Auth (server `src/lib/auth.ts`, client `src/lib/auth-client.ts`)  |
| ORM & DB       | Prisma 7 + PostgreSQL (output `src/generated/prisma`)                    |
| Validasi       | Zod (di batas API dan formulir)                                          |
| UI             | shadcn/ui (gaya `new-york`, zinc, ikon lucide) + Tailwind CSS v4         |
| HTTP client    | `axios` (bukan `fetch` langsung)                                         |
| i18n           | Paraglide JS (base `id`, plus `en`, `zh`, `th`, `vi`, `ko`, `ru`, `fil`) |
| Deploy         | Vercel (`framework: "tanstack-start"`)                                   |

Aturan terkait: lihat [Stack](STACK) singkat di bawah.

- `VITE_`-prefixed vars di-inline ke bundle browser; simpan rahasia (`DATABASE_URL`, `BETTER_AUTH_SECRET`, …) tanpa awalan.

## Package manager dan runtime

- Gunakan **Bun 1.4**. Jangan pernah menggunakan `npm`, `yarn`, atau `pnpm` (blok `pnpm` di `package.json` adalah sisa template — abaikan).
- Instal dengan `bun install`, tambah dependensi dengan `bun add <package>`, jalankan CLI satu kali dengan `bunx --bun <package>`.
- Selalu jalankan skrip dengan `bun --bun run <script>`; jangan pernah mengedit lockfile secara manual.

## Perintah dan validasi

```bash
# Inti
bun install                     # instal dependensi
bun --bun run dev               # server dev di :3000 (auto-regenerasi routes)
bun --bun run build             # build produksi
bun --bun run lint              # eslint
bun --bun run check             # prettier --check
bun --bun run format            # prettier --write + eslint --fix
bunx --bun tsc --noEmit         # typecheck (tidak ada skrip typecheck)
bun --bun run generate-routes   # regenerasi src/routeTree.gen.ts

# Prisma (semua melewati dotenv-cli; jangan panggil prisma langsung)
bun --bun run db:generate       # generate client (wajib sebelum build/dev pertama)
bun --bun run db:check          # diagnostik URL/koneksi/query
bun --bun run db:push | db:migrate | db:studio | db:seed   # lihat Keamanan database
```

Tangga validasi setelah perubahan kode:

1. Minimum: `bun --bun run lint` + `bun --bun run check`.
2. Tambah: `bunx --bun tsc --noEmit` saat menyentuh tipe publik, API, atau dependensi.
3. Penuh: `bun --bun run build` saat menyentuh router, polyfill, atau konfigurasi build.

Tidak ada framework pengujian; jangan menambahkan kecuali secara eksplisit diminta.

## Prisma dan database

- Klien Prisma dihasilkan ke `src/generated/prisma` (gitignored). Jalankan `bun --bun run db:generate` setelah perubahan `prisma/schema.prisma` apa pun, dan sebelum build/dev pertama setelah menginstal dependensi.
- Impor klien dan tipe dari `#/generated/prisma/client` — jangan pernah dari `@prisma/client`.
- Hanya gunakan skrip `db:*`; mereka memuat `.env.local` melalui `dotenv-cli`. Jangan pernah memanggil `prisma` secara langsung.
- `prisma.config.ts` memilih `DIRECT_URL` daripada `DATABASE_URL` untuk operasi CLI (migrasi tidak boleh berjalan melalui pooler mode transaksi). `src/db.ts` mendukung `prisma+postgres://` (Accelerate) dan `postgresql://` (langsung via `@prisma/adapter-pg`) — pertahankan kedua jalur.
- Untuk kesalahan koneksi atau skema, jalankan `bun --bun run db:check` terlebih dahulu; itu mendiagnosis konfigurasi URL, keterjangkauan, dan query nyata.

## Keamanan database

Skrip `db:push`, `db:migrate`, `db:seed`, `seed:users`, dan `seed:platform-config` **memodifikasi database**. Sebelum menjalankan salah satunya:

1. Konfirmasi env target (`DATABASE_URL` / `DIRECT_URL` di `.env.local`).
2. Dapatkan persetujuan eksplisit dari pengguna.
3. Untuk migrasi: buat/verifikasi file migrasi terlebih dahulu, lalu jalankan.
4. Untuk seed: jalankan di database non-produksi, atau snapshot dulu bila di produksi.
5. Untuk `db:push` di lingkungan bersama: jadwalkan di luar jam sibuk.

Dilarang keras menghapus, me-reset, atau men-drop database tanpa persetujuan eksplisit.

## Lingkungan dan rahasia

- Env dimuat dari `.env.local` (gitignored). Diperlukan untuk dev: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- `src/env.ts` (t3-env) hanya memvalidasi `SERVER_URL` dan `VITE_APP_TITLE`; `DATABASE_URL` dan `BETTER_AUTH_*` dibaca langsung dari `process.env`. Tambahkan variabel baru ke `src/env.ts` dengan skema Zod daripada baca `process.env` yang tidak terstruktur.
- Jangan pernah commit `.env.local`, kredensial, URL database, atau rahasia lain.
- Jika env hilang saat boot, gagal cepat dengan pesan yang menunjukkan variabel mana — jangan fallback diam ke nilai default produksi.

## Konvensi sumber

- Mode ketat TypeScript; hindari `any` dan type assertion yang tidak perlu.
- Gunakan alias `#/*` (memetakan ke `./src/*`) daripada import relatif induk.
- Pemformatan diperkuat oleh Prettier: tanpa titik koma, kutip tunggal, trailing comma. Jalankan `bun --bun run format` daripada memformat manual.
- Gunakan import tipe-only (`import type` / `import { type X }`); `verbatimModuleSyntax` aktif.
- Hapus import, variabel, dan parameter yang tidak digunakan — mereka menyebabkan gagal lint dan typecheck.
- Urutan import tidak diperkuat (`import/order` dan `sort-imports` dimatikan di `eslint.config.js`); sesuaikan dengan file yang sedang diedit.
- Gunakan kembali helper dan pola yang ada sebelum menambahkan abstraksi baru; komentari hanya logika yang tidak jelas.
- Buat perubahan yang tepat dan minimal; jangan memodifikasi file yang tidak terkait.
- Satu file sumber: 150–355 baris. Jika lebih, pecah menjadi file baru dengan nama deskriptif sesuai folder (`src/components/MyComponent.tsx`, `src/utils/myUtility.ts`, dst.).

## UI dan i18n

- shadcn/ui: gaya `new-york`, warna dasar zinc, ikon lucide. Tambahkan komponen dengan `bunx --bun shadcn@latest add <component>`; gaya dengan `cn()` dari `#/lib/utils` dan alias `#/components`, `#/components/ui`, `#/lib`, `#/hooks`.
- Pakai komponen Radix UI dan `lucide-react` yang sudah tersedia sebelum membuat solusi UI baru.
- Wajib menggunakan Tailwind CSS; hindari CSS kustom kecuali ada alasan jelas.
- Paraglide i18n: locale dasar `id` ditambah `en`, `zh`, `th`, `vi`, `ko`, `ru`, `fil` (lihat `project.inlang/settings.json`). Tambahkan string antarmuka pengguna sebagai pesan di setiap `messages/{locale}.json`, mengikuti penamaan kunci yang ada.
- Jangan pernah mengedit apa pun di bawah `src/paraglide/` — itu diregenerasi oleh plugin Vite saat dev/build.
- Jangan menulis string terjemahan langsung jika pesan lokal sudah tersedia.
- Untuk HTTP client gunakan `axios`, bukan `fetch` langsung.

## TanStack Router dan file yang dihasilkan

- Jangan pernah mengedit `src/routeTree.gen.ts` secara manual. Setelah menambah atau menghapus route, jalankan `bun --bun run generate-routes` dan commit file yang diregenerasi.
- Catch-all route diakhiri dengan `$` pada nama file (misal `api.$.ts`, `api.rpc.$.ts`, `api/webhooks/qstash/$.ts`).
- Letakkan `import '#/polyfill'` terlebih dahulu di file route server yang menggunakan oRPC atau webhooks, sesuai penggunaan yang ada (`src/routes/api.$.ts`, `src/routes/api.rpc.$.ts`).
- Pertahankan pola TanStack Router, Start, Query, dan oRPC yang ada.

## Skill dan intent

- Sebelum menyunting file untuk tugas besar, jalankan `node node_modules/@tanstack/intent/dist/cli.mjs list` dari root workspace untuk melihat skill lokal yang tersedia. Jika ada skill yang cocok dengan tugas, jalankan `node node_modules/@tanstack/intent/dist/cli.mjs load <package>#<skill>` dan gunakan panduan `SKILL.md`-nya saat membuat perubahan.
- Monorepo: jalankan pemindaian skill dari root workspace dan utamakan skill lokal untuk paket yang sedang diubah.
- Jika beberapa skill cocok, pilih yang paling spesifik untuk paket atau concern yang sedang dikerjakan; muat skill tambahan hanya jika tugas melintasi paket atau concern lain.
- Pemicu untuk memuat skill lebih diutamakan daripada dugaan; ketika ragu, muat dulu.

## Keamanan API, auth, dan database

- Pertahankan dual transport oRPC: OpenAPI di `/api` (`src/routes/api.$.ts`) dan RPC di `/api/rpc` (`src/routes/api.rpc.$.ts`), keduanya melayani `src/orpc/router`. Jangan menambahkan transport lain.
- Better Auth berada di `src/lib/auth.ts` (server; Prisma adapter dengan pemetaan field snake_case) dan `src/lib/auth-client.ts` (klien). Batasi perubahan auth di modul-modul ini; field user/session baru harus ditambahkan ke `prisma/schema.prisma` dan peta `fields` di `src/lib/auth.ts`, atau query akan gagal dengan "Unknown argument".
- Tampilkan error secara eksplisit; jangan pernah menambahkan catch luas, fallback diam, atau respons sukses untuk kegagalan.
- Validasi input pengguna di batas API dengan Zod melalui prosedur oRPC yang ada.
- Lihat [Keamanan database](#keamanan-database) untuk aturan `db:*`.

## Alur kerja dan tinjauan kode

Checklist sebelum push:

1. Periksa kode dan konvensi yang ada sebelum mengedit.
2. Buat implementasi terpendek yang lengkap.
3. Validasi sesuai [Tangga validasi](#perintah-dan-validasi).
4. Tinjau diff; hapus file sementara dan output debug.
5. Pastikan `.env.local`, rahasia, dan artefak build tidak masuk diff.
6. Buka PR GitHub untuk setiap perubahan; jangan pernah merge PR Anda sendiri — minta tinjauan dari anggota tim lain.

## Masalah yang Diketahui

- `bunx @tanstack/intent` menyelesaikan paket bin yang salah (`@tanstack/devtools`) dan gagal. Panggil secara langsung: `node node_modules/@tanstack/intent/dist/cli.mjs list` (atau `load <package>#<skill>`).
- README mereferensikan `.env.example` untuk deploy Vercel, tetapi file tersebut tidak ada — gunakan `.env.local` dan teks README sebagai referensi variabel.
- `bun install` kadang meninggalkan symlink `node_modules/.bin` yang usang setelah pertukaran versi Bun; hapus `node_modules` dan instal ulang bila CLI (`prisma`, `tsr`) mengeluh tentang modul hilang.
