/**
 * Retirement Account balance at which a member born in 1958 or later is
 * automatically included in CPF LIFE when their payouts begin.
 *
 * This is not the Basic Retirement Sum. The BRS is the amount set aside for a
 * given payout level; this is the threshold for joining the scheme at all.
 *
 * https://www.cpf.gov.sg/member/retirement-income/monthly-payouts/cpf-life
 */
export const CPF_LIFE_AUTO_INCLUSION_BALANCE = 60_000;

/** Earliest age monthly payouts can begin. */
export const CPF_LIFE_PAYOUT_ELIGIBILITY_AGE = 65;

/**
 * Latest age payouts can be deferred to. With no instruction from the member,
 * payouts start automatically at this age on the Standard Plan.
 */
export const CPF_LIFE_LATEST_PAYOUT_AGE = 70;
