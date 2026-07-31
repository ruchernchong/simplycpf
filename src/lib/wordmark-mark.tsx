import type { ReactElement } from "react";
import { BRAND } from "@/lib/brand";

interface WordmarkProps {
  /** Type size in px. The rule beneath is derived from it. */
  fontSize: number;
  /**
   * On ink or forest the wordmark and long rule go bone, and the accent
   * segment steps up to green mid, forest is too close to ink to read there.
   */
  reversed?: boolean;
}

/**
 * Measured from a rendered Satori frame: "SimplyCPF" set in Geist 600 at
 * -0.028em tracking occupies 4.886x the font size. Used to size the rule to
 * the wordmark, since Satori cannot measure text during layout.
 */
const TEXT_WIDTH_RATIO = 4.886;

/**
 * Rule proportions from public/simplycpf-wordmark.svg (viewBox 642x178): the
 * accent segment is 158 of the 642 total width, separated by an 18 gap, and
 * the rule is 16 tall, the brand kit's "16% of the cap height".
 */
const ACCENT_WIDTH_RATIO = 158 / 642;
const RULE_GAP_RATIO = 18 / 642;
const RULE_HEIGHT_RATIO = 16 / 642;
const BASELINE_GAP_RATIO = 30 / 642;

/**
 * The SimplyCPF lockup for generated images (`next/og`). Satori cannot render
 * SVG <text>, so the mark is composed from boxes rather than reusing the
 * shipped SVG. Every dimension is resolved to explicit pixels: Satori
 * collapses `flex: 1` and mis-resolves percentage widths inside an
 * auto-width parent, which silently runs the whole rule forest and loses the
 * break that is the mark.
 */
export function Wordmark({ fontSize, reversed }: WordmarkProps): ReactElement {
  const inkColor = reversed ? BRAND.bone : BRAND.ink;
  const accentColor = reversed ? BRAND.greenMid : BRAND.forest;

  const width = fontSize * TEXT_WIDTH_RATIO;
  const accentWidth = width * ACCENT_WIDTH_RATIO;
  const gap = width * RULE_GAP_RATIO;
  const ruleHeight = width * RULE_HEIGHT_RATIO;

  return (
    <div style={{ display: "flex", flexDirection: "column", width }}>
      <div
        style={{
          fontSize,
          fontWeight: 600,
          letterSpacing: "-0.028em",
          color: inkColor,
          lineHeight: 1,
        }}
      >
        SimplyCPF
      </div>
      <div
        style={{
          display: "flex",
          marginTop: width * BASELINE_GAP_RATIO,
        }}
      >
        <div
          style={{
            width: width - accentWidth - gap,
            height: ruleHeight,
            borderRadius: 999,
            background: inkColor,
          }}
        />
        <div
          style={{
            width: accentWidth,
            height: ruleHeight,
            marginLeft: gap,
            borderRadius: 999,
            background: accentColor,
          }}
        />
      </div>
    </div>
  );
}
