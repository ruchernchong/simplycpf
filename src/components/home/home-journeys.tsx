"use client";

import { Button, Link } from "@heroui/react";
import { ArrowRight, House, TrendingUp, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { selectFormStep } from "@/stores/selectors";

export function HomeJourneys(): ReactElement {
  const router = useRouter();
  const settings = useCpfStore((state) => state.settings);
  const formStep = useCpfStore(selectFormStep);

  function exploreRetirement(): void {
    if (formStep < 2) {
      router.push("/projection");
      return;
    }
    const params = new URLSearchParams({
      income: String(settings.monthlyGrossIncome),
      birthDate: settings.birthDate,
      citizenship: settings.citizenshipStatus,
    });
    router.push(`/projection?${params.toString()}`);
  }

  return (
    <section
      className="home-journeys flex flex-col gap-6 border-border border-t py-6"
      aria-labelledby="journeys-title"
    >
      <h2 id="journeys-title" className="font-semibold text-2xl tracking-tight">
        What would you like to understand next?
      </h2>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1.7fr]">
        <div className="flex items-start gap-4">
          <Wallet
            aria-hidden
            className="size-8 shrink-0 text-accent"
            strokeWidth={1.5}
          />
          <div className="flex flex-1 flex-col gap-2">
            <Link href="/calculator">
              Your pay <ArrowRight aria-hidden className="size-4" />
            </Link>
            <p className="text-muted text-sm">
              See the full contribution breakdown
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 lg:border-border lg:border-l lg:pl-8">
          <House
            aria-hidden
            className="size-8 shrink-0 text-accent"
            strokeWidth={1.5}
          />
          <div className="flex flex-1 flex-col gap-2">
            <Link href="/accrued-interest">
              Your home <ArrowRight aria-hidden className="size-4" />
            </Link>
            <p className="text-muted text-sm">Explore what using OA changes</p>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-4 lg:border-border lg:border-l lg:pl-8">
          <TrendingUp
            aria-hidden
            className="size-8 shrink-0 text-accent"
            strokeWidth={1.5}
          />
          <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="font-medium">Your retirement</span>
              <p className="text-muted text-sm">See how your CPF could grow</p>
            </div>
            <Button className="w-fit" onPress={exploreRetirement}>
              Explore my retirement{" "}
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
