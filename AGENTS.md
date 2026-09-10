# AGENTS.md — Konkosyuk

TanStack Start (React 19 / Vite 8 / Nitro) + Prisma + Better Auth + oRPC + Paraglide i18n.
Deploy target: Vercel (`vercel.json` → `framework: "tanstack-start"`).

## Toolchain

- **Runtime**: Bun 1.4. All scripts: `bun --bun run <script>`. The `--bun` flag is required.
- **Package manager**: Bun. The `pnpm` block in `package.json` is a leftover — ignore it.
- **No test framework configured.** Vitest is installed but only one file uses it (`src/orpc/router/transactions.test.ts`). Verify with `lint` + `check` + `tsc --noEmit` instead.

## Commands

```bash
bun install
bun --bun run dev          # :3000, auto-regenerates routeTree.gen.ts
bun --bun run build
bun --bun run lint         # eslint
bun --bun run check        # prettier --check .
bun --bun run format       # prettier --write . && eslint --fix
bunx --bun tsc --noEmit    # typecheck (no script alias)
bun --bun run generate-routes   # tsr generate → src/routeTree.gen.ts
```

### Prisma — required order

```bash
bun --bun run db:generate   # MUST run before first build/dev (client not checked in)
bun --bun run db:push       # sync schema to DB
bun --bun run db:migrate
bun --bun run db:seed
bun --bun run db:check      # diagnostics
```

- Client generates to `src/generated/prisma` (custom output). Import from `#/generated/prisma/client.js` — never from `@prisma/client`.
- All `db:*` scripts prefix with `dotenv -e .env.local --`. Do not call `prisma` directly or `DATABASE_URL` won't load.
- `prisma.config.ts` prefers `DIRECT_URL` over `DATABASE_URL` for CLI ops (migrations need session-mode, not PgBouncer pooler).

## Environment

- `.env.local` is present (gitignored) and is the source of truth for dev. `src/.env.local` has placeholders only.
- `src/env.ts` (t3-env) validates only `SERVER_URL`, `MIDTRANS_*`, `VITE_APP_TITLE`, `VITE_MIDTRANS_CLIENT_KEY`. `DATABASE_URL`, `BETTER_AUTH_*`, and every other secret are read directly from `process.env` — add new ones to `src/env.ts` with a Zod schema rather than ad-hoc `process.env` reads.
- `VITE_`-prefixed vars are inlined into the browser bundle. Keep secrets unprefixed.

## Architecture

- **Alias**: `#/*` → `./src/*` (both `package.json` imports and `tsconfig.json` paths). Prefer `#/` over relative imports.
- **Auth**: `src/lib/auth.ts` — Better Auth with **Prisma adapter** (`usePlural: true`) and `tanstackStartCookies()`. All Better Auth field mappings are manually mapped to the snake_case Prisma columns (`emailVerified → email_verified`, etc.). Adding a new user/session/account/verification field requires both a schema change and a `fields`/`additionalFields` entry here, or queries fail with "Unknown argument". Route: `src/routes/api/auth/$`.
- **oRPC**: single router `src/orpc/router/index.ts` served via two transports — OpenAPI at `/api` (`src/routes/api.$.ts`) and RPC at `/api/rpc` (`src/routes/api.rpc.$.ts`). Client in `src/orpc/client.ts`. Server route files that touch oRPC must `import '#/polyfill'` first.
- **Prisma**: `src/db.ts` singleton supports both Accelerate (`prisma+postgres://`) and direct (`@prisma/adapter-pg`). Schema has a **legacy `Property` model** (singular, `nama_properti`, `unit_propertis`) alongside the modern `properties`/`units`/`Booking` models. New code must use the modern stack only.
- **i18n**: Paraglide, base locale `id`, locales `id/en/zh/th/vi/ko/ru/fil`. Messages in `messages/{locale}.json`. `src/paraglide/` is auto-generated — never edit.
- **Routes**: file-based under `src/routes`. Group routes use parens: `(protected)/`, `(public)/`. Catch-all routes end in `$`. `src/routeTree.gen.ts` is generated — do not edit; run `generate-routes` after adding/removing a route.

## Style / TypeScript

- `tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. Type-only imports must use `import type` / `import { type X }`. Unused imports/vars are lint + typecheck errors.
- Prettier: `semi: false`, `singleQuote: true`, `trailingComma: "all"`.
- ESLint: `@tanstack/eslint-config`. Disabled rules: `import/no-cycle`, `import/order`, `sort-imports`, `@typescript-eslint/array-type`, `@typescript-eslint/require-await`. Ignores: `src/paraglide/**`, `src/generated/prisma/**`, `.output/**`.

## Gotchas

- `bunx @tanstack/intent` resolves the wrong bin. Invoke directly: `node node_modules/@tanstack/intent/dist/cli.mjs list`.
- README says `pnpm dlx shadcn` — use `bunx --bun shadcn@latest add <component>` instead.
- README says `src/env.mjs` — it is actually `src/env.ts`.
- README claims Better Auth is "stateless, no database adapter" — it is **not**; `src/lib/auth.ts` uses `prismaAdapter`.
- README says schema has a single `Todo` model — false; it has ~60 models. The `Todo`/`todos` oRPC router is leftover demo code.
- README says base locale is `en` — it is `id`.
- `.env.local` contains live credentials (database, Midtrans, Ably, QStash, Didit, Cloudinary, OpenRouter). Never commit or paste into summaries.
- **Role strings are not consistent across routers.** oRPC routers check `context.user.role` against uppercase enums (`'ADMIN'`, `'STAFF'`, `'PEMILIK'`, `'PENYEWA'`) — see `src/orpc/router/admin.ts:34`, `src/orpc/router/transactions.ts:61`. But `src/orpc/router/properties.ts:39` and `src/server/property.ts:39` check against lowercase `'owner'` / `'admin'`. Better Auth's `additionalFields.role` default is `'PENYEWA'` (see `src/lib/auth.ts:28`). Match the casing of the router you're editing.
- **Payment gateway is a mock.** `src/lib/payments/mock-gateway.ts` writes `paymentTransaction` rows directly to Prisma with `provider: 'mock_gateway'`. Real Midtrans integration lives in `src/lib/midtrans.ts` (Snap + CoreApi) and is invoked from `src/orpc/router/transaction.ts` (`createMidtransPayment`). Webhooks arrive at `src/routes/api/webhooks/qstash/$` (QStash-signed) and `src/routes/api/webhooks/midtrans.ts`. Do not assume a real gateway is in use when debugging payments.
- **Two parallel booking systems exist.** The modern stack is `booking` (Prisma model `booking`, `src/orpc/router/transactions.ts`). A legacy parallel lives in `booking_requests` + `pemesanan` (`src/orpc/router/bookings.ts`, `src/orpc/router/pemesanan.ts`). The router index aliases the legacy `createBooking` to `createLegacyBooking` (`src/orpc/router/index.ts:130`). New features go on the modern `booking` stack only.
- **Server functions coexist with oRPC.** `src/server/property.ts`, `src/server/upload.ts`, and `src/server/auth-gateway/` use `createServerFn` from `@tanstack/react-start`. These are separate from the oRPC router — they do not appear in `src/orpc/router/index.ts` and are not exposed at `/api` or `/api/rpc`. Don't look for them in the oRPC client.
