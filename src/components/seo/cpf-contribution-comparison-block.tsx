import { ageGroups } from "@/data";

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const CpfContributionComparisonBlock = () => (
  <section
    aria-labelledby="cpf-contribution-comparison"
    data-content-block="comparison"
    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
  >
    <div className="flex flex-col gap-1">
      <h2
        id="cpf-contribution-comparison"
        className="font-semibold text-[16px] text-foreground"
      >
        CPF Contribution Rates Comparison by Age Group
      </h2>
      <p className="text-[12px] text-muted-foreground">
        Combined employee + employer CPF contribution rates across all 8 age
        brackets.
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-border border-b text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
            <th className="pr-4 pb-3 text-left font-semibold">Age Group</th>
            <th className="pr-4 pb-3 text-right font-semibold">Employee</th>
            <th className="pr-4 pb-3 text-right font-semibold">Employer</th>
            <th className="pb-3 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {ageGroups.map((g) => {
            const emp = g.contributionRate.employee;
            const empR = g.contributionRate.employer;
            return (
              <tr
                key={g.description}
                className="border-border border-b last:border-0"
              >
                <td className="py-3 pr-4 font-medium text-foreground">
                  {g.description}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-muted-foreground">
                  {fmtPct(emp)}
                </td>
                <td className="py-3 pr-4 text-right font-mono text-muted-foreground">
                  {fmtPct(empR)}
                </td>
                <td className="py-3 text-right font-mono font-semibold text-foreground">
                  {fmtPct(emp + empR)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

export default CpfContributionComparisonBlock;
