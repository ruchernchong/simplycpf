import CheatSheetCta from "@/components/lead-magnets/cheat-sheet-cta";
import ReadinessScoreCta from "@/components/lead-magnets/readiness-score-cta";

export default function LeadMagnetsSection() {
  return (
    <section
      aria-labelledby="lead-magnets-heading"
      className="flex flex-col gap-4"
    >
      <div>
        <h2
          id="lead-magnets-heading"
          className="mb-2 font-semibold text-foreground text-xl"
        >
          Free CPF Resources
        </h2>
        <p className="max-w-3xl text-muted-foreground">
          Keep one quick reference close by, or use the 5-question readiness
          check to figure out which CPF planning decision to tackle next.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CheatSheetCta />
        <ReadinessScoreCta />
      </div>
    </section>
  );
}
