import { Card } from "@heroui/react";
import { ageGroups } from "@/data";

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

const CpfDistributionComparisonBlock = () => (
  <section
    aria-labelledby="cpf-distribution-comparison"
    data-content-block="comparison"
  >
    <Card>
      <Card.Header>
        <Card.Title id="cpf-distribution-comparison">
          CPF Distribution Rates Comparison by Age Group
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="pr-4 pb-4 text-left font-semibold">Age Group</th>
                <th className="pr-4 pb-4 text-right font-semibold">
                  OA (Ordinary)
                </th>
                <th className="pr-4 pb-4 text-right font-semibold">
                  SA (Special)
                </th>
                <th className="pb-4 text-right font-semibold">MA (MediSave)</th>
              </tr>
            </thead>
            <tbody>
              {ageGroups.map((g) => (
                <tr key={g.description} className="border-b last:border-0">
                  <td className="py-4 pr-4 font-medium">{g.description}</td>
                  <td className="py-4 pr-4 text-right font-mono">
                    {fmtPct(g.distributionRate.OA)}
                  </td>
                  <td className="py-4 pr-4 text-right font-mono">
                    {fmtPct(g.distributionRate.SA)}
                  </td>
                  <td className="py-4 text-right font-mono">
                    {fmtPct(g.distributionRate.MA)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card>
  </section>
);

export default CpfDistributionComparisonBlock;
