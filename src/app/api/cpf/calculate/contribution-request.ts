import {
  type AdditionalWageCeilingContext,
  type ContributionCitizenship,
  type ContributionInput,
  ContributionPolicyError,
  type ContributionWarning,
} from "@/policy";

interface ParsedContributionRequest {
  input: ContributionInput;
  warnings: ContributionWarning[];
}

export function parseContributionRequest(
  value: unknown,
): ParsedContributionRequest {
  if (!isRecord(value)) {
    throw invalid("Request body must be a JSON object.");
  }

  const usesIncomeAlias = value.ordinaryWages === undefined;
  const ordinaryWages = usesIncomeAlias ? value.income : value.ordinaryWages;
  if (typeof ordinaryWages !== "number") {
    throw invalid("ordinaryWages is required and must be a number.");
  }

  const usesDateAlias = value.contributionMonth === undefined;
  const contributionMonth = usesDateAlias
    ? value.date
    : value.contributionMonth;
  if (typeof contributionMonth !== "string") {
    throw invalid("contributionMonth is required and must be a string.");
  }

  const citizenship = value.citizenship;
  if (
    typeof citizenship !== "string" ||
    !isContributionCitizenship(citizenship)
  ) {
    throw invalid(
      "citizenship must be citizen, spr-year1, spr-year2, or spr-year3-plus.",
    );
  }

  const additionalWages = optionalNumber(
    value.additionalWages,
    "additionalWages",
  );
  const additionalWageCeilingContext = parseAdditionalWageContext(
    value.additionalWageCeilingContext,
  );
  const hasReachedFullRetirementSum = optionalBoolean(
    value.hasReachedFullRetirementSum,
    "hasReachedFullRetirementSum",
  );

  const base = {
    contributionMonth,
    ordinaryWages,
    ...(additionalWages === undefined ? {} : { additionalWages }),
    ...(additionalWageCeilingContext === undefined
      ? {}
      : { additionalWageCeilingContext }),
    citizenship,
    ...(hasReachedFullRetirementSum === undefined
      ? {}
      : { hasReachedFullRetirementSum }),
  };

  const hasAge = value.age !== undefined;
  const hasBirthMonth = value.birthMonth !== undefined;
  if (hasAge === hasBirthMonth) {
    throw invalid("Supply exactly one of age or birthMonth.");
  }

  let input: ContributionInput;
  if (hasAge) {
    if (typeof value.age !== "number") {
      throw invalid("age must be a number.");
    }
    input = { ...base, age: value.age };
  } else {
    if (typeof value.birthMonth !== "string") {
      throw invalid("birthMonth must be a string in YYYY-MM format.");
    }
    input = { ...base, birthMonth: value.birthMonth };
  }

  const warnings: ContributionWarning[] = [];
  if (usesIncomeAlias || usesDateAlias) {
    warnings.push({
      code: "legacy-input",
      message:
        "income and date are deprecated aliases; use ordinaryWages and contributionMonth.",
    });
  }

  return { input, warnings };
}

function parseAdditionalWageContext(
  value: unknown,
): AdditionalWageCeilingContext | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw invalid("additionalWageCeilingContext must be an object.");
  }

  const annualOrdinaryWagesSubjectToCpf = value.annualOrdinaryWagesSubjectToCpf;
  const priorAdditionalWagesSubjectToCpf =
    value.priorAdditionalWagesSubjectToCpf;
  if (
    typeof annualOrdinaryWagesSubjectToCpf !== "number" ||
    typeof priorAdditionalWagesSubjectToCpf !== "number"
  ) {
    throw invalid(
      "additionalWageCeilingContext requires numeric annualOrdinaryWagesSubjectToCpf and priorAdditionalWagesSubjectToCpf.",
    );
  }

  return {
    annualOrdinaryWagesSubjectToCpf,
    priorAdditionalWagesSubjectToCpf,
  };
}

function optionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number") throw invalid(`${field} must be a number.`);
  return value;
}

function optionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw invalid(`${field} must be a boolean.`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContributionCitizenship(
  value: string,
): value is ContributionCitizenship {
  return (
    value === "citizen" ||
    value === "spr-year1" ||
    value === "spr-year2" ||
    value === "spr-year3-plus"
  );
}

function invalid(message: string): ContributionPolicyError {
  return new ContributionPolicyError("INVALID_INPUT", message);
}
