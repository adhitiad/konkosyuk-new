# Copilot Instructions — konkosyuk-new

Link ke panduan utama: [AGENTS.md](../AGENTS.md) (konvensi build, auth, oRPC, Prisma, i18n, deployment).

## Fokus cepat

- Gunakan `bun --bun` (bukan `pnpm`).
- `db:generate` wajib sebelum `dev`/`build`.
- `.env.local` belum lengkap (`BETTER_AUTH_SECRET`, `DATABASE_URL`) — perbaiki sebelum auth/DB.
- `routeTree.gen.ts` auto-generated; jangan edit manual.
- Dual domain model: `units` (EN/Booking) vs `UnitProperti` (ID/Pemesanan) — lihat `docs/investigasi-model-unit.md`.
- i18n: Paraglide (`messages/` 8 bahasa); `src/paraglide/` gitignored.
- Tidak ada framework tes; verifikasi dengan `lint` + `check`.
