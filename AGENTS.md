<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `bunx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `bunx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

# Agent Guide

TanStack Start template (React 19 / Vite 8 / TypeScript 6) with Prisma, Better Auth, oRPC, MCP, and Paraglide i18n.

## TanStack Intent CLI (skill discovery)

Both `@tanstack/intent` and `@tanstack/devtools` declare a bin named `intent`. bunx resolves to the wrong one (`@tanstack/devtools/bin/intent.js`), which fails:

```
ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './intent-library' is not exported
```

Bypass bunx and invoke the intent package's CLI directly:

```bash
node node_modules/@tanstack/intent/dist/cli.mjs list
node node_modules/@tanstack/intent/dist/cli.mjs load @tanstack/query#core
```

## Toolchain

- **Runtime**: `bun 1.4` is installed. Run all scripts with `bun --bun run <script>` — the `--bun` flag is required.
- **Package manager**: The `pnpm` block in `package.json` is a leftover from the CTA template. Use `bun install` / `bun add` / `bunx`.
- **No tests** are configured. No test framework is installed. Verify with lint + typecheck instead.

## Commands

```bash
bun install            # install deps
bun --bun run dev      # dev server on :3000 (regenerates routeTree.gen.ts automatically)
bun --bun run build    # production build
bun --bun run lint     # eslint
bun --bun run check    # prettier --check .
bun --bun run format   # prettier --write . && eslint --fix
```

### Prisma

```bash
bun --bun run db:generate   # prisma generate  — MUST run before build/dev (client not checked in)
bun --bun run db:push       # prisma db push    — syncs schema to DB
bun --bun run db:migrate    # prisma migrate dev
bun --bun run db:studio
bun --bun run db:seed
```

- The Prisma Client is generated to `src/generated/prisma` (custom output path), not the default location. `src/db.ts` imports from there, so **`db:generate` must run before the first build or dev start**.
- All `db:*` scripts prefix the command with `dotenv -e .env.local --` to load `DATABASE_URL`. Do not call `prisma` directly without this prefix in dev scripts, or the URL won't be loaded.
- The schema is at `prisma/schema.prisma`. Seed live at `prisma/seed.ts` (invoked via `tsx` from `prisma.config.ts`).

### Routes

- `bun --bun run generate-routes` runs `tsr generate` to regenerate `src/routeTree.gen.ts`. Vite also auto-regenerates it on dev, but commit the generated file after adding/removing a route.
- `src/routeTree.gen.ts` is auto-generated. `.vscode/settings.json` marks it read-only and excludes it from search/watch. **Do not edit it.**
- Catch-all routes use a trailing `$` in the filename: `api.$.ts` → `/api/*`, `api/rpc/$` → `/api/rpc/*`, `api/auth/$` → `/api/auth/*`.

## Environment

- Env is loaded from `.env.local` (gitignored, already present in the workspace).
- `src/env.ts` validates env via `@t3-oss/env-core`, but **only `VITE_APP_TITLE` (client) and `SERVER_URL` (server)** — it does NOT validate `DATABASE_URL` or `BETTER_AUTH_*`. Those are read directly from `process.env` in their respective modules.
- Required for dev: `DATABASE_URL`, `BETTER_AUTH_SECRET` (generate with `bunx --bun @better-auth/cli secret`), `BETTER_AUTH_URL=http://localhost:3000`.
- `src/.env.local` currently has placeholder values (empty `BETTER_AUTH_SECRET`, placeholder DB URL). Fix before running Prisma or auth features.

## Architecture

### Alias

All imports use the `#/*` alias (mapped to `./src/*` in both `package.json` `imports` and `tsconfig.json` `paths`). Prefer `#/` over relative `../` imports.

### Auth (Better Auth)

- Server instance: `src/lib/auth.ts` — email/password + `tanstackStartCookies()` plugin only. No database adapter is configured (stateless mode).
- Client: `src/lib/auth-client.ts` (thin `createAuthClient()` wrapper).
- Route: `src/routes/api/auth/$` proxies all methods to `auth.handler(request)`.
- Demo: `src/routes/demo/better-auth.tsx`.

### API layers (oRPC)

oRPC serves the same router (`src/orpc/router/index.ts`) through two transports:

- **OpenAPI REST**: `src/routes/api.$.ts` — `OpenAPIHandler`, prefix `/api`. Serves OpenAPI + Swagger playground.
- **RPC**: `src/routes/api.rpc.$.ts` — `RPCHandler`, prefix `/api/rpc`.
- Client: `src/orpc/client.ts` — isomorphic. Server-side uses `createRouterClient` (direct); client-side uses `RPCLink` to `/api/rpc`. Consumed in React via `createTanstackQueryUtils(client)` → `orpc`.
- `src/polyfill.ts` polyfills `File` for Stackblitz/Node 18. Route files that touch oRPC import `'#/polyfill'` first.

### MCP

- `src/routes/mcp.ts` — MCP server endpoint (POST only), uses `@modelcontextprotocol/sdk`. Tools registered here; request handling delegated to `src/utils/mcp-handler.ts` (in-memory transport link).
- `src/mcp-todos.ts` — file-backed todo store (`mcp-todos.json` in project root, gitignored). Used by the `/mcp` tool demo, **separate** from the oRPC todos.

### Prisma

- Client singleton: `src/db.ts` — uses `PrismaPg` adapter from `@prisma/adapter-pg`, attaches to `globalThis.__prisma` in dev.
- Schema: `prisma/schema.prisma` — single `Todo` model.

### i18n (Paraglide)

- Config: `project.inlang/settings.json` — base locale `en`, locales `en` + `de`.
- Messages: `messages/{en,de}.json`.
- Generated runtime: `src/paraglide/` (gitignored output). Regenerated automatically by the Vite plugin on dev/build. Do not edit.

### shadcn

- Components use the `new-york` style, `lucide` icon library, base color `zinc`.
- Aliases in `components.json`: `#/components`, `#/lib`, `#/components/ui`, `#/hooks`.
- Install with `bunx --bun shadcn@latest add <component>` (README says `pnpm dlx` — that won't work; use `bunx`).

## Style / TypeScript

- `tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`. Type-only imports must use `import type` / `import { type X }`. Unused imports/vars are lint + typecheck errors.
- Prettier: `semi: false`, `singleQuote: true`, `trailingComma: "all"`.
- ESLint uses `@tanstack/eslint-config`; `import/order`, `sort-imports`, and `@typescript-eslint/array-type` are disabled in `eslint.config.js`.

## Deployment

- Deploy target: Vercel (`vercel.json` sets `framework: "tanstack-start"`).
- `VITE_`-prefixed vars are inlined into the browser bundle. Keep secrets (e.g. `BETTER_AUTH_SECRET`, `DATABASE_URL`) unprefixed.
- The README references `.env.example` for Vercel env vars, but **no `.env.example` exists** — rely on `.env.local` + README prose for the variable list.
