# Homepage redesign: visual QA

Initial development-only review: passed on 5 September 2026, but insufficient to establish production readiness. The deployed preview subsequently failed: its CSS omitted the product layout rules.

Production correction reviewed on 6 September 2026: product rules are imported from a separate stylesheet; a complete Next.js production build now retains them. Desktop light/dark layouts and mobile layout were checked against the running production build. A build-time CSS regression check now verifies the assets actually linked by the homepage.

## Reference and evidence

Approved direction: the quick financial statement from option 1, warmer wording from option 2, and the original cream background. HeroUI OSS and Pro remain the component libraries.

- [Approved mockup](/Users/ruchernchong/.codex/generated_images/01a06f8d-6e67-7971-8688-b3d90ba3b839/exec-5a7c5570-d3c4-45c5-b000-e5aa674ccbf1.png): 1487 × 1058.
- [Desktop implementation](/Users/ruchernchong/.codex/visualizations/2026/09/05/01a06f8d-6e67-7971-8688-b3d90ba3b839/homepage-desktop.jpg): 1440 × 1024 viewport, light theme, default example.
- [Mobile implementation](/Users/ruchernchong/.codex/visualizations/2026/09/05/01a06f8d-6e67-7971-8688-b3d90ba3b839/homepage-mobile.jpg): 390 px viewport, full page.
- [Mobile dark theme](/Users/ruchernchong/.codex/visualizations/2026/09/05/01a06f8d-6e67-7971-8688-b3d90ba3b839/homepage-mobile-dark.jpg): 390 px viewport, full page.

The source and rendered desktop screenshot were displayed together for direct comparison at approximately matching aspect ratios. This was a visual comparison, not a pixel-difference test.

## Fidelity review

| Surface | Result |
| --- | --- |
| Composition | Compact navigation, introductory heading, editable inputs, three-column statement, salary split and onward journeys match the approved hierarchy. |
| Colour | Cream page, ivory fields, ink typography and forest action colour use the existing theme tokens; dark theme remains supported. |
| Typography | Geist headings and tabular financial figures preserve the dominant take-home amount and quieter supporting figures. |
| Controls | HeroUI form fields, select, buttons and links retain native behaviour; Pro mobile navigation and theme controls remain available. |
| Responsive layout | Take-home moves first on mobile. Inputs use two columns; salary split labels move outside the bar. No horizontal overflow at 1440, 390 or 320 px. |

Visual iterations corrected select alignment, field borders, wordmark scale, mobile input height, narrow-screen label wrapping, clipped bar labels and desktop journey spacing. No unresolved major visual issues were found in the final comparison.

Intentional differences from the mockup: the salary bar correctly represents the example's 80/20 split; employer CPF stays separate from salary deductions; theme controls and existing footer destinations are retained; birth month uses text entry rather than a decorative calendar control. Chart labels use contrasting ink. No generated raster assets are required by the implemented interface.

## Behaviour and validation

- Default salary $5,000 produces $4,000 take-home, $1,000 employee CPF and $850 employer CPF.
- Submitted salary $8,000 produces $6,400 take-home; $10,000 honours the contribution ceiling.
- First-year PR selection produces the appropriate reduced contributions. Draft edits preserve the submitted results until Update is pressed.
- Zero salary and a future birth month show inline errors without replacing valid results.
- The retirement action carries submitted inputs into the projection URL and form. Client navigation to the calculator retains shared inputs.
- Mobile navigation opens and closes. Light and dark themes were inspected. Browser error log was empty during the final checks.
- Vitest: 44 test files, 297 tests passed. Biome: 252 files checked, no issues. Next.js route type generation passed.

The original standalone TypeScript check reported an OpenAPI JSON-to-Document incompatibility at `src/app/(docs)/lib/openapi.ts:7`. The complete production build during the 6 September correction, including Next.js TypeScript checking and static page generation, passed.

Scope delivered: homepage redesign and shared navigation/layout, with compatible HeroUI Pro imports on existing tool screens. Other tool screens retain their existing layouts.
