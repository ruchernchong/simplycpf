import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { CPF_ACCOUNT_MAP } from "@/constants";
import { formatCurrency } from "@/lib/format";
import type { DistributionResult } from "@/types";

const DistributionPieChart = dynamic(() => import("./distribution-pie-chart"));

interface DistributionViewProps {
  distributionResults: DistributionResult[];
}

export const DistributionView = ({
  distributionResults,
}: DistributionViewProps) => {
  const totalCpfContribution = distributionResults.reduce(
    (accum, curr) => accum + curr.value,
    0,
  );

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div>
            <div className="flex items-center justify-between border-b py-4 font-semibold text-xl last:border-0">
              <p>Total Monthly CPF Contributions</p>
              <p>{formatCurrency(totalCpfContribution)}</p>
            </div>
            {distributionResults.map(({ name, value }) => (
              <div
                key={name}
                className="flex items-center justify-between border-b py-4 last:border-0"
              >
                <p className="font-medium text-zinc-500">
                  Your {CPF_ACCOUNT_MAP[name]} ({name})
                </p>
                <p className="font-semibold text-xl">{formatCurrency(value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardContent className="flex h-[300px] items-center justify-center p-6">
          <DistributionPieChart
            data={distributionResults}
            className="block h-full w-full"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributionView;
