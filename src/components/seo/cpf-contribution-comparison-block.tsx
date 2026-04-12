import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ageGroups } from "@/data";

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const CpfContributionComparisonBlock = () => (
  <section
    aria-labelledby="cpf-contribution-comparison"
    data-content-block="comparison"
  >
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle id="cpf-contribution-comparison">
          CPF Contribution Rates Comparison by Age Group
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="pr-4 pb-4 text-left font-semibold">Age Group</th>
                <th className="pr-4 pb-4 text-right font-semibold">Employee</th>
                <th className="pr-4 pb-4 text-right font-semibold">Employer</th>
                <th className="pb-4 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {ageGroups.map((g) => {
                const emp = g.contributionRate.employee;
                const empR = g.contributionRate.employer;
                return (
                  <tr key={g.description} className="border-b last:border-0">
                    <td className="py-4 pr-4 font-medium">{g.description}</td>
                    <td className="py-4 pr-4 text-right font-mono">
                      {fmtPct(emp)}
                    </td>
                    <td className="py-4 pr-4 text-right font-mono">
                      {fmtPct(empR)}
                    </td>
                    <td className="py-4 text-right font-mono font-semibold">
                      {fmtPct(emp + empR)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </section>
);

export default CpfContributionComparisonBlock;
