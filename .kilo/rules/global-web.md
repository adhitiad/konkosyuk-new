# Aturan Global Web

## Stack dan arsitektur

- Proyek menggunakan React 19, React DOM, TypeScript strict, Vite 8, dan TanStack Start.
- Gunakan TanStack Router untuk routing, TanStack Query untuk pengelolaan data, dan TanStack Form untuk formulir.
- Gunakan oRPC sebagai lapisan API; pertahankan dukungan transport OpenAPI dan RPC yang sudah ada.
- Gunakan Zod untuk validasi input dan tipe data di batas API maupun formulir.
- Gunakan Tailwind CSS 4 dengan plugin Vite, `tailwind-merge`, `clsx`, dan `class-variance-authority` untuk styling.
- Gunakan komponen Radix UI dan ikon `lucide-react` yang sudah tersedia sebelum membuat solusi UI baru.
- Gunakan Paraglide JS untuk internasionalisasi; jangan menulis teks terjemahan langsung jika pesan lokal sudah tersedia.
- Gunakan `axios` untuk permintaan HTTP; jangan menggunakan `fetch` secara langsung.

## Perintah pengembangan

- Gunakan Bun sebagai package manager dan runtime. Jangan menggunakan npm, yarn, atau pnpm.
- Instal dependensi dengan `bun install` dan tambahkan paket dengan `bun add <paket>`.
- Gunakan `bunx <perintah>` untuk menjalankan perintah yang tidak tersedia di Bun.
- Jalankan script menggunakan `bun --bun run <script>`.
- Perintah utama:

  ```bash
  bun --bun run dev
  bun --bun run build
  bun --bun run preview
  bun --bun run lint
  bun --bun run check
  bun --bun run format
  ```

- Server pengembangan berjalan pada port 3000.
- Jalankan `bun --bun run lint`, `bun --bun run format`, `bunx tsc --noEmit`, dan `bun --bun run check` setelah perubahan kode.
- Tidak ada test runner yang dikonfigurasi saat ini; jangan menambahkan test framework tanpa permintaan.
- Wajib Hukumnya saat semua check, lint, format, dan `tsc --noEmit`, tidak ada error dan warning yang dihasilkan.

## Routing dan file hasil generate

- Setelah menambah atau menghapus route, jalankan `bun --bun run generate-routes`.
- Jangan mengedit `src/routeTree.gen.ts` secara manual.
- Jangan mengedit output Paraglide yang dihasilkan secara otomatis.
- Gunakan alias impor `#/*` daripada impor relatif ke direktori induk.
- Pertahankan konfigurasi ESM (`"type": "module"`).

## Database dan autentikasi

- Prisma menggunakan PostgreSQL dan adapter `@prisma/adapter-pg`.
- Jalankan `bun --bun run db:generate` sebelum build atau dev pertama setelah dependensi dipasang.
- Gunakan script `db:*` yang tersedia agar `.env.local` dimuat melalui `dotenv`.
- Jangan mengekspos `DATABASE_URL`, secret Better Auth, atau kredensial lain ke browser.
- Gunakan Better Auth melalui modul server dan client yang sudah ada; jangan membuat sistem autentikasi kedua.
- Gunakan `@faker-js/faker` hanya untuk seed atau data demo, bukan data produksi.

## Kualitas kode

- Ikuti format Prettier: tanpa titik koma, kutip tunggal, dan trailing comma.
- Gunakan impor tipe dengan `import type` atau `import { type X }`.
- Hindari `any`, type assertion yang tidak perlu, dan variabel atau impor yang tidak digunakan.
- Tangani error secara eksplisit; jangan menambahkan `catch` luas atau fallback diam-diam.
- Gunakan komponen, utilitas, dan pola yang sudah ada sebelum membuat abstraksi baru.
- Buat perubahan kecil, terarah, dan tidak terkait dengan permintaan.
- Untuk setiap Penulian kode astikan hanya 150 - 355 baris kode, jika lebih dari itu, pecah menjadi beberapa file dan file baru harus memiliki nama yang jelas dan deskriptif harus sesuai dengan penempatan pada folder nya misal `src/components/MyComponent.tsx`, `src/utils/myUtility.ts`, `src/lib/myLibrary.ts`, dan lainnya.

## Keamanan dan konfigurasi

- Jangan pernah commit `.env.local`, token, secret, connection string, atau data sensitif.
- Variabel yang diawali `VITE_` akan masuk ke bundle browser; gunakan hanya untuk nilai yang aman dipublikasikan.
- Validasi konfigurasi server dan input pengguna sebelum digunakan.
- Jangan mengubah, mereset, atau menghapus database tanpa persetujuan eksplisit.
