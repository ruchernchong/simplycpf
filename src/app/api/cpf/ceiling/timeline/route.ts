import { NextResponse } from "next/server";
import { CACHE_HEADERS } from "@/lib/cache-headers";
import { CPF_CONTRIBUTION_SCHEDULES, getPolicyMetadata } from "@/policy";

export const GET = async (): Promise<NextResponse> => {
  const firstSchedule = CPF_CONTRIBUTION_SCHEDULES[0];
  const lastSchedule = CPF_CONTRIBUTION_SCHEDULES.at(-1);
  if (!firstSchedule || !lastSchedule) {
    throw new Error("The CPF contribution policy catalogue is empty.");
  }

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
        version: `${firstSchedule.effectiveFrom.slice(0, 4)}-${lastSchedule.effectiveTo.slice(0, 4)}`,
        effectiveFrom: firstSchedule.effectiveFrom,
        effectiveTo: lastSchedule.effectiveTo,
      }),
    },
    {
      status: 200,
      headers: CACHE_HEADERS.policy,
    },
  );
};
