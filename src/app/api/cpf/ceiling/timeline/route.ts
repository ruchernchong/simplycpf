import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { CPF_CONTRIBUTION_SCHEDULES, getPolicyMetadata } from "@/policy";

export const GET = async (): Promise<NextResponse> => {
  const timeline = CPF_CONTRIBUTION_SCHEDULES.map((schedule) => ({
    effectiveFrom: schedule.effectiveFrom,
    effectiveTo: schedule.effectiveTo,
    ordinaryWageCeiling: schedule.ordinaryWageCeiling,
    additionalWageCeiling: schedule.additionalWageCeiling,
    policy: schedule.wageCeilingMetadata,
  }));

  return NextResponse.json(
    {
      timeline,
      policy: getPolicyMetadata("cpf-wage-ceilings", {
        version: "2023-2027",
        effectiveFrom: "2023-01-01",
        effectiveTo: "2027-12-31",
      }),
    },
    {
    status: 200,
      headers: CACHE_HEADERS.policy,
    },
  );
};
