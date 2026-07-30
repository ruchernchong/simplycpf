# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# SimplyCPF - Development Guide

A Next.js 16.2 application that calculates CPF (Central Provident Fund) contributions and helps users plan CPF outcomes following Singapore's 2023 Budget changes to income ceilings.

## Build and Test Commands
- `pnpm dev` - Start development server via Portless at `https://simplycpf.localhost`
- `PORTLESS=0 pnpm dev` - Start development server without Portless (direct `localhost:3000`)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linting
- `pnpm format` - Format code with Biome
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests once with coverage
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm generate:docs` - Generate API documentation

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
- Tests use Vitest with jsdom environment
- Coverage excludes: `node_modules`, `.next`, `.d.ts` files, config files, `src/middleware.ts`, and `src/components/ui/**` (UI library components)
- Test files located alongside source in `__tests__` directories
- React component tests exist but are excluded from main test runs

### UI Components
- Public product screens use HeroUI v3 OSS (`@heroui/react`) and HeroUI Pro (`@heroui-pro/react`) with no provider; theme tokens live in `src/app/globals.css` using the HeroUI default variable names with SimplyCPF brand values (warm paper/ink/forest, OKLCH)
- Appearance comes from HeroUI props and theme tokens; `className` on component roots is for composition only (layout, sizing, gaps) — never hardcoded colours
- Shared primitives in `src/components/shared/`: `SplitBar` (segmented proportional bars — fixed chart encoding: chart-1 OA, chart-2 SA/RA, chart-3 MA/employer, chart-4 take-home, chart-5 above-ceiling/clay), `PageHeader`/`Eyebrow`, `StatBand`, `Wordmark`
- Product-facing icons use Lucide; `cn` is imported from `@heroui/react`
- Use named function declarations for components and exported functions, not arrow-function constants
- React Aria formatting is pinned to `en-SG` via `I18nProvider` in `src/app/providers.tsx`
- `src/components/ui/` (shadcn/ui) is DEPRECATED: kept only for not-yet-migrated pages, bridged by the LEGACY-ALIAS token block in `globals.css`; no new imports from it
- Charts use HeroUI Pro chart wrappers (Recharts underneath) where a real chart exists

### Route Groups
The application uses Next.js route groups for organisation:
- `(main)` - Main application routes (home, calculator, at-55, accrued-interest, what-if, cpf-life, cpf-cheat-sheet, cpf-check, projection, retirement-readiness, about, privacy, interest-rates, investments)
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
- `/api/resources/cpf-cheat-sheet` - Generates the public cheat sheet PDF

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
- **Home Page Components** (`src/components/home/`): `home-hero.tsx` (global salary/DOB/citizenship inputs + short-answer card), `home-confusions.tsx`, `home-three-ages.tsx`
- **At 55** (`src/components/at-55/`): projected day-before/day-after balances around the SA closure, cohort retirement sums for `/at-55`
- **Accrued Interest** (`src/components/housing/`): OA housing accrued-interest illustration for `/accrued-interest`, powered by `src/lib/calculate-accrued-interest.ts`
- **CPF Check** (`src/components/check/`): five self-assessment cards for `/cpf-check` (local state only, nothing recorded)
- **Projection Components** (`src/components/projection/`): Projection form, stacked balance chart, milestone cards, CPF LIFE estimate card, and yearly projection table for the `/projection` page
- **What-If Components** (`src/components/what-if/`): Scenario selector, scenario-specific forms, comparison chart, and result cards for the `/what-if` page
- **CPF LIFE Components** (`src/components/cpf-life/`): CPF LIFE payout estimator inputs, plan comparison cards, and retirement sum references for the `/cpf-life` page

## Design System

See `.claude/skills/design-language-system/SKILL.md` for complete design system documentation.

### Key Principles

- **Aesthetic:** Warm paper, ink, one green (forest) — \"look accurate\": numbers are the hero
- **Colours:** HeroUI default theme variable names with brand values in OKLCH via `globals.css`; fixed chart encoding, clay for caveats
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

### Off-Limits

- **DO NOT import** from `src/components/ui/*` in new code — deprecated shadcn/ui, pending removal together with the LEGACY-ALIAS block in `globals.css`
- **Dark mode** is fully supported: `.dark` token block in `globals.css` mirrors the light tokens with the brand's dark values

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
