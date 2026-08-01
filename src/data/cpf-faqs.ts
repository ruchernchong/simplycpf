import { formatNumber } from "@/lib/format";
import { CPF_POLICY_CATALOGUE, resolveContributionSchedule } from "@/policy";
import type { FAQ } from "@/types";

const schedule = resolveContributionSchedule(
  CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt,
).schedule;
const firstSchedule = CPF_POLICY_CATALOGUE.contributionSchedules[0];
const wageBands = CPF_POLICY_CATALOGUE.rules.wageBands;
const lifecycle = CPF_POLICY_CATALOGUE.rules.lifecycleAges;
const interest = CPF_POLICY_CATALOGUE.interestRateMethodology;
const extraInterest = CPF_POLICY_CATALOGUE.rules.extraInterest;
const cpfLife = CPF_POLICY_CATALOGUE.cpfLife;
const withdrawals = CPF_POLICY_CATALOGUE.rules.retirementWithdrawals;

if (!firstSchedule) {
  throw new Error("The CPF contribution policy catalogue is empty.");
}

function money(value: number): string {
  return `S$${formatNumber(value)}`;
}

function percentFromBasisPoints(value: number): string {
  return `${(value / 100).toFixed(value % 100 === 0 ? 0 : 1)}%`;
}

export interface FaqJsonLdQuestion {
  "@type": "Question";
  name: string;
  acceptedAnswer: { "@type": "Answer"; text: string };
}

export function buildFaqJsonLdMainEntity(
  faqs: readonly FAQ[],
): FaqJsonLdQuestion[] {
  return faqs.map(({ question, answer }) => ({
    "@type": "Question" as const,
    name: question,
    acceptedAnswer: { "@type": "Answer" as const, text: answer },
  }));
}

const contributionBandSummary = schedule.citizenRates
  .map(
    (band) =>
      `${band.description} (${percentFromBasisPoints(
        band.employeeBasisPoints + band.employerBasisPoints,
      )} total)`,
  )
  .join(", ");
const fullRate = schedule.citizenRates[0];
if (!fullRate) throw new Error("The current CPF contribution rates are empty.");

const currentYear = schedule.effectiveFrom.slice(0, 4);
const lifeReference = cpfLife.reference;

export const faqCalculatorData: FAQ[] = [
  {
    question: "How are CPF contributions calculated?",
    answer: `CPF contributions are resolved from the contribution month, citizenship or PR year, inclusive-upper age band, and wage band. Ordinary Wages are capped at the prevailing monthly OW ceiling. Additional Wages require annual OW and prior-AW context. Total CPF is rounded to the nearest dollar, the employee share has cents dropped, and the employer share is the remainder. Account allocation is calculated MA first, SA or RA second, and OA as the exact remainder. Contribution policy verified ${CPF_POLICY_CATALOGUE.metadata["cpf-contribution-rates"].verifiedAt}.`,
  },
  {
    question: `What is the CPF Ordinary Wage ceiling for ${currentYear}?`,
    answer: `The monthly Ordinary Wage ceiling is ${money(schedule.ordinaryWageCeiling)} under the schedule effective ${schedule.effectiveFrom}. The published timeline begins at ${money(firstSchedule.ordinaryWageCeiling)} in ${firstSchedule.effectiveFrom} and every supported step is available from the ceiling timeline API.`,
  },
  {
    question: `How much do I contribute as an employee aged ${fullRate.description}?`,
    answer: `For Singapore Citizens and PRs from the third year onward in the full-rate wage band above ${money(wageBands.fullRatesAbove)}, the employee rate is ${percentFromBasisPoints(fullRate.employeeBasisPoints)} and the employer rate is ${percentFromBasisPoints(fullRate.employerBasisPoints)}, for ${percentFromBasisPoints(fullRate.employeeBasisPoints + fullRate.employerBasisPoints)} total. Lower wage bands and first- or second-year PRs use different formulas.`,
  },
  {
    question: "Does my age affect my CPF contribution rate?",
    answer: `Yes. The ${currentYear} citizen and third-year-PR schedule has these inclusive-upper bands: ${contributionBandSummary}. A new rate applies only from the month after a threshold birthday. Account allocation has finer bands, and from age ${lifecycle.retirementAccountCreated} the retirement share goes to RA after the SA closure.`,
  },
];

export const faqCpfLifeData: FAQ[] = [
  {
    question: "How much CPF LIFE will I get each month?",
    answer: `Your payout depends on your Retirement Account savings, sex, plan, payout start age and other circumstances. SimplyCPF does not calculate a personalised payout. It reproduces CPF Board's published ${lifeReference.year} ${lifeReference.plan} Plan reference rows for a ${lifeReference.profile} member and links to CPF's personalised planner.`,
  },
  {
    question: "What is the difference between the CPF LIFE plans?",
    answer: `The Standard Plan provides ${cpfLife.plans.standard.payoutPattern}. Escalating Plan payouts ${cpfLife.plans.escalating.payoutPattern} and rise ${cpfLife.plans.escalating.annualIncreasePercent}% each year. Basic Plan payouts ${cpfLife.plans.basic.payoutPattern}, with the documented decline condition below ${money(cpfLife.plans.basic.declineCondition.combinedCpfBalancesBelow)} of combined balances. SimplyCPF does not invent payout ratios.`,
  },
  {
    question: `What happens if I defer my CPF LIFE payout to age ${cpfLife.payoutStart.latestAge}?`,
    answer: `Payouts can start from age ${cpfLife.payoutStart.earliestAge} through ${cpfLife.payoutStart.latestAge}. CPF Board states that payouts can increase by up to ${cpfLife.payoutStart.deferral.maximumIncreasePerYearPercent}% for each year deferred. SimplyCPF shows the exact published reference rows rather than applying that percentage to other balances.`,
  },
  {
    question: "Do I need the Full Retirement Sum to join CPF LIFE?",
    answer: `No. ${money(cpfLife.automaticInclusion.minimumRetirementSavingsAtPayoutStart)} is used in an automatic-inclusion condition for eligible citizens and PRs born from ${cpfLife.automaticInclusion.bornOnOrAfter.slice(0, 4)}; it is not a minimum joining balance or minimum payout balance.`,
  },
];

export const faqProjectionData: FAQ[] = [
  {
    question: `How much CPF will I have at ${lifecycle.cpfLifePayoutEligibility}?`,
    answer:
      "That depends on your starting OA, SA, MA and RA balances, income, age, citizenship status, housing usage, and any top-ups or retirement transfers. SimplyCPF runs a monthly ledger using published CPF policy where available. For unpublished future BHS or retirement sums, it freezes the latest published value and marks each affected year as assumed.",
  },
  {
    question: `What happens to my CPF at age ${lifecycle.retirementAccountCreated}?`,
    answer: `SA closes and savings transfer to RA up to the applicable retirement sum before remaining SA savings move to OA. If RA is still below that sum, OA savings transfer next. SimplyCPF exposes both the FRS route and the property-related BRS route unless account context determines the branch.`,
  },
  {
    question: "How does extra CPF interest work in the projection?",
    answer: `Below age ${lifecycle.retirementAccountCreated}, the projection applies an extra ${extraInterest.below55.extraPercentagePoints}% on the first ${money(extraInterest.below55.balanceCap)} of combined balances, with no more than ${money(extraInterest.ordinaryAccountCap)} from OA. From that age, it applies ${extraInterest.age55AndAbove.firstTier.extraPercentagePoints}% on the first ${money(extraInterest.age55AndAbove.firstTier.balanceCap)} and ${extraInterest.age55AndAbove.secondTier.extraPercentagePoints}% on the next ${money(extraInterest.age55AndAbove.secondTier.balanceCap)}. It follows CPF Board's RA, OA, SA, MA priority order.`,
  },
  {
    question: "Does the projection estimate my CPF LIFE payout?",
    answer: `No. Personalised CPF LIFE payout calculation remains with CPF Board. SimplyCPF returns the published ${lifeReference.year} ${lifeReference.plan} Plan reference table as context and links to CPF's personalised planner; it does not interpolate a payout from your balance.`,
  },
  {
    question: "What can I withdraw from age 55?",
    answer: `Withdrawal rules depend on birth cohort and account history. Under the current rules for members born in ${withdrawals.cohortBornOnOrAfter.slice(0, 4)} or later, ${money(withdrawals.fromAge55.unconditionalAmount)} is unconditionally withdrawable from age 55; excess OA is withdrawable after FRS is set aside. A qualifying completed Singapore property with a lease lasting to at least age ${withdrawals.fromAge55.propertyOption.minimumRemainingLeaseThroughAge} may support withdrawal of eligible RA principal down to BRS. Confirm the personal amount in CPF Board's Retirement Dashboard.`,
  },
];

export const faqData: FAQ[] = [
  {
    question: "How are CPF contributions calculated in Singapore?",
    answer: `The calculator resolves the official schedule for the contribution month and then applies citizenship or PR year, completed age, and the published wage bands: no contribution at or below ${money(wageBands.noContributionAtOrBelow)}, employer-only above that through ${money(wageBands.employerOnlyAtOrBelow)}, a phased employee share through ${money(wageBands.phasedEmployeeShareAtOrBelow)}, and full rates above that. It applies CPF's official rounding and allocation order.`,
  },
  {
    question: "What are the CPF contribution rates by age group?",
    answer: `For the schedule effective ${schedule.effectiveFrom}, citizen and third-year-PR total rates in the full-rate wage band are: ${contributionBandSummary}. Exact employee, employer and allocation rates come directly from the dated policy catalogue.`,
  },
  {
    question: "How does the CPF income ceiling affect my take-home pay?",
    answer: `The monthly OW ceiling changed in published stages from ${money(firstSchedule.ordinaryWageCeiling)} to ${money(schedule.ordinaryWageCeiling)}. For wages above an earlier ceiling, a later increase can raise both employee and employer CPF contributions while reducing take-home pay. The calculator shows both sides using the selected dated schedule.`,
  },
  {
    question: "What is the difference between OA, SA, MA and RA?",
    answer: `Before age ${lifecycle.retirementAccountCreated}, contributions route among OA, SA and MA. From that age after the SA closure, the retirement share routes to RA subject to the FRS rule. The published floor rates are ${interest.ordinaryAccount.floorRate}% for OA and ${interest.specialMediSaveRetirementAccounts.floorRate}% for SA, MA and RA, with quarterly declarations retained separately.`,
  },
  {
    question: "Does SimplyCPF collect any of my data?",
    answer:
      'Inputs stay in your browser. If you select "Store input on this browser", they are stored locally on that browser and are not sent to SimplyCPF servers.',
  },
  {
    question: "Do I need to sign up or log in to use SimplyCPF?",
    answer: "No sign-up or login is required. SimplyCPF is free and ungated.",
  },
  {
    question: "How are CPF interest rates determined?",
    answer: `CPF Board reviews rates ${interest.ordinaryAccount.reviewFrequency}. OA uses the ${interest.ordinaryAccount.peg}, subject to its ${interest.ordinaryAccount.floorRate}% floor. SA, MA and RA use the ${interest.specialMediSaveRetirementAccounts.peg} plus ${interest.specialMediSaveRetirementAccounts.markupPercentagePoints} percentage point, subject to the published floor. SimplyCPF exposes declared quarterly rates and does not reconstruct a monthly SGS series.`,
  },
  {
    question: "What is the difference between a floor rate and pegged rate?",
    answer: `A floor is the minimum applied under the relevant rule. CPF Board compares each documented peg with its applicable floor before declaring the account rate. OA and the SA/MA/RA group use different published methodologies.`,
  },
  {
    question: "Why can SA, MA or RA earn more than the floor?",
    answer: `The declared rate can exceed the ${interest.specialMediSaveRetirementAccounts.floorRate}% floor when the documented 12-month-average SGS peg plus its margin is higher. The official quarterly declaration, not a SimplyCPF-reconstructed yield series, is authoritative.`,
  },
  {
    question:
      "How does the 10-year Singapore Government Securities yield affect CPF?",
    answer: `The SA/MA/RA benchmark uses the ${interest.specialMediSaveRetirementAccounts.peg}, not a single day or month's yield, plus the documented margin. CPF Board then publishes the rate for each quarter.`,
  },
  {
    question: "Is SimplyCPF affiliated with the CPF Board?",
    answer:
      "No. SimplyCPF is independent and is not affiliated with or endorsed by CPF Board, MOM, IRAS, or another government agency. Official policy fields include first-party sources and verification dates; SimplyCPF editorial assumptions are labelled separately.",
  },
  {
    question: "How can a developer contribute?",
    answer:
      "SimplyCPF is open source under the MIT licence. Developers can use the documented APIs or contribute through the public GitHub repository; the OpenAPI contract records current and deprecated fields.",
  },
];
