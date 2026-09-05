# Project Rules

## Package manager and runtime

- Use **Bun 1.4** for this project.
- Use `bun install` to install dependencies and `bun add <package>` to add dependencies.
- Run package scripts with `bun --bun run <script>`.
- Do not use `npm`, `yarn`, or `pnpm` commands.
- Use `bunx --bun <package>` for one-off CLI tools.
- Do not edit the lockfile manually.

## Standard commands

```bash
bun install
bun --bun run dev
bun --bun run build
bun --bun run lint
bun --bun run check
bun --bun run format
```

- Run `bun --bun run lint` and `bun --bun run check` after code changes.
- There is currently no configured test framework; do not add one unless explicitly requested.
- Run the smallest relevant validation command, then escalate to a full build when needed.

## Prisma and environment

- Run `bun --bun run db:generate` before the first build or dev start after installing dependencies.
- Use the existing `db:*` scripts; they load `.env.local` through `dotenv`.
- Never call Prisma directly when a `db:*` script exists.
- Never commit `.env.local`, credentials, database URLs, or other secrets.
- Keep secrets unprefixed by `VITE_`; only browser-safe values may use the `VITE_` prefix.

## Source conventions

- Use TypeScript with strict type safety. Avoid `any` and unnecessary type assertions.
- Use the `#/*` import alias instead of relative parent imports.
- Follow the repository formatting: no semicolons, single quotes, and trailing commas.
- Use type-only imports with `import type` or `import { type X }`.
- Remove unused imports, variables, and parameters.
- Reuse existing helpers and patterns before adding new abstractions.
- Add comments only when they clarify non-obvious logic.
- Make precise changes and do not modify unrelated files.

## TanStack and generated files

- Do not manually edit `src/routeTree.gen.ts`; regenerate it with `bun --bun run generate-routes`.
- Do not manually edit generated Paraglide output under `src/paraglide/`.
- Preserve existing TanStack Router, Start, Query, and oRPC patterns.
- Import `#/polyfill` first in route files that use oRPC.

## API, auth, and database safety

- Preserve the separation between OpenAPI (`/api`) and RPC (`/api/rpc`) transports.
- Keep authentication changes scoped to the existing Better Auth server and client modules.
- Surface errors explicitly; do not add broad catches, silent fallbacks, or success-shaped responses for failures.
- Validate user input at API boundaries using the existing Zod/oRPC conventions.
- Do not reset, drop, or mutate a development database without explicit user approval.

## Code review

- Use the GitHub PR review process for all changes.
- Do not merge your own PRs; request a review from another team member.

## Change workflow

1. Inspect existing code and conventions before editing.
2. Make the smallest complete implementation.
3. Run formatting checks, lint, type checking/build, or targeted tests as applicable.
4. Review the diff and remove temporary files or debug output.
