# Design System: SimplyCPF

Derived from the SimplyCPF Brand Kit v1 (Claude Design project *SimplyCPF UI
mockups*, `Brand Kit.dc.html`). The Brand Kit is the source of truth; where this
file and the kit disagree, the kit wins.

Canonical token definitions live in `src/app/globals.css`. Literal hex for
contexts that cannot read CSS custom properties (generated images, PDF export)
lives in `src/lib/brand.ts` and must be kept in step.

## Positioning

> A quiet brand for a loud, confusing topic.

Paper, ink, one green, real numbers. Nothing that reads as a fintech pitch,
nothing that could be mistaken for an official government channel.

**The three rules**

1. Numbers are the hero. Type and colour stay out of their way.
2. One green. Green means CPF money or a next step, never decoration.
3. Independent, and it always says so.

## Colour

The Brand Kit specifies hex. `globals.css` carries the OKLCH conversions.

### Surfaces

| Name | Hex | Role |
|---|---|---|
| Bone | `#F4F0E6` | Page background. The default everywhere. |
| Card | `#FFFDF7` | Raised surfaces: cards, inputs, popovers. |
| Ink | `#23261E` | Body text, the mark, take-home in charts. |
| Hairline | ink @ 12% | All borders and dividers. **1px, never heavier.** |

### Text tints: four, each with a distinct job

| Name | Hex | Role |
|---|---|---|
| Primary | `#23261E` | Headings, figures, anything a user will quote back to you. |
| Body | `#5D6055` | Explanatory paragraphs. The long-form voice. |
| Secondary | `#6E7166` | Inactive tabs, chart legends, table sub-values. |
| Muted | `#8A8C80` | Mono eyebrows, footnotes, disclaimers. **Never body copy.** |

Using Secondary where Body belongs is the most common drift in this codebase.

### Forest and clay

| Name | Hex | Role |
|---|---|---|
| Forest | `#2C5F45` | Primary action, links, OA bars, live-data dot. |
| Forest deep | `#1C4230` | **Hover and pressed states only.** |
| Green mid | `#5E9B79` | Your contribution. SA/RA in charts. |
| Green light | `#9CC4AC` | Employer contribution. MA in charts. |
| Clay | `#8A5B33` | Caveats, ceilings hit, "this changed in 2025". **Sparingly.** |

Clay is matched to forest's lightness and chroma so warnings can exist without
importing a fire-engine red.

### Alpha ladder (ink, unless stated)

6% segmented-control track · 7% disabled background, neutral chip · 8% chart
track · 9% inner dividers · 11% section rules, stat-band top · 12% canonical
hairline · 13% standard card and field border · 20% outline button (40% hover)
· forest 45% interactive-card hover border · forest 10% forest chip background.

## Data visualisation

A **fixed encoding**, not a palette to rotate through.

| Slot | Colour | Meaning |
|---|---|---|
| 1 | Forest `#2C5F45` | **OA**: housing, education, investment |
| 2 | Green mid `#5E9B79` | **SA / RA**: retirement. Same slot before and after 55 |
| 3 | Green light `#9CC4AC` | **MA**: medical |
| 4 | Ink `#23261E` | **Take-home**: money in the bank, not in CPF |
| 5 | Clay `#8A5B33` | **Above ceiling**: the portion that gets no CPF at all |
| track | Ink 8% | Unfilled remainder of any bar |

On ink backgrounds every slot lifts (forest reads as almost black there). See
`chart*OnInk` in `src/lib/brand.ts`, mirroring the `.dark` tokens.

**Do**
- Label inside the bar when it fits, below when it doesn't. Never a floating
  legend if a direct label is possible.
- State the total in words nearby. A bar without a dollar figure is decoration.
- Bar tracks 6px for allocation rows, 38 to 40px for the hero split. Radius 999px
  on thin, 8px on thick.
- Axes are hairlines or absent. No gridlines behind bars.

**Never**
- No pie or donut charts. Allocation is a split bar, always.
- No gradients, drop shadows or 3D on data.
- No animated count-ups on figures a user might screenshot.
- Never reuse an account colour for a non-account series.

## Typography

**Geist** for everything a person reads, **Geist Mono** for everything a machine
produced: labels, rates, dates, account codes. Tabular numerals globally, so
columns of dollars never shimmer.

| Step | Size | Line-height | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| Display | 58 | 1.02 | 600 | -.035em | Home hero only |
| Page h1 | 36 | 1.05 | 600 | -.03em | |
| Section | 30 | 1.1 | 600 | -.028em | |
| Figure | 28 | 1 | 600 | -.02em | Unit suffix 16px/400/muted |
| Lead | 19 | 1.45 | 400 | -.01em | Max 34ch |
| Body | 15 | 1.55 | 400 | 0 | Body tint `#5D6055` |
| Small | 12.5 | 1.55 | 400 | 0 | Muted `#8A8C80` |
| Eyebrow | Mono 10.5 | n/a | 400 | +.13em upper | Forest when live/current, else Muted |
| Label | Mono 10 | n/a | 400 | +.12em upper | Card kickers, stat-band, field labels |

**Rules**
- Weights **400, 500, 600. Nothing heavier**. The lockup is 600, so 700 has no
  sanctioned use.
- Tracking tightens as size grows: -.035em at 58px, 0 below 15px.
- **Never centre a paragraph.** Headlines may be balanced (`text-wrap: balance`);
  body is always ragged-right (`text-wrap: pretty`).
- Max measure **64ch**. Below 40ch it reads as a caption.
- **Mono is never used for a full sentence a human wrote.**

Prefer HeroUI's `Typography` component; the `.typography--*` classes are retuned
to the scale above in `globals.css`.

## Radius, borders, shadows

**Radius ladder:** 7 segment thumb · 8 thick bar · 9 button, segment track ·
12 field · **14 flat card** · **18 hero card** · 999 chip and thin bar.

**Borders:** hairline ink at low alpha, 1px, never heavier. Interactive card
hover moves the *border* to forest 45%, never the shadow.

**Shadows, almost absent:**
- Seat: `0 1px 2px rgba(35,38,30,.05)`
- Hero lift: `0 1px 2px rgba(35,38,30,.05), 0 18px 40px -22px rgba(35,38,30,.22)`
  (**once per screen, on the answer**)
- Segment thumb: `0 1px 2px rgba(35,38,30,.08)`

## Components

**Buttons**: one filled button per screen. Everything else is outline or a text
link.
- Filled: forest background, bone text, 14px/500, `padding 11px 20px`, radius 9.
  Hover moves to forest deep.
- Outline: transparent, ink text, 14px/500, `padding 10px 19px`, radius 9,
  border ink 20%. Hover border ink 40%.
- Text link: forest, 13px/500, trailing `→`. Hover forest deep.
- Disabled: background ink 7%, text `#8A8C80`.

**Field:** card background, border ink 13%, radius 12, `padding 12px 15px 13px`.
Mono 10px/.12em label in Muted, 6px above. `$` prefix 18px muted, value
28px/600/-.02em, baseline-aligned.

**Chips:** pill, radius 999, 11.5px/500, `padding 4px 10px`. Forest is `#2C5F45`
on forest 10%. Clay is `#6B4526` on clay 10%. Neutral is `#6E7166` on ink 7%.

**Cards:** flat (radius 14, border ink 12%, no shadow) is the default for grids
and lists. Hero (radius 18, plus the soft lift) is once per screen, on the
answer.

**Stat band:** border-top ink 11%, band background, `padding 24px 48px`, 5
columns, gap 32. Per item: Mono 10/.12em Muted label, 7px gap, value
21px/600/-.02em, 3px gap, note 11.5px Secondary.

## Logo

Always **SimplyCPF**, one word with an internal capital, with an ink rule beneath it,
broken by one forest segment. The rule is borrowed from a statement, not a
chart: it is the line drawn under a figure that has been checked.

- Rule height = **16% of cap height**; gap above = **32%**. The forest segment is
  **always the shorter one, always at the right**.
- **Reversed** (on ink or forest): wordmark and long rule go bone; the accent
  segment steps up to **green mid**, because forest is too close to ink to read there.
- **Icon:** the lockup abstracted. Favicon, app icon, avatar. Never beside the
  wordmark.
- Sizes: 17.5px product header, **13px minimum**. Clear space = cap height on
  all four sides; nothing enters it.

Assets ship in `public/`: `simplycpf-wordmark.svg`, `-reversed.svg`,
`-mono-ink.svg`, `simplycpf-icon.svg`, `-light.svg`, `simplycpf-favicon.svg`.
The wordmark SVGs carry live text in Geist 600. Outline before handing off to
anyone without the font. Generated images use `src/lib/wordmark-mark.tsx`, since
Satori cannot render SVG `<text>`.

**Never**
1. Don't run the rule all forest, or drop the break. The short segment is the mark.
2. Don't set it all-caps or letterspace it. The internal capital is the whole idea.
3. **Never lock up with CPF Board or any government mark.** Implies an
   endorsement we do not have.
4. No gradients, no photo backgrounds. Paper, ink, or solid forest only.

## Voice

Plain not dumbed down · Specific over reassuring · Honest about limits ·
**Never advice**.

Never: product-marketing hype, bureaucratic register, recommendations, emoji,
exclamation marks, or manufactured anxiety to then soothe.

**Disclaimer, verbatim:**

> SimplyCPF is independent and not affiliated with the CPF Board. Figures are
> estimates based on published rates and are not financial advice.

Required on: the hero footnote of every entry screen, the page footer, every
shared or exported artefact, and any social card that shows a figure. Rewording
shorter is fine; dropping it is not.

## Spacing

Philosophy: **"Push Down, Not Pull Up"**. Elements push content below them
rather than pulling from above.

- **No `mt-*` or `pt-*`**. Use `mb-*`, `pb-*` and `gap-*`.
- Use `gap-*` for flex/grid containers.
- Exception: `pt-*` for sticky elements offsetting fixed headers.

**Layout spacing follows the 8px grid** (`2` 8px tight · `4` 16px default · `6`
24px sections · `8` 32px between cards · `12` 48px page sections).

**Component internals follow the Brand Kit's own values**, which are not all 8px
multiples. The kit uses 3, 5, 6, 7, 9, 11, 13, 14, 15, 18, 20, 22, 26, 30, 34
and 38px. Do not round these to the grid; they are specified.

Observed layout metrics: header height 72px · section padding 48 to 64px
horizontal · card grid gaps 16/20/24 · card padding 13 to 15 (small), 18 to 20 (chip),
22 to 26 (standard), 26 to 32 (large).

**Internal ≤ external:** padding inside a component should never exceed the gap
around it.

## Tailwind CSS v4 conventions

- CSS-first configuration in `globals.css` via `@theme inline`.
- `size-*` rather than `w-* h-*` for square elements.
- `gap-*` rather than `space-*`.
- Logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`).

## Off-limits

- **Do not import from `src/components/ui/*`**. Deprecated shadcn/ui, pending
  removal together with the LEGACY-ALIAS block in `globals.css`.
- Appearance comes from HeroUI props and theme tokens. `className` on component
  roots is for composition only (layout, sizing, gaps), never hardcoded colours.
- Dark mode is fully supported and in scope: the `.dark` block in `globals.css`
  mirrors the light tokens.
