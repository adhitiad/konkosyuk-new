# Aturan Proyek

## Bahasa Indonesia

- Proyek ini menggunakan bahasa Indonesia sebagai bahasa utama untuk dokumentasi, komentar kode, dan string antarmuka pengguna. Gunakan bahasa Indonesia yang jelas dan ringkas; hindari bahasa gaul, singkatan, atau istilah asing yang tidak perlu. Gunakan bahasa Inggris hanya untuk nama paket, dependensi, dan istilah teknis yang umum.
- git commit dan PR harus menggunakan bahasa Indonesia. Gunakan bahasa Inggris hanya untuk istilah teknis yang umum, nama paket, dependensi, dan nama file.
- Gunakan Bahasa Indonesia yang konsisten di seluruh proyek, termasuk di komentar kode, dokumentasi, Jawaban Prompt dan string antarmuka pengguna. Hindari campuran bahasa yang membingungkan.

## Stack

- TanStack Start (React 19, Vite 8, Nitro) + TanStack Router/Query, oRPC (dual transport OpenAPI/RPC), Better Auth, Prisma 7 + PostgreSQL, Paraglide i18n, Tailwind CSS v4 + shadcn/ui, Zod.
- Dideploy ke Vercel. Variabel dengan awalan `VITE_` dimasukkan ke dalam bundle browser; simpan rahasia (`DATABASE_URL`, `BETTER_AUTH_SECRET`, …) tanpa awalan.

## Package manager dan runtime

- Gunakan **Bun 1.4**. Jangan pernah menggunakan `npm`, `yarn`, atau `pnpm` (blok `pnpm` di `package.json` adalah sisa template — abaikan).
- Instal dengan `bun install`, tambahkan dependensi dengan `bun add <package>`, jalankan CLI satu kali dengan `bunx --bun <package>`.
- Selalu jalankan skrip dengan `bun --bun run <script>`; jangan pernah mengedit lockfile secara manual.

## Perintah dan validasi

```bash
bun install                     # install dependensi
bun --bun run dev               # server dev di :3000 (auto-regenerasi routes)
bun --bun run build             # build produksi
bun --bun run lint              # eslint
bun --bun run check             # prettier --check
bun --bun run format            # prettier --write + eslint --fix
bun --bun run generate-routes   # regenerasi src/routeTree.gen.ts
bunx --bun tsc --noEmit         # typecheck (tidak ada skrip typecheck)
```

- Setelah perubahan kode, jalankan setidaknya `bun --bun run lint` dan `bun --bun run check`; tingkatkan ke `bunx --bun tsc --noEmit` atau `bun --bun run build` jika diperlukan.
- Tidak ada framework pengujian; jangan menambahkan kecuali secara eksplisit diminta.

## Prisma dan database

- Klien Prisma dihasilkan ke `src/generated/prisma` (gitignored). Jalankan `bun --bun run db:generate` setelah perubahan `prisma/schema.prisma` apa pun, dan sebelum build/dev pertama setelah menginstal dependensi.
- Impor klien dan tipe dari `#/generated/prisma/client` — jangan pernah dari `@prisma/client`.
- Hanya gunakan skrip `db:*` (`db:generate`, `db:push`, `db:migrate`, `db:studio`, `db:seed`, `db:check`); mereka memuat `.env.local` melalui `dotenv-cli`. Jangan pernah memanggil `prisma` secara langsung.
- `prisma.config.ts` memilih `DIRECT_URL` daripada `DATABASE_URL` untuk operasi CLI (migrasi tidak boleh berjalan melalui pooler mode transaksi). `src/db.ts` mendukung `prisma+postgres://` (Accelerate) dan `postgresql://` (langsung via `@prisma/adapter-pg`) — pertahankan kedua jalur.
- Untuk kesalahan koneksi atau skema, jalankan `bun --bun run db:check` terlebih dahulu; itu mendiagnosis konfigurasi URL, keterjangkauan, dan query nyata.
- Seed (`db:seed`, `seed:users`, `seed:platform-config`) memodifikasi database — lihat "Keamanan database" sebelum menjalankannya.

## Lingkungan dan rahasia

- Env dimuat dari `.env.local` (gitignored). Diperlukan untuk dev: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- `src/env.ts` (t3-env) hanya memvalidasi `SERVER_URL` dan `VITE_APP_TITLE`; `DATABASE_URL` dan `BETTER_AUTH_*` dibaca langsung dari `process.env`. Tambahkan variabel baru ke `src/env.ts` dengan skema Zod daripada baca `process.env` yang tidak terstruktur.
- Jangan pernah commit `.env.local`, kredensial, URL database, atau rahasia lain.

## Konvensi sumber

- Mode ketat TypeScript; hindari `any` dan type assertion yang tidak perlu.
- Gunakan alias `#/*` (memetakan ke `./src/*`) daripada import relatif induk.
- Pemformatan diperkuat oleh Prettier: tanpa titik koma, kutip tunggal, trailing comma. Jalankan `bun --bun run format` daripada memformat manual.
- Gunakan import tipe-only (`import type` / `import { type X }`); `verbatimModuleSyntax` aktif.
- Hapus import, variabel, dan parameter yang tidak digunakan — mereka menyebabkan gagal lint dan typecheck.
- Urutan import tidak diperkuat (`import/order` dan `sort-imports` dimatikan di `eslint.config.js`); sesuaikan dengan file yang sedang diedit.
- Gunakan kembali helper dan pola yang ada sebelum menambahkan abstraksi baru; komentari hanya logika yang tidak jelas.
- Buat perubahan yang tepat dan minimal; jangan memodifikasi file yang tidak terkait.

## UI dan i18n

- shadcn/ui: gaya `new-york`, warna dasar zinc, ikon lucide. Tambahkan komponen dengan `bunx --bun shadcn@latest add <component>`; gaya dengan `cn()` dari `#/lib/utils` dan alias `#/components`, `#/components/ui`, `#/lib`, `#/hooks`.
- Paraglide i18n: locale dasar `id` ditambah `en`, `zh`, `th`, `vi`, `ko`, `ru`, `fil` (lihat `project.inlang/settings.json`). Tambahkan string antarmuka pengguna sebagai pesan di setiap `messages/{locale}.json`, mengikuti penamaan kunci yang ada.
- Jangan pernah mengedit apa pun di bawah `src/paraglide/` — itu diregenerasi oleh plugin Vite saat dev/build.

## TanStack Router dan file yang dihasilkan

- Jangan pernah mengedit `src/routeTree.gen.ts` secara manual. Setelah menambah atau menghapus route, jalankan `bun --bun run generate-routes` dan commit file yang diregenerasi.
- Catch-all route diakhiri dengan `$` pada nama file (misal `api.$.ts`, `api.rpc.$.ts`, `api/webhooks/qstash/$.ts`).
- Letakkan `import '#/polyfill'` terlebih dahulu di file route server yang menggunakan oRPC atau webhooks, sesuai penggunaan yang ada (`src/routes/api.$.ts`, `src/routes/api.rpc.$.ts`).
- Pertahankan pola TanStack Router, Start, Query, dan oRPC yang ada.

## Keamanan API, auth, dan database

- Pertahankan dual transport oRPC: OpenAPI di `/api` (`src/routes/api.$.ts`) dan RPC di `/api/rpc` (`src/routes/api.rpc.$.ts`), keduanya melayani `src/orpc/router`. Jangan menambahkan transport lain.
- Better Auth berada di `src/lib/auth.ts` (server; Prisma adapter dengan pemetaan field snake_case) dan `src/lib/auth-client.ts` (klien). Batasi perubahan auth di modul-modul ini; field user/session baru harus ditambahkan ke `prisma/schema.prisma` dan peta `fields` di `src/lib/auth.ts`, atau query akan gagal dengan "Unknown argument".
- Tampilkan error secara eksplisit; jangan pernah menambahkan catch luas, fallback diam, atau respons sukses untuk kegagalan.
- Validasi input pengguna di batas API dengan Zod melalui prosedur oRPC yang ada.
- Jangan pernah mereset, menghapus, mendorong, memigrasi, atau men-seed database tanpa persetujuan eksplisit.

## Alur kerja dan tinjauan kode

1. Periksa kode dan konvensi yang ada sebelum mengedit.
2. Buat implementasi terpendek yang lengkap.
3. Validasi: `bun --bun run lint` + `bun --bun run check`, kemudian typecheck atau build jika diperlukan.
4. Tinjau diff; hapus file sementara dan output debug.
5. Buka PR GitHub untuk setiap perubahan; jangan pernah merge PR Anda sendiri — minta tinjauan dari anggota tim lain.

## Masalah yang Diketahui

- `bunx @tanstack/intent` menyelesaikan paket bin yang salah (`@tanstack/devtools`) dan gagal. Panggil secara langsung: `node node_modules/@tanstack/intent/dist/cli.mjs list` (atau `load <package>#<skill>`).
- README mereferensikan `.env.example` untuk deploy Vercel, tetapi file tersebut tidak ada — gunakan `.env.local` dan teks README sebagai referensi variabel.
