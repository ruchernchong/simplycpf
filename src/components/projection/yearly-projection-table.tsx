import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { ProjectionResult } from "@/types";

interface YearlyProjectionTableProps {
  yearlyBalances: ProjectionResult["yearlyBalances"];
}

export default function YearlyProjectionTable({
  yearlyBalances,
}: YearlyProjectionTableProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Year-by-Year Projection</CardTitle>
        <CardDescription>
          Expand this table if you want the full yearly contribution and balance
          breakdown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <details className="group">
          <summary className="cursor-pointer rounded-lg bg-muted/50 px-4 py-4 font-medium text-foreground text-sm transition-colors hover:bg-muted">
            See {yearlyBalances.length} yearly rows
          </summary>
          <div className="pb-2" />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Age group</TableHead>
                <TableHead className="text-right">Employee</TableHead>
                <TableHead className="text-right">Employer</TableHead>
                <TableHead className="text-right">OA</TableHead>
                <TableHead className="text-right">SA</TableHead>
                <TableHead className="text-right">MA</TableHead>
                <TableHead className="text-right">RA</TableHead>
                <TableHead className="text-right">Interest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearlyBalances.map((row) => (
                <TableRow key={row.year}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.ageGroup}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.contributions.employee, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.contributions.employer, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.balances.oa, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.balances.sa, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.balances.ma, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.balances.ra, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      row.interestEarned.oa +
                        row.interestEarned.sa +
                        row.interestEarned.ma +
                        row.interestEarned.ra +
                        row.interestEarned.extraInterest,
                      0,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </details>
      </CardContent>
    </Card>
  );
}
