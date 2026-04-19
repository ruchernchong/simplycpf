import posthog from "posthog-js";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { CPF_INCOME_CEILING } from "@/constants";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { selectLatestIncomeCeilingDate } from "@/stores/selectors";

const CPFYearSlider = () => {
  const latestIncomeCeilingDate = useCpfStore(selectLatestIncomeCeilingDate);
  const setLatestIncomeCeilingDate = useCpfStore(
    (state) => state.setLatestIncomeCeilingDate,
  );

  const [sliderValue, setSliderValue] = useState(latestIncomeCeilingDate);

  const dateKeys = Object.keys(CPF_INCOME_CEILING);

  const handleValueChange = (value: number | readonly number[]) => {
    const index = Array.isArray(value) ? value[0] : value;
    const selectedDate = dateKeys[index];
    setSliderValue(selectedDate);
    setLatestIncomeCeilingDate(selectedDate);
    posthog.capture("timeline_year_changed", {
      selected_date: selectedDate,
      ceiling_value: CPF_INCOME_CEILING[selectedDate],
    });
  };

  return (
    <Card className="mb-4 w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">CPF Income Ceiling by Year</CardTitle>
        <CardDescription>
          Compare income ceilings across different dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <Slider
            value={[dateKeys.indexOf(sliderValue)]}
            onValueChange={handleValueChange}
            min={0}
            max={dateKeys.length - 1}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-sm">
            {dateKeys.map((date) => {
              const isActive = date === sliderValue;
              return (
                <div
                  key={date}
                  className={`text-center transition-colors ${
                    isActive
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className="mb-2">{formatDate(date)}</div>
                  <div
                    className={cn("hidden lg:block", {
                      "font-semibold": isActive,
                    })}
                  >
                    {formatCurrency(CPF_INCOME_CEILING[date])}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CPFYearSlider;
