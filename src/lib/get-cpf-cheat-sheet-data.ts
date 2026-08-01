import { formatNumber } from "@/lib/format";
import type { PolicyMetadata } from "@/policy";
import { CPF_POLICY_CATALOGUE } from "@/policy";

export interface CheatSheetSection {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
  status: "official";
  verifiedAt: string;
  sourceUrls: string[];
}

export interface CheatSheetKeyAge {
  label: string;
  value: string;
  sourceUrl: string;
}

export interface CheatSheetData {
  title: string;
  subtitle: string;
  referenceYear: number;
  effectiveFrom: string;
  catalogueVersion: string;
  scope: string;
  keyAges: CheatSheetKeyAge[];
  sections: CheatSheetSection[];
}

/** ISO modification date for page metadata, derived from section provenance. */
export function getCheatSheetDateModified(data: CheatSheetData): string {
  const latestVerificationDate = data.sections
    .map((section) => section.verifiedAt)
    .sort((left, right) => left.localeCompare(right))
    .at(-1);
  if (!latestVerificationDate) {
    throw new Error("The cheat sheet requires at least one sourced section.");
  }
  return latestVerificationDate;
}

function formatBasisPoints(value: number): string {
  return `${formatDecimal(value / 100)}%`;
}

function formatDecimal(value: number): string {
  return value
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}

function formatCurrency(value: number): string {
  return `S$${formatNumber(value)}`;
}

function sourceUrls(...metadata: PolicyMetadata[]): string[] {
  return [
    ...new Set(
      metadata.flatMap((item) => item.sources.map((source) => source.url)),
    ),
  ];
}

function officialSection(
  section: Omit<CheatSheetSection, "status" | "verifiedAt" | "sourceUrls">,
  ...metadata: PolicyMetadata[]
): CheatSheetSection {
  const primaryMetadata = metadata[0];
  if (!primaryMetadata) {
    throw new Error("Cheat-sheet sections require policy metadata.");
  }
  return {
    ...section,
    status: "official",
    verifiedAt: primaryMetadata.verifiedAt,
    sourceUrls: sourceUrls(...metadata),
  };
}

export function getCpfCheatSheetData(): CheatSheetData {
  const contributionVerifiedAt =
    CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt;
  const currentSchedule = CPF_POLICY_CATALOGUE.contributionSchedules.find(
    (schedule) =>
      contributionVerifiedAt >= schedule.effectiveFrom &&
      contributionVerifiedAt <= schedule.effectiveTo,
  );
  const latestInterest = CPF_POLICY_CATALOGUE.quarterlyInterestRates.at(-1);
  if (!currentSchedule || !latestInterest) {
    throw new Error("The verified CPF policy catalogue is incomplete.");
  }

  const referenceYear = Number(currentSchedule.effectiveFrom.slice(0, 4));
  const rules = CPF_POLICY_CATALOGUE.rules;
  const contributionMetadata = currentSchedule.contributionMetadata;
  const allocationMetadata = currentSchedule.allocationMetadata;
  const wageMetadata = currentSchedule.wageCeilingMetadata;
  const interestMetadata = CPF_POLICY_CATALOGUE.metadata["cpf-interest-rates"];
  const extraInterestMetadata =
    CPF_POLICY_CATALOGUE.metadata["cpf-extra-interest"];
  const retirementMetadata =
    CPF_POLICY_CATALOGUE.metadata["cpf-retirement-sums"];
  const bhsMetadata = CPF_POLICY_CATALOGUE.metadata["cpf-basic-healthcare-sum"];
  const topUpMetadata = CPF_POLICY_CATALOGUE.metadata["cpf-retirement-top-ups"];
  const taxReliefMetadata =
    CPF_POLICY_CATALOGUE.metadata["iras-cpf-cash-top-up-relief"];

  return {
    title: "SimplyCPF CPF Cheat Sheet",
    subtitle: `Official CPF reference data for ${referenceYear}, with published historical and forward tables where available. Product assumptions are excluded.`,
    referenceYear,
    effectiveFrom: currentSchedule.effectiveFrom,
    catalogueVersion: CPF_POLICY_CATALOGUE.version,
    scope:
      contributionMetadata.scope ??
      "Private-sector and non-pensionable employees using default CPF rates.",
    keyAges: [
      {
        label: "RA opens; SA closes",
        value: String(rules.lifecycleAges.retirementAccountCreated),
        sourceUrl: CPF_POLICY_CATALOGUE.sources.specialAccountClosure.url,
      },
      {
        label: `Statutory retirement age from ${rules.statutoryEmploymentAges.effectiveDate}`,
        value: String(rules.statutoryEmploymentAges.retirementAge),
        sourceUrl: CPF_POLICY_CATALOGUE.sources.momRetirementAges.url,
      },
      {
        label: "Statutory re-employment age",
        value: String(rules.statutoryEmploymentAges.reEmploymentAge),
        sourceUrl: CPF_POLICY_CATALOGUE.sources.momRetirementAges.url,
      },
      {
        label: "Earliest CPF LIFE payout start",
        value: String(CPF_POLICY_CATALOGUE.cpfLife.payoutStart.earliestAge),
        sourceUrl: CPF_POLICY_CATALOGUE.sources.cpfLife.url,
      },
      {
        label: "Latest CPF LIFE payout start",
        value: String(CPF_POLICY_CATALOGUE.cpfLife.payoutStart.latestAge),
        sourceUrl: CPF_POLICY_CATALOGUE.sources.cpfLife.url,
      },
    ],
    sections: [
      officialSection(
        {
          title: "CPF Contribution Rates by Age",
          description: `Singapore Citizen and SPR Year 3+ rates effective ${currentSchedule.effectiveFrom}; monthly wages above ${formatCurrency(rules.wageBands.fullRatesAbove)}.`,
          columns: ["Inclusive age band", "Employee", "Employer", "Total"],
          rows: currentSchedule.citizenRates.map((band) => [
            band.description,
            formatBasisPoints(band.employeeBasisPoints),
            formatBasisPoints(band.employerBasisPoints),
            formatBasisPoints(
              band.employeeBasisPoints + band.employerBasisPoints,
            ),
          ]),
        },
        contributionMetadata,
      ),
      officialSection(
        {
          title: "OA / SA or RA / MA Allocation",
          description: `MA is allocated first, SA or RA second, and OA is the exact remainder. From age ${rules.lifecycleAges.retirementAccountCreated} after the SA closure effective ${rules.specialAccountClosure.effectiveDate}, the retirement share goes to RA until FRS, then to OA.`,
          columns: ["Inclusive age band", "OA", "Retirement share", "MA"],
          rows: currentSchedule.allocationRates.map((band) => {
            const retirementAge = rules.lifecycleAges.retirementAccountCreated;
            const straddlesRetirementAge =
              (band.minAgeExclusive ?? 0) < retirementAge &&
              (band.maxAgeInclusive ?? Number.POSITIVE_INFINITY) >=
                retirementAge;
            const retirementAccount = straddlesRetirementAge
              ? `SA below ${retirementAge}; RA at ${retirementAge}`
              : (band.minAgeExclusive ?? 0) >= retirementAge
                ? "RA"
                : "SA";
            return [
              band.description,
              formatBasisPoints(band.oaBasisPoints),
              `${formatBasisPoints(band.retirementBasisPoints)} ${retirementAccount}`,
              formatBasisPoints(band.maBasisPoints),
            ];
          }),
        },
        allocationMetadata,
        CPF_POLICY_CATALOGUE.metadata["cpf-special-account-closure"],
      ),
      officialSection(
        {
          title: "Wage Ceiling Timeline",
          description:
            "Published monthly Ordinary Wage ceilings and the annual Additional Wage ceiling. AW subject to CPF also depends on annual OW and prior AW context.",
          columns: [
            "Effective period",
            "Monthly OW ceiling",
            "Annual AW ceiling",
          ],
          rows: CPF_POLICY_CATALOGUE.contributionSchedules.map((schedule) => [
            `${schedule.effectiveFrom} to ${schedule.effectiveTo}`,
            formatCurrency(schedule.ordinaryWageCeiling),
            formatCurrency(schedule.additionalWageCeiling),
          ]),
        },
        wageMetadata,
      ),
      officialSection(
        {
          title: "PR Graduated Rates: Year 1",
          description:
            "Default Graduated/Graduated rates from the date Singapore Permanent Resident status is obtained.",
          columns: ["Inclusive age band", "Employee", "Employer", "Total"],
          rows: currentSchedule.sprYear1Rates.map((band) => [
            band.description,
            formatBasisPoints(band.employeeBasisPoints),
            formatBasisPoints(band.employerBasisPoints),
            formatBasisPoints(
              band.employeeBasisPoints + band.employerBasisPoints,
            ),
          ]),
        },
        contributionMetadata,
      ),
      officialSection(
        {
          title: "PR Graduated Rates: Year 2",
          description:
            "Default Graduated/Graduated rates from the first day of the month after the first SPR anniversary.",
          columns: ["Inclusive age band", "Employee", "Employer", "Total"],
          rows: currentSchedule.sprYear2Rates.map((band) => [
            band.description,
            formatBasisPoints(band.employeeBasisPoints),
            formatBasisPoints(band.employerBasisPoints),
            formatBasisPoints(
              band.employeeBasisPoints + band.employerBasisPoints,
            ),
          ]),
        },
        contributionMetadata,
      ),
      officialSection(
        {
          title: "CPF Interest Reference",
          description: `Official quarterly declarations, floor rates, and extra-interest tiers. Interest is computed ${rules.interestTransactions.computation} and credited ${rules.interestTransactions.crediting}.`,
          columns: ["Rule", "Published value"],
          rows: [
            [
              `${latestInterest.quarter} declared rates`,
              `OA ${formatDecimal(latestInterest.oa)}%; SA ${formatDecimal(latestInterest.sa)}%; MA ${formatDecimal(latestInterest.ma)}%; RA ${formatDecimal(latestInterest.ra)}% p.a.`,
            ],
            [
              "OA floor rate",
              `${formatDecimal(CPF_POLICY_CATALOGUE.interestRateMethodology.ordinaryAccount.floorRate)}% p.a.`,
            ],
            [
              "SA / MA / RA floor rate",
              `${formatDecimal(CPF_POLICY_CATALOGUE.interestRateMethodology.specialMediSaveRetirementAccounts.floorRate)}% p.a.`,
            ],
            [
              `Below ${rules.lifecycleAges.retirementAccountCreated} extra interest`,
              `+${formatDecimal(rules.extraInterest.below55.extraPercentagePoints)}% on first ${formatCurrency(rules.extraInterest.below55.balanceCap)} combined; OA capped at ${formatCurrency(rules.extraInterest.ordinaryAccountCap)}`,
            ],
            [
              `Age ${rules.lifecycleAges.retirementAccountCreated}+ extra interest`,
              `+${formatDecimal(rules.extraInterest.age55AndAbove.firstTier.extraPercentagePoints)}% on first ${formatCurrency(rules.extraInterest.age55AndAbove.firstTier.balanceCap)} and +${formatDecimal(rules.extraInterest.age55AndAbove.secondTier.extraPercentagePoints)}% on next ${formatCurrency(rules.extraInterest.age55AndAbove.secondTier.balanceCap)}`,
            ],
            [
              "Combined-balance priority",
              rules.extraInterest.accountPriority.join(" → "),
            ],
          ],
        },
        interestMetadata,
        extraInterestMetadata,
      ),
      officialSection(
        {
          title: "Retirement Sums",
          description: `BRS and FRS stay fixed for the cohort turning ${rules.lifecycleAges.retirementAccountCreated} in that year; ERS is the prevailing year's maximum top-up limit.`,
          columns: [
            `Year turning ${rules.lifecycleAges.retirementAccountCreated}`,
            "BRS",
            "FRS",
            "ERS",
          ],
          rows: CPF_POLICY_CATALOGUE.retirementSums.map((row) => [
            String(row.year),
            formatCurrency(row.brs),
            formatCurrency(row.frs),
            formatCurrency(row.ers),
          ]),
        },
        retirementMetadata,
      ),
      officialSection(
        {
          title: "Basic Healthcare Sum",
          description: `Published annual BHS amounts. A member's applicable BHS is frozen in the year they turn ${rules.lifecycleAges.basicHealthcareSumFrozen}.`,
          columns: ["Year", "BHS"],
          rows: CPF_POLICY_CATALOGUE.basicHealthcareSums.map((row) => [
            String(row.year),
            formatCurrency(row.amount),
          ]),
        },
        bhsMetadata,
      ),
      officialSection(
        {
          title: "Retirement Top-Ups and Tax Relief",
          description:
            "Actual top-up capacity and IRAS tax-relief caps are separate. Eligibility conditions and the overall personal-income-tax relief cap still apply.",
          columns: ["Limit or rule", "Published value"],
          rows: [
            [
              "Own-account annual cash top-up relief cap",
              formatCurrency(rules.retirementTopUps.taxRelief.selfAnnualCap),
            ],
            [
              "Family annual cash top-up relief cap",
              formatCurrency(rules.retirementTopUps.taxRelief.familyAnnualCap),
            ],
            [
              "Combined potential annual relief",
              formatCurrency(
                rules.retirementTopUps.taxRelief.combinedAnnualCap,
              ),
            ],
            [
              `Actual retirement top-up capacity below ${rules.lifecycleAges.retirementAccountCreated}`,
              rules.retirementTopUps.actualCapacity.below55Limit,
            ],
            [
              `Actual retirement top-up capacity from ${rules.lifecycleAges.retirementAccountCreated}`,
              rules.retirementTopUps.actualCapacity.from55Limit,
            ],
            [
              "MRSS annual matching grant cap",
              formatCurrency(
                rules.retirementTopUps.matchedRetirementSavingsScheme
                  .annualMatchingGrantCap,
              ),
            ],
            [
              "MRSS lifetime matching grant cap",
              formatCurrency(
                rules.retirementTopUps.matchedRetirementSavingsScheme
                  .lifetimeMatchingGrantCap,
              ),
            ],
          ],
        },
        topUpMetadata,
        taxReliefMetadata,
      ),
    ],
  };
}
