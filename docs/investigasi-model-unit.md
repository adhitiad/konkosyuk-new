# Laporan Investigasi Model Unit

## Ringkasan Eksekutif

`units` dan `UnitProperti` **bukan duplikat yang berlebihan** — mereka adalah dua model
domain yang paralel, masing-masing mendukung alur sistem pemesanan yang berbeda:

- **`units`** (lowercase) → domain **Inggris / `Booking`** (TanStack Start modern, alur
  DP-pelunasan-refund di `src/orpc/router/transactions.ts`).
- **`UnitProperti`** (PascalCase) → domain **Indonesia / `Pemesanan`** (alur lama
  "ajukan pemesanan" di `src/orpc/router/pemesanan.ts`).

Kedua model ini mengacu ke **model properti yang berbeda**: `units.property_id →
properties` (lowercase) sedangkan `UnitProperti.property_id → Property` (PascalCase).

---

## 1. Peta Penggunaan Model `units`

Model `units` (lihat `prisma/schema.prisma:1191`):

- Field utama: `id`, `property_id`, `name`, `description?`, `price`, `capacity?`,
  `size?`, `status: UnitStatus` (`available | occupied | maintenance | reserved |
unavailable`), `current_booking_id?`, `metadata?`, `room_size?`,
  `electricity_included`, `furniture_included`, `created_at`, `updated_at`.

### File yang menggunakan model `units` (via Prisma client)

- `src/orpc/router/properties.ts` — CRUD unit:
  - `createUnit` (`prisma.units.create`, l.262)
  - `updateUnit` (`prisma.units.update`, l.298)
  - `deleteUnit` (`prisma.units.delete`, l.333)
  - `getPropertyWithRelations` / `listUnits`-like queries (`prisma.units.findMany`, l.369)
- `src/orpc/router/transactions.ts` — alur booking:
  - `createTransaksiBooking` (`prisma.units.findUnique`, l.73) — memverifikasi
    `unit.status === 'available'` sebelum membuat booking.

### Prosedur oRPC yang pakai `units`

- Dari `properties.ts`: `createUnit`, `updateUnit`, `deleteUnit`,
  `checkUnitAvailability`, `checkPropertyAvailability`, `getPropertyWithRelations`.
- Dari `transactions.ts`: `createTransaksiBooking` (jaringan ke unit sebelum booking).

### Relasi

- `units` ↔ `properties`: `units.property_id → properties` (l.1218).
- `units` ↔ `Booking`: `Booking.unit_id → units` lewat relation
  `@relation("Booking_unit_id", l.1435)`; sebaliknya
  `units.transaksi_bookings: Booking[] @relation("Booking_unit_id")` (l.1209).
- `units` ↔ `bookings`: `bookings.unit_id → units` `@relation("unit_bookings")`
  (l.119).
- Relasi tambahan: `group_bookings`, `inspections`, `maintenance_reports`,
  `maintenance_tickets`, `room_facilities`, `seasonal_pricing_rules`,
  `unit_pricing_tiers`, `current_booking`.

---

## 2. Peta Penggunaan Model `UnitProperti`

Model `UnitProperti` (lihat `prisma/schema.prisma:1546`):

- Field utama: `id`, `property_id`, `nama_unit`, `luas_meter`, `harga_bulanan`,
  `kapasitas`, `status_ketersediaan: StatusKetersediaan`
  (`TERSEDIA | TERISI | DIPESAN | MAINTENANCE`), `created_at`, `updated_at`.

### File yang menggunakan model `UnitProperti`

- `src/orpc/router/pemesanan.ts` —
  - `ajukanPemesanan` (`prisma.unitProperti.findUnique`, l.139) — memverifikasi
    `status_ketersediaan === 'TERSEDIA'` sebelum menerima pemesanan; kemudian update
    status unit via `Pemesanan`.
- `src/lib/validators/property.ts` — validator Zod `unitPropertiSchema`
  (l.31) digunakan sebagai input untuk pembuatan properti di domain ini; tipe
  `UnitPropertiInput` diekspor ulang di `src/types/property.ts`.

### Prosedur oRPC yang pakai `UnitProperti`

- Dari `pemesanan.ts`: `listPemesananSaya`, `listPemesananProperti`,
  `ajukanPemesanan`, `setujuiPemesanan`, `tolakPemesanan`, `batalPemesanan`
  (hanya `ajukanPemesanan` yang query langsung ke `unitProperti`; sisanya
  mengoperasikan model `Pemesanan`).

### Relasi

- `UnitProperti` ↔ `Property` (PascalCase): `UnitProperti.property_id → Property`
  (l.1556); sebaliknya `Property.unit_propertis: UnitProperti[]` (l.1534).
- `UnitProperti` ↔ `Fasilitas`: `Fasilitas.unit_id → UnitProperti` (l.1573).
- `UnitProperti` ↔ `Pemesanan`: `Pemesanan.unit_properti_id → UnitProperti`
  (l.1606).

---

## 3. Analisis Redundansi

### Data yang sama (konseptual)

| Konsep                   | `units`                      | `UnitProperti`                            |
| ------------------------ | ---------------------------- | ----------------------------------------- |
| ID                       | `id`                         | `id`                                      |
| Pemilik properti         | `property_id` → `properties` | `property_id` → `Property`                |
| Nama                     | `name`                       | `nama_unit`                               |
| Harga                    | `price`                      | `harga_bulanan`                           |
| Kapasitas                | `capacity`                   | `kapasitas`                               |
| Status ketersediaan unit | `status: UnitStatus`         | `status_ketersediaan: StatusKetersediaan` |
| Audit                    | `created_at`, `updated_at`   | `created_at`, `updated_at`                |

### Data unik di `units`

`description`, `size`, `current_booking_id`, `metadata`, `room_size`,
`electricity_included`, `furniture_included`, serta relasi ke
`bookings` / `group_bookings` / `inspections` / `maintenance_reports` /
`maintenance_tickets` / `room_facilities` / `seasonal_pricing_rules` /
`unit_pricing_tiers` / `current_booking`.

### Data unik di `UnitProperti`

`luas_meter`, `fasilitas: Fasilitas[]`, `pemesanans: Pemesanan[]`.

### Sinkronisasi antar kedua model

**Tidak ada.** Tidak ditemukan kode (di `src/lib`, `src/orpc/router`, atau
`prisma/schema.prisma`) yang menulis/sinkronisasi data antara `units` dan
`UnitProperti`. Mereka diperlakukan sebagai sumber data yang benar-benar
terpisah oleh masing-masing alur.

---

## 4. Rekomendasi

### Model yang dipertahankan

- **`units`** sebagai model unit **otoritatif / aktif**, karena:
  - Menjadi dasar alur `Booking` yang sedang dikembangkan (termasuk alur refund DP
    di `transactions.ts`).
  - Lebih kaya secara skema (harga per tier, fasilitas ruangan, pemeliharaan,
    inspeksi, dll.).
  - Memiliki relasi ke `Booking`, `bookings`, dan transaksi pembayaran.
- **`UnitProperti`** **dipertahankan sementara** karena masih dipakai oleh alur
  `Pemesanan` (Indonesia) dan validator `unitPropertiSchema`.

### Alasan tidak menghapus langsung

`units` dan `UnitProperti` tidak dapat dihapus secara independen karena masing-masing
terikat erat pada satu seluruh domain:

- `units` terhubung ke `properties` + `Booking` + `bookings` + banyak tabel
  pemeliharaan/inspeksi.
- `UnitProperti` terhubung ke `Property` (PascalCase) + `Pemesanan` + `Fasilitas`.

Menghapus satu tanpa menghapus mitra domainnya akan memecahkan constraint relasional
dan migrasi akan gagal. Kedua domain ini berpotensi sama-sama "legacy-vs-modern"
atau sama-sama "aktif," tergantung keputusan produk.

### Strategi migrasi (hanya bila keputusan: `Pemesahan` legacy didepresiasi)

1. **Audit penggunaan**: konfirmasi apakah alur `Pemesanan`/`Property`/`Fasilitas`
   masih dipakai di frontend (`src/routes`) dan/atau diproduksi.
2. **Migrasi data**: jika `UnitProperti` berisi data produksi yang harus
   bertahan, migrasikan ke `units` (memetakan `nama_unit → name`,
   `luas_meter → size`, `harga_bulanan → price`, `kapasitas → capacity`,
   `status_ketersediaan → status` dengan peta nilai: `TERSEDIA → available`,
   `TERISI → occupied`, `DIPESAN → reserved`, `MAINTENANCE → maintenance`).
3. **Pindah relasi**: arahkan `Pemesanan.unit_properti_id` ke `units`
   (atau gabungkan ke `Booking`), lalu hapus relasi ke `UnitProperti`.
4. **Hapus skema**: baru hapus model `UnitProperti` (+ `Property`, `Fasilitas`,
   `Pemesanan` jika seluruhnya didepresiasi) setelah tidak ada lagi kode yang
   mereferensikannya, lalu jalankan migrasi untuk menghapus kolom/tabel.
5. **Jangan lanjut ke UI** sampai keputusan ini final — alur refund DP (BAGIAN 1)
   sudah beroperasi di atas model `units` dan tidak bergantung pada
   `UnitProperti`.

### Catatan tentang statusRefundDP

`StatusRefundDP` (enum `BELUM_REFUND | MENUNGGU_PROSES | SEDANG_DIPROSES | BERHASIL |
GAGAL`) hanya ada pada model `Booking` (domain Inggris). Model `Pemesanan`
(Indonesia) tidak memiliki kolom setara. Jadi alur refund yang
sedang diperbaiki memang berspesifikasi pada domain `units`/`Booking`.

---

## Lampiran: Cross-check model properti

- `properties` (lowercase, l.755) — domain Inggris; memiliki relasi ke `units`.
- `Property` (PascalCase, l.1522) — domain Indonesia; memiliki relasi ke
  `UnitProperti`, `Fasilitas`.
  Kedua model properti **juga** tidak disinkronkan; mereka adalah dua entitas yang
  berbeda. Ini memperkuat temuan: terdapat dua stack domain paralel selaras.
