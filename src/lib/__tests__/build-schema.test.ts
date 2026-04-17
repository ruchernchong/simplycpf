import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbList,
  buildDataset,
  buildFAQPage,
  buildGraph,
  buildHowTo,
  buildPageSchema,
  buildSpeakable,
  buildWebApplication,
  homeBreadcrumb,
  pageBreadcrumb,
} from "../build-schema";

describe("buildBreadcrumbList", () => {
  it("should build a BreadcrumbList with correct positions", () => {
    const result = buildBreadcrumbList([
      { name: "Home", url: "https://example.com" },
      { name: "Calculator", url: "https://example.com/calculator" },
    ]);

    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(2);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[0].name).toBe("Home");
    expect(result.itemListElement[1].position).toBe(2);
  });
});

describe("buildFAQPage", () => {
  it("should build an FAQPage with questions and answers", () => {
    const result = buildFAQPage([
      { question: "What is CPF?", answer: "Central Provident Fund" },
    ]);

    expect(result["@type"]).toBe("FAQPage");
    expect(result.mainEntity).toHaveLength(1);
    expect(result.mainEntity[0].name).toBe("What is CPF?");
    expect(result.mainEntity[0].acceptedAnswer.text).toBe(
      "Central Provident Fund",
    );
  });
});

describe("buildWebApplication", () => {
  it("should build a SoftwareApplication schema", () => {
    const result = buildWebApplication({
      name: "SimplyCPF",
      url: "https://example.com",
    });

    expect(result["@type"]).toBe("SoftwareApplication");
    expect(result.name).toBe("SimplyCPF");
    expect(result.applicationCategory).toBe("FinanceApplication");
    expect(result.offers.price).toBe("0");
  });

  it("should include featureList when provided", () => {
    const result = buildWebApplication({
      name: "SimplyCPF",
      url: "https://example.com",
      featureList: ["Calculate CPF", "View distribution"],
    });

    expect(result.featureList).toHaveLength(2);
  });

  it("should omit featureList when not provided", () => {
    const result = buildWebApplication({
      name: "SimplyCPF",
      url: "https://example.com",
    });

    expect(result).not.toHaveProperty("featureList");
  });
});

describe("buildDataset", () => {
  it("should build a Dataset with distributions and variables", () => {
    const result = buildDataset({
      name: "CPF Rates",
      description: "Contribution rates dataset",
      url: "https://example.com/api/rates",
      distributions: [
        {
          encodingFormat: "application/json",
          contentUrl: "https://example.com/api/rates",
        },
      ],
      variables: ["Employee rate", "Employer rate"],
    });

    expect(result["@type"]).toBe("Dataset");
    expect(result.name).toBe("CPF Rates");
    expect(result.distribution).toHaveLength(1);
    expect(result.variableMeasured).toHaveLength(2);
    expect(result.isAccessibleForFree).toBe(true);
  });

  it("should include temporalCoverage when provided", () => {
    const result = buildDataset({
      name: "CPF Rates",
      description: "Contribution rates dataset",
      url: "https://example.com/api/rates",
      distributions: [],
      variables: [],
      temporalCoverage: "2023/2026",
    });

    expect(result.temporalCoverage).toBe("2023/2026");
  });

  it("should omit temporalCoverage when not provided", () => {
    const result = buildDataset({
      name: "CPF Rates",
      description: "Contribution rates dataset",
      url: "https://example.com/api/rates",
      distributions: [],
      variables: [],
    });

    expect(result).not.toHaveProperty("temporalCoverage");
  });
});

describe("buildHowTo", () => {
  it("should build a HowTo with steps", () => {
    const result = buildHowTo("How to calculate CPF", "Step by step guide", [
      { name: "Enter income", text: "Enter your monthly income" },
      { name: "Select age", text: "Select your birth date" },
    ]);

    expect(result["@type"]).toBe("HowTo");
    expect(result.step).toHaveLength(2);
    expect(result.step[0].position).toBe(1);
    expect(result.step[1].position).toBe(2);
  });
});

describe("buildSpeakable", () => {
  it("should build a SpeakableSpecification with CSS selectors", () => {
    const result = buildSpeakable(["h1", ".description"]);

    expect(result["@type"]).toBe("SpeakableSpecification");
    expect(result.cssSelector).toEqual(["h1", ".description"]);
  });
});

describe("buildPageSchema", () => {
  it("should build a WebPage schema with required fields", () => {
    const result = buildPageSchema({
      name: "Calculator",
      description: "CPF Calculator page",
      url: "https://example.com/calculator",
    });

    expect(result["@type"]).toBe("WebPage");
    expect(result.name).toBe("Calculator");
    expect(result.inLanguage).toBe("en-SG");
  });

  it("should include speakable when selectors are provided", () => {
    const result = buildPageSchema({
      name: "Calculator",
      description: "CPF Calculator page",
      url: "https://example.com/calculator",
      speakableSelectors: ["h1"],
    });

    expect(result.speakable).toBeDefined();
    expect(result.speakable?.cssSelector).toEqual(["h1"]);
  });

  it("should include keywords when provided", () => {
    const result = buildPageSchema({
      name: "Calculator",
      description: "CPF Calculator page",
      url: "https://example.com/calculator",
      keywords: "CPF, calculator",
    });

    expect(result.keywords).toBe("CPF, calculator");
  });

  it("should include both speakable and keywords when both are provided", () => {
    const result = buildPageSchema({
      name: "Calculator",
      description: "CPF Calculator page",
      url: "https://example.com/calculator",
      speakableSelectors: ["h1"],
      keywords: "CPF, calculator",
    });

    expect(result.speakable).toBeDefined();
    expect(result.speakable?.cssSelector).toEqual(["h1"]);
    expect(result.keywords).toBe("CPF, calculator");
  });

  it("should return plain page when neither speakable nor keywords are provided", () => {
    const result = buildPageSchema({
      name: "Calculator",
      description: "CPF Calculator page",
      url: "https://example.com/calculator",
    });

    expect(result).not.toHaveProperty("speakable");
    expect(result).not.toHaveProperty("keywords");
  });
});

describe("buildGraph", () => {
  it("should build a Graph with multiple items", () => {
    const breadcrumb = buildBreadcrumbList([
      { name: "Home", url: "https://example.com" },
    ]);
    const faq = buildFAQPage([{ question: "Q", answer: "A" }]);

    const result = buildGraph([breadcrumb, faq]);

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@graph"]).toHaveLength(2);
  });
});

describe("homeBreadcrumb", () => {
  it("should return a single-item breadcrumb for the home page", () => {
    const result = homeBreadcrumb();

    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(1);
    expect(result.itemListElement[0].name).toBe("Home");
  });
});

describe("pageBreadcrumb", () => {
  it("should return a two-item breadcrumb for a sub-page", () => {
    const result = pageBreadcrumb(
      "Calculator",
      "https://example.com/calculator",
    );

    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(2);
    expect(result.itemListElement[1].name).toBe("Calculator");
  });
});
