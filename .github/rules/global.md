# Aturan Proyek

## Stack

- TanStack Start (React 19, Vite 8, Nitro) + TanStack Router/Query, oRPC (transport dual OpenAPI/RPC), Better Auth, Prisma 7 + PostgreSQL, Paraglide i18n, Tailwind CSS v4 + shadcn/ui, Zod.
- Deploy ke Vercel. Variabel berawalan `VITE_` akan disisipkan ke dalam bundle browser; pertahankan variabel rahasia (`DATABASE_URL`, `BETTER_AUTH_SECRET`, …) tanpa awalan.

## Package manager dan runtime

- Gunakan **Bun 1.4**. Jangan pernah gunakan `npm`, `yarn`, atau `pnpm` (blok `pnpm` di `package.json` adalah sisa template — abaikan).
- Install dengan `bun install`, tambah dependensi dengan `bun add <package>`, jalankan CLI sekali jalan dengan `bunx --bun <package>`.
- Selalu jalankan script sebagai `bun --bun run <script>`; jangan pernah mengedit lockfile secara manual.

## Perintah dan validasi

```bash
bun install                     # install dependensi
bun --bun run dev               # dev server di :3000 (auto-regenerate routes)
bun --bun run build             # production build
bun --bun run lint              # eslint
bun --bun run check             # prettier --check
bun --bun run format            # prettier --write + eslint --fix
bun --bun run generate-routes   # regenerate src/routeTree.gen.ts
bunx --bun tsc --noEmit         # typecheck (tidak ada script typecheck)
```

- Setelah perubahan kode, jalankan minimal `bun --bun run lint` dan `bun --bun run check`; naik ke `bunx --bun tsc --noEmit` atau `bun --bun run build` bila diperlukan.
- Tidak ada framework test; jangan tambahkan kecuali diminta secara eksplisit.

## Prisma dan database

- Prisma client di-generate ke `src/generated/prisma` (di-gitignore). Jalankan `bun --bun run db:generate` setelah setiap perubahan `prisma/schema.prisma`, dan sebelum build/dev pertama kali setelah install dependensi.
- Import client dan types dari `#/generated/prisma/client` — jangan pernah dari `@prisma/client`.
- Hanya gunakan script `db:*` (`db:generate`, `db:push`, `db:migrate`, `db:studio`, `db:seed`, `db:check`); script ini memuat `.env.local` via `dotenv-cli`. Jangan pernah panggil `prisma` secara langsung.
- `prisma.config.ts` memprioritaskan `DIRECT_URL` daripada `DATABASE_URL` untuk operasi CLI (migration tidak boleh berjalan melalui transaction-mode pooler). `src/db.ts` mendukung keduanya: `prisma+postgres://` (Accelerate) dan `postgresql://` (direct via `@prisma/adapter-pg`) — pertahankan kedua path.
- Untuk error k连接ivitas atau schema, jalankan `bun --bun run db:check` terlebih dahulu; script ini mendiagnosis konfigurasi URL, reachability, dan query nyata.
- Seed (`db:seed`, `seed:users`, `seed:platform-config`) melakukan mutasi database — lihat "Database safety" sebelum menjalankannya.

## Environment dan secrets

- Env dimuat dari `.env.local` (di-gitignore). Wajib untuk dev: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- `src/env.ts` (t3-env) hanya memvalidasi `SERVER_URL` dan `VITE_APP_TITLE`; `DATABASE_URL` dan `BETTER_AUTH_*` dibaca langsung dari `process.env`. Tambahkan variabel baru ke `src/env.ts` dengan Zod schema, bukan pembacaan `process.env` ad-hoc.
- Jangan pernah commit `.env.local`, kredensial, URL database, atau secret lainnya.

## Konvensi source

- TypeScript strict mode; hindari `any` dan type assertion yang tidak perlu.
- Gunakan alias `#/*` (memetakan ke `./src/*`) alih-alih import relatif ke parent.
- Formatting ditegakkan oleh Prettier: tanpa titik koma, single quote, trailing comma. Jalankan `bun --bun run format` daripada memformat manual.
- Gunakan type-only import (`import type` / `import { type X }`); `verbatimModuleSyntax` aktif.
- Hapus import, variabel, dan parameter yang tidak terpakai — akan gagal lint dan typecheck.
- Urutan import tidak ditegakkan (`import/order` dan `sort-imports` nonaktif di `eslint.config.js`); samakan dengan file yang sedang diedit.
- Pakai ulang helper dan pattern yang sudah ada sebelum menambah abstraksi baru; beri komentar hanya pada logika yang tidak obvious.
- Buat perubahan yang presisi dan minimal; jangan modifikasi file yang tidak terkait.

## UI dan i18n

- shadcn/ui: style `new-york`, warna dasar zinc, ikon lucide. Tambah komponen dengan `bunx --bun shadcn@latest add <component>`; style dengan `cn()` dari `#/lib/utils` dan alias `#/components`, `#/components/ui`, `#/lib`, `#/hooks`.
- Paraglide i18n: locale dasar `id` plus `en`, `zh`, `th`, `vi`, `ko`, `ru`, `fil` (lihat `project.inlang/settings.json`). Tambahkan string untuk user sebagai message di setiap `messages/{locale}.json`, ikuti penamaan key yang sudah ada.
- Jangan pernah edit apapun di bawah `src/paraglide/` — direktori ini di-regenerate oleh Vite plugin saat dev/build.

## TanStack Router dan file generated

- Jangan pernah edit `src/routeTree.gen.ts` secara manual. Setelah menambah atau menghapus route, jalankan `bun --bun run generate-routes` dan commit file yang sudah di-regenerate.
- Catch-all route diakhiri `$` pada nama file (contoh: `api.$.ts`, `api.rpc.$.ts`, `api/webhooks/qstash/$.ts`).
- Letakkan `import '#/polyfill'` di paling atas pada file server route yang menggunakan oRPC atau webhook, mengikuti pemakaian yang ada (`src/routes/api.$.ts`, `src/routes/api.rpc.$.ts`).
- Pertahankan pattern TanStack Router, Start, Query, dan oRPC yang sudah ada.

## API, auth, dan database safety

- Pertahankan dual transport oRPC: OpenAPI di `/api` (`src/routes/api.$.ts`) dan RPC di `/api/rpc` (`src/routes/api.rpc.$.ts`), keduanya melayani `src/orpc/router`. Jangan tambah transport lain.
- Better Auth berada di `src/lib/auth.ts` (server; Prisma adapter dengan pemetaan field snake_case) dan `src/lib/auth-client.ts` (client). Pertahankan perubahan auth di dalam kedua modul ini; field user/session baru harus ditambahkan ke `prisma/schema.prisma` dan map `fields` di `src/lib/auth.ts`, atau query akan gagal dengan "Unknown argument".
- Tampilkan error secara eksplisit; jangan pernah menambah catch yang terlalu luas, fallback diam, atau response berbentuk success untuk kegagalan.
- Validasi input user di batas API dengan Zod melalui prosedur oRPC yang sudah ada.
- Jangan pernah reset, drop, push, migrate, atau seed database tanpa persetujuan user secara eksplisit.

## Workflow dan code review

1. Periksa kode dan konvensi yang ada sebelum mengedit.
2. Buat implementasi yang paling kecil dan lengkap.
3. Validasi: `bun --bun run lint` + `bun --bun run check`, lalu typecheck atau build bila diperlukan.
4. Review diff; hapus file sementara dan output debug.
5. Buka GitHub PR untuk setiap perubahan; jangan pernah merge PR sendiri — minta review dari anggota tim lain.

## Gotcha yang diketahui

- `bunx @tanstack/intent` me-resolve bin package yang salah (`@tanstack/devtools`) dan gagal. Panggil langsung: `node node_modules/@tanstack/intent/dist/cli.mjs list` (atau `load <package>#<skill>`).
- README merujuk `.env.example` untuk deploy Vercel, tetapi file tersebut tidak ada — gunakan `.env.local` dan prosa di README sebagai referensi variabel.
