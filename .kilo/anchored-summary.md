# Anchored Summary

## Objective
Audit the oRPC routers against the booking/refund procedure set, fix the `tolakBooking` (reject) design gap, implement the missing procedures (`batalkanBooking`, `refund`, `getRefundStatus`), and validate (lint + prettier + tsc).

## Important Details
- **Generated Prisma client is the source of truth** (`src/generated/prisma/`); `prisma/schema.prisma` is canonical but the project compiles against the generated client. Mixed model casing: PascalCase `Booking`, `UnitProperti`, `Property`, `PaymentTransaction`; snake/lowercase `units`, `bookings`, `booking_requests`.
- **Real APIs (the spec's imagined names do NOT exist):** `prisma` from `#/db`; `createPayment`/`refundPayment`/`verifyPayment` + `calculateRefundFee` from `#/lib/payments/mock-gateway.ts`; `calculateDpAmount` from `#/lib/services/platform-config.ts`; `scheduleBookingExpiry` from `#/lib/services/booking-expiry.ts`. (`getKonfigurasiPlatform`, `hitungBiayaRefundPenyewa`, `prosesRefund`, `buatPaymentIntent`, `verifikasiPembayaran`, `jadwalkanExpireBooking` are not real.)
- **`tolakBooking` was already functionally complete** (owner/Admin reject → DP refund via `refundGatewayPayment` → `SELESAI_DITOLAK` + `tanggalDitolak` + `alasanPenolakan` + `statusRefundDP:BERHASIL` + `transaksiRefund_id`). **The one gap: it did NOT free unit availability.** Fixed: reject now runs inside `prisma.$transaction` that also sets `units.status = 'available'` (UnitStatus enum).
- **Unit availability field:** `Booking.unit_id` → `units` model; its availability field is `units.status` (enum `UnitStatus`: `available|occupied|maintenance|reserved|unavailable`). Do NOT confuse with the separate `UnitProperti.status_ketersediaan` (enum `StatusKetersediaan`, default `TERSEDIA`) used elsewhere.
- **`batalkanBooking`** (new): tenant/owner/Admin cancel. Cancels during `REJECTABLE_STATUSES`; if DP was paid & not yet refunded, triggers `refundGatewayPayment` (isOwner:false), sets `status_booking=DIBATALKAN`, records rejection metadata, and frees the unit atomically via `$transaction`.
- **`refund`** (new): owner/Admin re-trigger / force a DP refund when `statusRefundDP !== BERHASIL`. Guards: booking exists, `transaksiDP_id` present & `status === 'BERHASIL'`; calls `refundGatewayPayment`, sets `statusRefundDP=BERHASIL` + `transaksiRefund_id`.
- **`getRefundStatus`** (new): tenant/owner/Admin read. Returns `{ booking_id, status_booking, statusRefundDP, jumlahDP, transaksiRefund? (serialized txn) }`.
- **Design decision:** kept the synchronous `SELESAI_DITOLAK`/`DIBATALKAN` terminal states (the refund is awaited inline in the handler, so the `PROSES_REFUND_DP` intermediate state is never observed) — added only the missing unit-freeing to the reject path.
- **E2E test deferred:** `.env.local` has a placeholder `DATABASE_URL`; the E2E script would mutate the DB. Author did NOT run it (no DB reachability / no mutate approval). Authoring the script was cancelled to avoid adding unvalidated, unexercised code.

## Work State
### Completed
- Audited all 8 routers (`transactions.ts`, `pemesanan.ts`, `bookings.ts`, `properties.ts`, `geocoding.ts`, `todos.ts`, `preferences.ts`, `index.ts`) + schema/transaction.ts, mock-gateway.ts, platform-config.ts, booking-expiry.ts, validators, types, and `prisma/schema.prisma` enums/models.
- Fixed `tolakBooking` to free unit availability atomically.
- Added `batalkanBooking`, `refund`, `getRefundStatus` procedures + Zod inputs (`batalkanBookingSchema`, `refundSchema`, `getRefundStatusSchema`) in `src/orpc/schema/transaction.ts`.
- Wired all three into `src/orpc/router/index.ts`.

### Active
- (none — implementation complete; awaiting verification review)

### Blocked
- E2E execution: `.env.local` has placeholder `DATABASE_URL`; running a DB-mutating end-to-end test requires explicit approval + a reachable DB.

## Verification (final)
- `bun --bun run lint` → LINT_OK (exit 0, 0 errors/warnings)
- `bun --bun run check` → CHECK_OK ("All matched files use Prettier code style!")
- `bunx tsc --noEmit` → TSC_OK (0 errors)

## Relevant Files
- `src/orpc/router/transactions.ts` — `tolakBooking` (fixed), `batalkanBooking`/`refund`/`getRefundStatus` (added)
- `src/orpc/schema/transaction.ts` — new Zod inputs
- `src/orpc/router/index.ts` — new procedure exports
- `src/lib/payments/mock-gateway.ts` — `createPayment`/`refundPayment`/`verifyPayment`/`calculateRefundFee`
- `src/lib/services/platform-config.ts` — `calculateDpAmount`
- `src/lib/services/booking-expiry.ts` — `scheduleBookingExpiry`
- `prisma/schema.prisma` — Booking, units, UnitProperti, `StatusBooking`/`StatusRefundDP`/`UnitStatus` enums
- `src/generated/prisma/` — generated client (truth for field names)
