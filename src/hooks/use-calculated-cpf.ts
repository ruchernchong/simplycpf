import { useCpfStore } from "@/hooks/use-cpf-store";
import {
  selectContributionResult,
  selectDistributionResults,
  selectHasCpfContribution,
} from "@/stores/selectors";

/**
 * Hook to access calculated CPF results.
 *
 * Returns the computed contribution result, distribution results as an array,
 * and a boolean indicating if there is any CPF contribution.
 *
 * @example
 * ```tsx
 * const { contributionResult, distributionResults, hasCpfContribution } = useCalculatedCpf();
 * ```
 *
 * @returns Object containing contribution result, distribution results, and hasCpfContribution flag
 */
export const useCalculatedCpf = () => {
  const contributionResult = useCpfStore(selectContributionResult);
  const distributionResults = useCpfStore(selectDistributionResults);
  const hasCpfContribution = useCpfStore(selectHasCpfContribution);

  return {
    contributionResult,
    distributionResults,
    hasCpfContribution,
  };
};
