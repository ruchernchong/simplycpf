/**
 * Brand palette as literal hex, for contexts that cannot read CSS custom
 * properties, generated images (`next/og`), PDF export, and SVG assets.
 *
 * The canonical definitions live in `src/app/globals.css`; these must be kept
 * in step with it. Source: SimplyCPF Brand Kit v1.
 */
export const BRAND = {
  /** Page background. The default everywhere. */
  bone: "#F4F0E6",
  /** Raised surfaces: cards, inputs, popovers. */
  card: "#FFFDF7",
  /** Body text, the mark, take-home in charts. */
  ink: "#23261E",

  /** Text tints, in the order the brand kit defines them. */
  textPrimary: "#23261E",
  textBody: "#5D6055",
  textSecondary: "#6E7166",
  textSubtle: "#8A8C80",

  /** Reversed text tints, for use on ink. */
  tintOnInk: "#B8B5A8",
  tintOnInkMuted: "#8A8C80",

  /** Primary action, links, OA. Green means CPF money or a next step. */
  forest: "#2C5F45",
  /** Hover and pressed states only. */
  forestDeep: "#1C4230",
  /** Your contribution. SA/RA in charts. */
  greenMid: "#5E9B79",
  /** Employer contribution. MA in charts. */
  greenLight: "#9CC4AC",
  /** Caveats, ceilings hit, and dated policy changes. Sparingly. */
  clay: "#8A5B33",

  /** Fixed chart encoding, never rotated. */
  chart1: "#2C5F45",
  chart2: "#5E9B79",
  chart3: "#9CC4AC",
  chart4: "#23261E",
  chart5: "#8A5B33",

  /**
   * The same encoding on ink. Forest is too close to ink to read there, so
   * every slot lifts, these mirror the `.dark` chart tokens in globals.css.
   */
  chart1OnInk: "#6FB88F",
  chart2OnInk: "#A6D9BB",
  chart3OnInk: "#9CC4AC",
  chart4OnInk: "#EDE8DA",
  chart5OnInk: "#C08A5A",
} as const;
