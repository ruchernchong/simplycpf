# SimplyCPF

[![Version](https://img.shields.io/github/package-json/v/ruchernchong/simplycpf)](https://github.com/ruchernchong/simplycpf)
[![License](https://img.shields.io/github/license/ruchernchong/simplycpf)](LICENSE)

A modern web application to calculate CPF (Central Provident Fund) contributions and project retirement balances following the 2023 income ceiling changes announced by Singapore's Ministry of Finance.

**[🚀 Visit SimplyCPF](https://simplycpf.com)**

## Features

- 💰 **Accurate CPF Calculations** - Compute employee and employer contributions based on current income ceilings
- 📊 **Age-Based Rates** - Automatic calculation using 8 different age brackets with varying contribution rates
- 📈 **Distribution Breakdown** - View OA (Ordinary Account), SA (Special Account), and MA (MediSave Account) allocations
- 🔮 **Retirement Projection** - Project your CPF balances to age 55, 65, or 70 with CPF LIFE estimates and optional housing, top-up, and OA to SA assumptions
- 🧪 **What-If Simulator** - Compare salary changes, OA to SA transfers, annual top-ups, and the cost of starting later
- 🔗 **Shareable URLs** - Copy projection and what-if links with the current inputs already encoded in the URL
- 🛟 **CPF LIFE Estimator** - Estimate monthly CPF LIFE payouts from your Retirement Account balance and compare the main plan types
- 🧾 **CPF Cheat Sheet** - Download a printable PDF with contribution rates, account distribution, retirement sums, BHS, and PR reference points
- ✅ **Retirement Readiness Score** - Answer 5 quick questions to see which CPF planning gap to fix next and get a tailored follow-up report by email
- 🕒 **Interactive Timeline** - Visualise CPF income ceiling changes from 2023 to 2026 with an interactive timeline
- 📱 **Mobile-Friendly** - Responsive design with PWA support for offline use
- 📄 **PDF Export** - Download your CPF calculation results as a PDF document
- 🎨 **Modern UI** - Built with Next.js 16, React 19, and Tailwind CSS
- ⚡ **Fast & Lightweight** - Optimized performance with Turbopack

## About

Following the Ministry of Finance announcement at Singapore Budget 2023 (13 February 2023), the CPF income ceiling is being progressively raised:
- **Previous ceiling**: $6,000 (before September 2023)
- **Current target**: $8,000 (by September 2026)

This calculator helps Singaporeans estimate their take-home income after CPF contributions under the new ceiling structure while accounting for age-specific contribution and distribution rates. It also includes a CPF projection page for modelling how your balances may grow across OA, SA, MA, and RA over time.

The core calculators and planning tools work without sign-up. Email is only requested if you want SimplyCPF to send you a cheat sheet or readiness report.

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: Base UI primitives
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
- **API Reference** - Complete documentation for all 12 endpoints
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

## Project Structure

```
src/
├── app/              # Next.js app directory (routes, layouts)
│   └── (docs)/      # Developer portal (Fumadocs)
├── atoms/            # Jotai state atoms
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── data/            # CPF age groups and rates data
├── lib/             # Core calculation logic
├── types/           # TypeScript type definitions
├── constants/       # CPF income ceilings by year
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

- CPF contribution rates and distribution data sourced from [Singapore's CPF Board](https://www.cpf.gov.sg/)
- Income ceiling changes based on Ministry of Finance Budget 2023 announcements

## Author

**Ru Chern Chong**

---

Made with ❤️ for the Singapore community
