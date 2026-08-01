import { describe, expect, it } from "vitest";
import {
  buildFaqJsonLdMainEntity,
  faqCalculatorData,
  faqCpfLifeData,
  faqData,
  faqProjectionData,
} from "./cpf-faqs";

function answerFor(
  faqs: ReadonlyArray<{ question: string; answer: string }>,
  questionFragment: string,
): string {
  const faq = faqs.find(({ question }) => question.includes(questionFragment));
  if (!faq) throw new Error(`Missing FAQ containing: ${questionFragment}`);
  return faq.answer;
}

describe("catalogue-generated FAQ and JSON-LD source data", () => {
  it("describes statutory contribution ordering and provenance", () => {
    const answer = answerFor(faqCalculatorData, "calculated");

    expect(answer).toContain("contribution month");
    expect(answer).toContain("employer share is the remainder");
    expect(answer).toContain("policy verified 2026-08-01");
  });

  it("does not present S$60,000 as a minimum CPF LIFE balance", () => {
    const answer = answerFor(faqCpfLifeData, "Full Retirement Sum");

    expect(answer).toContain("automatic-inclusion condition");
    expect(answer).toContain("not a minimum joining balance");
  });

  it("labels unpublished projection policy and personalised payouts", () => {
    expect(answerFor(faqProjectionData, "How much CPF")).toContain(
      "marks each affected year as assumed",
    );
    expect(answerFor(faqProjectionData, "estimate my CPF LIFE")).toContain(
      "Personalised CPF LIFE payout calculation remains with CPF Board",
    );
  });

  it("keeps SimplyCPF separate from government agencies", () => {
    const answer = answerFor(faqData, "affiliated");

    expect(answer).toContain("not affiliated with or endorsed by CPF Board");
    expect(answer).toContain("SimplyCPF editorial assumptions are labelled");
  });

  it("serialises the exact FAQPage JSON-LD shape used by the pages", () => {
    const mainEntity = buildFaqJsonLdMainEntity(faqCpfLifeData);
    const serialised = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity,
    });
    const parsed = JSON.parse(serialised);

    expect({
      context: parsed["@context"],
      type: parsed["@type"],
      count: parsed.mainEntity.length,
      questionTypes: [
        ...new Set(
          parsed.mainEntity.map(
            (question: { "@type": string }) => question["@type"],
          ),
        ),
      ],
      answerTypes: [
        ...new Set(
          parsed.mainEntity.map(
            (question: { acceptedAnswer: { "@type": string } }) =>
              question.acceptedAnswer["@type"],
          ),
        ),
      ],
    }).toMatchInlineSnapshot(`
      {
        "answerTypes": [
          "Answer",
        ],
        "context": "https://schema.org",
        "count": 4,
        "questionTypes": [
          "Question",
        ],
        "type": "FAQPage",
      }
    `);
    expect(serialised).toContain("not a minimum joining balance");
  });
});
