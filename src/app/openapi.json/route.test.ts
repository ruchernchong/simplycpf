import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /openapi.json", () => {
  it("publishes the API v2 contract in the requested OpenAPI 2.0 dialect", async () => {
    const response = GET();
    const document = await response.json();

    expect(document.swagger).toBe("2.0");
    expect(document.info.version).toBe("2.0.0");
    expect(document.paths).toHaveProperty("/calculate");
    expect(document.paths).toHaveProperty("/projection");
    expect(document.definitions).toHaveProperty("PolicyMetadata");
    const investmentBody =
      document.paths["/investment-comparison"].post.parameters[0].schema;
    expect(investmentBody.properties.years.maximum).toBe(50);
    expect(investmentBody.properties.scenarios.maxItems).toBe(10);
    expect({
      swagger: document.swagger,
      version: document.info.version,
      basePath: document.basePath,
      paths: Object.keys(document.paths).sort(),
      definitions: Object.keys(document.definitions).sort(),
    }).toMatchInlineSnapshot(`
      {
        "basePath": "/api/cpf",
        "definitions": [
          "AccountBalances",
          "AdditionalWageCeilingContext",
          "AgeConversionResponse",
          "AgeGroup",
          "AgeGroupLookupResponse",
          "AgePolicyMetadata",
          "AgeRetirementRouting",
          "AllocationRate",
          "BhsCollectionResponse",
          "BhsResponse",
          "Citizenship",
          "ContributionAllocationBranch",
          "ContributionInput",
          "ContributionInputByAge",
          "ContributionResult",
          "ContributionRouting",
          "ContributionRoutingBranches",
          "CpfLifeReference",
          "Error",
          "InterestRateMethodology",
          "InterestRatesResponse",
          "InterestTrendResponse",
          "LegacyContributionInput",
          "LegacyContributionInputByAge",
          "LegacyProjectionInput",
          "MoneyDistribution",
          "PolicyMetadata",
          "PolicySource",
          "ProjectionAdditionalWage",
          "ProjectionAdditionalWageCeilingContext",
          "ProjectionAdditionalWageWithRemainingCeiling",
          "ProjectionCompatibilityInput",
          "ProjectionInput",
          "ProjectionRemainingAdditionalWageCeilingContext",
          "ProjectionResult",
          "ProjectionStartAgeCompatibilityInput",
          "QuarterlyInterestDeclaration",
          "QuarterlyInterestObservation",
          "RetirementSumsCollectionResponse",
          "RetirementSumsResponse",
          "ScheduleSummary",
          "WageCeilingResponse",
          "WageCeilingTimelineItem",
        ],
        "paths": [
          "/age-group/find",
          "/age-groups",
          "/age/from-birthdate",
          "/bhs",
          "/calculate",
          "/calculate/batch",
          "/ceiling",
          "/ceiling/timeline",
          "/interest-rates",
          "/interest-rates/smra",
          "/interest-rates/trend",
          "/investment-comparison",
          "/projection",
          "/retirement-sums",
        ],
        "swagger": "2.0",
        "version": "2.0.0",
      }
    `);
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
    expect(response.headers.get("cache-control")).not.toContain("immutable");
  });

  it("uses enforceable canonical schemas and separately typed compatibility envelopes", async () => {
    const response = GET();
    const document = await response.json();
    const definitions = document.definitions;

    expect(JSON.stringify(document)).not.toContain('"x-anyOf"');
    expect(JSON.stringify(document)).not.toContain('"x-oneOf"');

    expect(definitions.ContributionInput.required).toEqual([
      "contributionMonth",
      "ordinaryWages",
      "citizenship",
      "birthMonth",
    ]);
    expect(definitions.ContributionInputByAge.required).toEqual([
      "contributionMonth",
      "ordinaryWages",
      "citizenship",
      "age",
    ]);
    expect(definitions.LegacyContributionInput.required).toEqual([
      "date",
      "income",
      "citizenship",
      "birthMonth",
    ]);
    expect(definitions.LegacyContributionInputByAge.required).toEqual([
      "date",
      "income",
      "citizenship",
      "age",
    ]);

    expect(definitions.ProjectionInput.required).toEqual([
      "monthlyIncome",
      "birthDate",
      "startMonth",
      "initialBalances",
      "citizenship",
    ]);
    expect(definitions.ProjectionCompatibilityInput.required).toEqual([
      "monthlyIncome",
      "birthDate",
      "citizenship",
    ]);
    expect(definitions.ProjectionStartAgeCompatibilityInput.required).toEqual([
      "monthlyIncome",
      "startAge",
      "citizenship",
    ]);
    expect(definitions.LegacyProjectionInput.required).toEqual([
      "income",
      "age",
      "years",
    ]);

    expect(definitions.ProjectionAdditionalWageCeilingContext.required).toEqual(
      ["annualOrdinaryWagesSubjectToCpf", "priorAdditionalWagesSubjectToCpf"],
    );
    expect(
      definitions.ProjectionRemainingAdditionalWageCeilingContext.properties
        .remainingAdditionalWageCeiling.maximum,
    ).toBeUndefined();

    expect(definitions.ContributionResult.properties.routing.$ref).toBe(
      "#/definitions/ContributionRouting",
    );
    expect(definitions.ContributionRouting.properties.branches.$ref).toBe(
      "#/definitions/ContributionRoutingBranches",
    );
    expect(
      definitions.ContributionRoutingBranches.properties.beforeFullRetirementSum
        .$ref,
    ).toBe("#/definitions/ContributionAllocationBranch");
    expect(definitions.ContributionAllocationBranch.required).toEqual([
      "OA",
      "RA",
      "MA",
    ]);
  });
});
