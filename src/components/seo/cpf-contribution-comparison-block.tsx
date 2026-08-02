import { Card } from "@heroui/react";
import { ageGroups } from "@/data";
import { formatPercentage } from "@/lib/format";

const CpfContributionComparisonBlock = () => (
  <section
    aria-labelledby="cpf-contribution-comparison"
    data-content-block="comparison"
  >
    <Card>
      <Card.Header>
        <Card.Title id="cpf-contribution-comparison">
          CPF Contribution Rates Comparison by Age Group
        </Card.Title>
      </Card.Header>
      <Card.Content>
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
                      {formatPercentage(emp, { decimalPlaces: 1 })}
                    </td>
                    <td className="py-4 pr-4 text-right font-mono">
                      {formatPercentage(empR, { decimalPlaces: 1 })}
                    </td>
                    <td className="py-4 text-right font-mono font-semibold">
                      {formatPercentage(emp + empR, { decimalPlaces: 1 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card>
  </section>
);

export default CpfContributionComparisonBlock;
