# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# SimplyCPF - Development Guide

A Next.js 16.2 application that calculates CPF (Central Provident Fund) contributions and helps users plan CPF outcomes following Singapore's 2023 Budget changes to income ceilings.

## Build and Test Commands
- `pnpm dev` - Start development server via Portless at `https://simplycpf.localhost`
- `PORTLESS=0 pnpm dev` - Start development server without Portless (direct `localhost:3000`)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linting across the repo
- `pnpm format` - Format code with Biome
- `pnpm typecheck` - Runs `next typegen` first then `tsc --noEmit`
- `pnpm test` - Run tests once with coverage (Vitest)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm generate:docs` - Generate API documentation

### Targeted runs
- Single test file: `pnpm exec vitest run src/lib/__tests__/calculate-cpf-contribution.test.ts`
- Filter by test name: `pnpm exec vitest run -t "ceiling"`
- Lint/format a single file: `pnpm exec biome check --write src/components/foo.tsx`

### First-time setup
`.npmrc` sets `ignore-scripts=true` (block install-time scripts), `save-exact=true` (no `^`/`~` on `pnpm add`), and `minimum-release-age=4320` (3-day quarantine for newly published packages). Because of `ignore-scripts`, **you must run `pnpm run prepare` after `pnpm install`** to wire up Husky hooks — otherwise commits won't be linted.

### Commit conventions
Commits are validated by `commitlint` with `@commitlint/config-conventional` via the `commit-msg` Husky hook. Use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `docs:`, `test:`). `lint-staged` runs Biome on staged files via the `pre-commit` hook. Versioning is fully automated by `semantic-release` based on commit history, so the prefix you pick directly drives the next published version.

## Code Style
- **Language**: Use English (Singapore) spelling across documentation and copy
- **Formatting**: Biome for formatting with 2-space indentation and double quotes
- **Imports**: Organised via Biome, absolute imports with `@/` prefix
- **Tailwind Classes**: Automatically sorted using Biome's `useSortedClasses` rule with `cn`, `clsx`, `cva`, and `tw` functions
- **TypeScript**: Full type coverage, avoid `any` and `as` casts
- **State Management**: Zustand store for global state
- **Component Structure**: Functional components with explicit return types
- **File Naming**: kebab-case for all files (e.g., `user-input.tsx`, `calculate-cpf-contribution.ts`)
- **Variable/Function Naming**: camelCase for functions/variables, PascalCase for React component names
- **Error Handling**: Try/catch with helpful error messages, use optional chaining
- **Testing**: Vitest with descriptive test names, use `it.each` for data variations

## Documentation Maintenance
Keep documentation in sync with code changes:
- **Update CLAUDE.md** when making:
  - Architectural changes (new state management patterns, data flow modifications)
  - New build/test commands or workflow changes
  - Changes to code style guidelines or conventions
  - Updates to key data structures or calculation logic
  - Additions of significant new features or components
- **Update README.md** when making:
  - User-facing feature additions or removals
  - Changes to setup/installation instructions
  - Updates to usage examples or API changes
  - Modifications to project description or scope
- **Both files** should be updated together for changes that affect both development workflow and user experience

## Architecture

### State Management
Calculator-wide shared state is managed through a Zustand store in `src/stores/`:
- `cpf-store.ts` - Core store with settings and actions
- `cpf-store-context.tsx` - React context provider for the store
- `selectors.ts` - Computed selectors for derived state (age, age group, contribution results, etc.)
- `use-cpf-store.ts` - Hook for accessing store state and actions

Self-contained pages that do not need cross-route shared state, such as the CPF projection page, can use page-local client state instead of introducing new global store slices.
Projection and what-if pages serialise form state into the URL with `nuqs` so results can be shared and reopened directly from search params.
Lead magnet flows such as the retirement readiness score use page-local client state and should not introduce new global atoms.

### CPF Calculation Logic
The core calculation happens in `src/lib/calculate-cpf-contribution.ts`:
- Takes income, year, and optional age group/ceiling preferences
- Uses age groups from `src/data/index.ts` which define contribution and distribution rates by age brackets
- Returns `ComputedResult` with employee/employer contributions and OA/SA/MA distributions
- Income is capped at the ceiling defined in `src/constants/index.ts` based on the year

Career-long projection logic lives in `src/lib/calculate-cpf-projection.ts`:
- Projects yearly balances across OA, SA, MA, and RA from the current age to a chosen end age
- Applies CPF floor interest rates, extra interest tiers, BHS overflow handling, and the age 55 SA to RA conversion
- Supports optional housing withdrawals, annual voluntary top-ups, and OA to SA transfers
- Returns `ProjectionResult` with yearly balances, milestone snapshots, and simplified CPF LIFE estimates

### Key Data Structures
- **Age Groups** (`src/data/index.ts`): 8 age brackets with varying contribution rates (employee/employer) and distribution rates (OA/SA/MA percentages)
- **Income Ceilings** (`src/constants/index.ts`): Ceiling values by year following the gradual increase from $6000 (pre-Sept 2023) to $8000 (Sept 2026)
- **Projection Constants** (`src/constants/cpf-retirement-sums.ts`, `src/constants/cpf-bhs.ts`, `src/constants/cpf-interest-tiers.ts`, `src/data/permanent-resident-rates.ts`): Retirement sums, BHS values, extra interest tiers, and PR graduated rates
- **Types** (`src/types/index.ts`): `AgeGroup`, `ContributionRate`, `DistributionRate`, `ComputedResult`, `ContributionResult`, `ProjectionParams`, `ProjectionResult`, `YearlyBalance`

### Testing Strategy
- Tests use Vitest with jsdom environment, globals enabled, setup at `vitest.setup.ts`
- Test files live alongside source in `__tests__` directories matching `src/**/*.{test,spec}.{ts,tsx}`
- Coverage source is `src/**/*.{js,jsx,ts,tsx}` with these exclusions: `*.d.ts`, `src/components/ui/**`, `src/proxy.ts`, `src/types/**`, `src/providers/**`, every `src/app/(main)/**/{page,loading,error}.tsx`, `src/app/(docs)/**`, `src/app/{robots,sitemap}.ts`, `src/app/{error,not-found,providers}.tsx`, `src/app/**/layout.tsx`, and the OG/icon image generators (`src/app/{apple-icon,icon,opengraph-image,twitter-image}.tsx`)
- Page components are intentionally excluded — treat them as presentational shells; cover behaviour in their child components and in the underlying `src/lib/` calculation modules

### UI Components
- UI components in `src/components/ui/` are from shadcn/ui (excluded from Biome linting)
- Custom components use Base UI primitives with Tailwind CSS
- Charts use Recharts library for data visualisation

### Route Groups
The application uses Next.js route groups for organisation:
- `(main)` - Main application routes (home, calculator, projection, what-if, cpf-life, cpf-cheat-sheet, retirement-readiness, about, faq, privacy, interest-rates, investments)
- `(docs)` - Developer portal routes powered by Fumadocs

### Developer Portal
Documentation site powered by Fumadocs at `/developer`:
- **Configuration**: `source.config.ts` defines MDX processing with Twoslash support
- **Content**: MDX files in `content/docs/` organised by category (api, examples, changelog)
- **Features**: Interactive API documentation with TypeScript code examples, syntax highlighting with Twoslash

### Next.js Configuration
Key `next.config.ts` settings:
- **Turbopack**: Default bundler (stable since Next.js 16), filesystem cache enabled for builds
- **React Compiler**: Enabled via `reactCompiler: true` with `babel-plugin-react-compiler`
- **Typed Routes**: `typedRoutes: true` generates `RouteContext` type for route params
- **Typed Env**: `experimental.typedEnv` provides type-safe `process.env` access
- **MCP Server**: `experimental.mcpServer` enables the Next.js Model Context Protocol server
- **Strict Route Types**: `experimental.strictRouteTypes` type-checks App Router page props
- **Logging**: `logging.browserToTerminal` forwards browser errors to terminal; `logging.serverFunctions` logs server action execution in dev

### API Routes
RESTful API endpoints under `/api/cpf/` provide programmatic access to CPF calculations:
- **Calculation**: `/calculate`, `/calculate/batch`, `/projection`
- **Age Groups**: `/age-groups`, `/age-group/find`, `/age/from-birthdate`
- **Income Ceiling**: `/ceiling`, `/ceiling/timeline`
- **Interest Rates**: `/interest-rates`, `/interest-rates/smra`, `/interest-rates/trend`
- **Investment**: `/investment-comparison`

Other API routes:
- `/api/search` - Full-text search across documentation
- `/api/lead-magnets/cpf-cheat-sheet` - Generates the public cheat sheet PDF

### LLM Integration Routes
Routes for AI/LLM consumption following the llms.txt specification:
- `/llms.txt` - Concise site summary for LLMs
- `/docs/llms-full.txt` - Complete documentation in plain text
- `/docs/llms.mdx/[...slug]` - Individual documentation pages in MDX format

### Custom Hooks
Located in `src/hooks/`:
- `use-calculated-cpf.ts` - Hook for accessing calculated CPF contribution results
- `use-form-state.ts` - Form state management for user input
- `use-animated-number.tsx` - Animated number transitions for displaying results

### Utilities
- `src/lib/cache-headers.ts` - Standardised cache header utilities for API responses
- `src/lib/calculate-retirement-readiness.ts` - Scoring logic and next-step recommendations for the readiness assessment
- `src/lib/error-handler.ts` - Centralised error handling with consistent API error responses
- `src/lib/format.ts` - Number and currency formatting utilities
- `src/lib/get-cpf-cheat-sheet-data.ts` - Shared CPF reference data used by the cheat sheet page and PDF export
- `src/config/index.ts` - Application configuration constants

### Key Components
- **CPF Income Ceiling Timeline** (`cpf-income-ceiling-timeline.tsx`): Interactive timeline showing the progression of CPF income ceiling changes from pre-2023 to final 2026 ceiling
- **PDF Export** (`cpf-results-pdf.tsx`, `download-pdf.tsx`): Generate and download CPF calculation results as PDF documents using `@react-pdf/renderer`
- **Lead Magnet Components** (`src/components/lead-magnets/`): On-page readiness score assessment form and result view for the `/retirement-readiness` page
- **Home Page Components**: `hero-section.tsx`, `insight-banner.tsx`, `quick-actions.tsx` for the landing page
- **Projection Components** (`src/components/projection/`): Projection form, stacked balance chart, milestone cards, CPF LIFE estimate card, and yearly projection table for the `/projection` page
- **What-If Components** (`src/components/what-if/`): Scenario selector, scenario-specific forms, comparison chart, scenario summary banner, and result cards for the `/what-if` page
- **CPF LIFE Components** (`src/components/cpf-life/`): CPF LIFE payout estimator inputs, plan comparison cards, and retirement sum references for the `/cpf-life` page
- **Interest Rates Components** (`src/components/interest-rates/`): Rate overview cards, extra interest tier cards, distribution rates table, the SMRA pegged-vs-floor explainer (`understanding-rates-info`), 12-month trend chart, and the quarterly rates table for the `/interest-rates` page. The page also reuses three SEO blocks from `src/components/seo/` (`cpf-contribution-comparison-block`, `cpf-distribution-comparison-block`, `cpf-interest-tiers-block`); the interest tiers block is also rendered on `/projection`
- **FAQ Page** (`src/components/faq/on-this-page-nav.tsx`): IntersectionObserver-driven scroll spy for the FAQ index page

## Design System

See `.claude/skills/design-language-system/SKILL.md` for complete design system documentation.

### Key Principles

- **Aesthetic:** Refined Financial Simplicity (slate, teal)
- **Colours:** OKLCH colour space via CSS variables in `globals.css`
- **Typography:** Geist font family

### Spacing Rules (IMPORTANT)

Philosophy: **"Push Down, Not Pull Up"** — Elements push content below them rather than pulling from above.

- **NO `mt-*` or `pt-*`** — Use `mb-*`, `pb-*`, and `gap-*` instead
- **Use `gap-*`** for flex/grid containers
- **Exception:** `pt-*` allowed only for sticky elements offsetting fixed headers

| Utility | Use When |
|---------|----------|
| `gap-*` | Flex/grid containers (preferred) |
| `mb-*` | Spacing between siblings in non-flex/grid contexts |
| `pb-*` | Internal padding at bottom of containers |

**8px Grid System:** All spacing must be multiples of 8px.

| Token | Pixels | Use Case |
|-------|--------|----------|
| `2` | 8px | Tight (icons, related items) |
| `4` | 16px | Default (form fields, lists) |
| `6` | 24px | Sections (card content) |
| `8` | 32px | Large (between cards) |
| `12` | 48px | Page sections |

**Avoid:** `1`, `3`, `5`, `7` — not 8px multiples

### Tailwind CSS v4 Conventions

- Use `size-*` instead of `w-* h-*` for square elements
- Use `gap-*` for flex/grid containers
- CSS-first configuration in `globals.css` with `@theme inline`

### Section card pattern (canonical)
Page-level cards/sections use a single class signature so the whole site stays visually consistent:

```tsx
<section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
  <div className="flex flex-col gap-1">
    <h2 className="font-semibold text-[16px] text-foreground">Title</h2>
    <p className="text-[12px] text-muted-foreground">Subhead.</p>
  </div>
  {/* content */}
</section>
```

Prefer this over `<Card>`/`<CardHeader>`/`<CardContent>` from `src/components/ui/card.tsx` for new page sections — the shadcn `Card` is reserved for places where the existing app already uses it.

### Colour usage
**Always reach for design tokens**, never raw Tailwind colour scales like `bg-amber-50`, `text-blue-900`, `border-zinc-200`, or hex literals. Tokens to use:

- Surface/text: `bg-card`, `bg-muted`, `bg-muted/40`, `text-foreground`, `text-muted-foreground`, `border-border`
- Brand accent (teal): `bg-accent`, `bg-accent/5`, `text-accent`, `border-accent/30`, `ring-accent/20`, `text-accent-foreground`
- Charts/recharts: `var(--color-chart-1)` … `var(--color-chart-5)`, `var(--color-destructive)` for warning lines
- Recharts grid/axis: `stroke="var(--color-border)"` and `tick={{ fill: "var(--color-muted-foreground)" }}`

Tinted info callouts use `bg-muted/50 ring-1 ring-border/60` (neutral) or `bg-accent/5 ring-1 ring-accent/20` (emphasis) — not raw amber/blue backgrounds.

### Off-Limits

- **DO NOT modify** `src/components/ui/*` - shadcn/ui components are styled via CSS variables
- **Dark mode** - Currently out of scope, do not modify `.dark` selector styles
