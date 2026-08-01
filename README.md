# SimplyCPF

[![Version](https://img.shields.io/github/package-json/v/ruchernchong/simplycpf)](https://github.com/ruchernchong/simplycpf)
[![License](https://img.shields.io/github/license/ruchernchong/simplycpf)](LICENSE)

A CPF (Central Provident Fund) contribution and planning application for Singapore employees, backed by dated policy tables and first-party government sources.

**[🚀 Visit SimplyCPF](https://simplycpf.com)**

## Features

- 💰 **Source-backed CPF calculations** - Apply the effective contribution month, wage band, OW/AW ceilings, citizenship status, and CPF statutory rounding rules
- 📊 **Dated age-based schedules** - Resolve only the contribution and allocation schedules published in the canonical policy catalogue
- 📈 **Distribution breakdown** - View exact OA (Ordinary Account), SA/RA (Special or Retirement Account), and MA (MediSave Account) allocations
- 🔮 **Monthly retirement projection** - Project supplied starting OA, SA, MA, and RA balances with published CPF schedules and clearly labelled frozen-policy assumptions
- 🧪 **What-if simulator** - Compare salary changes, age-aware retirement transfers, top-ups, and the cost of starting later
- 🔗 **Shareable URLs** - Copy projection and what-if links with the current inputs already encoded in the URL
- 🛟 **CPF LIFE Reference** - Review CPF Board's exact published Standard Plan reference rows and plan characteristics, with a link to CPF's personalised planner
- 🧾 **CPF Cheat Sheet** - Download a printable PDF with contribution rates, account distribution, retirement sums, BHS, and PR reference points
- ✅ **SimplyCPF Readiness Score** - Use an editorial self-check to identify a planning topic to review next; it is not a CPF Board assessment
- 🕒 **Interactive Timeline** - Visualise every published CPF income-ceiling change in the policy catalogue
- 📱 **Mobile-Friendly** - Responsive design with PWA support for offline use
- 📄 **PDF Export** - Download your CPF calculation results as a PDF document
- 🎨 **Modern UI** - Built with Next.js 16, React 19, and Tailwind CSS
- ⚡ **Fast & Lightweight** - Optimized performance with Turbopack

## About

This calculator helps Singapore employees estimate take-home income after CPF contributions while accounting for the effective month, wage bands, citizenship status, age transitions, ceilings, rounding, and account-routing rules. The projection page uses a monthly ledger over supplied OA, SA, MA, and RA starting balances.

Official policy lives in `src/policy/`, with effective dates, first-party source URLs, status, and per-dataset verification metadata. Unsupported public reference years return errors rather than silently clamping. Projection years beyond published policy freeze the last official value and are marked as SimplyCPF assumptions.

Contribution scope is private-sector, non-pensionable employees who are Singapore Citizens or Permanent Residents using CPF Board's default Graduated/Graduated rates. Platform workers, self-employed persons, pensionable employees, and approved alternative PR contribution arrangements are outside scope.

The core calculators and planning tools work without sign-up. The site has no account or email collection flow.

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x with HeroUI v3 and HeroUI Pro
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: HeroUI v3 React components
- **Charts**: Recharts
- **Testing**: Vitest with React Testing Library
- **Linting**: Biome
- **Package Manager**: pnpm 11.x (RC)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 11.x (RC, automatically enforced via `packageManager` field)

### Installation

```bash
# Clone the repository
git clone https://github.com/ruchernchong/simplycpf.git
cd simplycpf

# Install dependencies (Husky hooks initialise automatically via the `prepare` script)
pnpm install

# Start development server via Portless
pnpm dev

# Start development server without Portless
PORTLESS=0 pnpm dev
```

The application will be available at `https://simplycpf.localhost` by default, or `http://localhost:3000` when Portless is disabled.

### Environment Variables

API rate limiting is enabled when these Upstash Redis variables are configured. Without them, local and preview environments fail open and skip rate limiting.

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Development Commands

```bash
# Start development server via Portless
pnpm dev

# Start development server without Portless
PORTLESS=0 pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Developer Portal

The application includes a comprehensive API documentation portal at `/docs` with:

- **Getting Started** - Quick start guide for developers
- **API Reference** - Complete documentation for the current CPF endpoints
- **Examples** - Code samples in JavaScript/TypeScript and Python
- **Changelog** - Version history and updates

### LLM Integration

The site provides LLM-friendly endpoints following the [llms.txt specification](https://llmstxt.org/):
- `/llms.txt` - Concise site summary for AI assistants
- `/docs/llms-full.txt` - Complete documentation in plain text format

### API Endpoints

| Category | Endpoints |
|----------|-----------|
| Calculation | `/calculate`, `/calculate/batch`, `/projection` |
| Age Groups | `/age-groups`, `/age-group/find`, `/age/from-birthdate` |
| Income Ceiling | `/ceiling`, `/ceiling/timeline` |
| Interest Rates | `/interest-rates`, `/interest-rates/smra`, `/interest-rates/trend` |
| Investment | `/investment-comparison` |
| Reference Data | `/bhs`, `/retirement-sums` |

## Project Structure

```
src/
├── app/              # Next.js app directory (routes, layouts)
│   └── (docs)/      # Developer portal (Fumadocs)
├── stores/           # Zustand state stores
├── components/       # React components
├── data/            # Catalogue-generated FAQ and compatibility data
├── lib/             # Core calculation logic
├── policy/          # Versioned CPF policy catalogue and provenance
├── types/           # TypeScript type definitions
├── constants/       # Compatibility adapters over the policy catalogue
└── utils/           # Utility functions
content/
└── docs/            # Developer portal MDX content
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- CPF contribution, allocation, ceiling, interest, healthcare, retirement, housing, and CPF LIFE references are linked to the relevant [CPF Board publications](https://www.cpf.gov.sg/).
- Tax-relief references use IRAS, and statutory retirement/re-employment ages use MOM. SimplyCPF assumptions are labelled separately from official policy.

## Author

**Ru Chern Chong**

---

Made with ❤️ for the Singapore community
