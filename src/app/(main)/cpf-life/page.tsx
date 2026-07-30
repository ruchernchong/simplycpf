import type { Metadata } from "next";
import CpfLifeContent from "@/components/cpf-life/cpf-life-content";
import CpfLifeDefinitionBlock from "@/components/seo/cpf-life-definition-block";
import CpfRetirementSumsBlock from "@/components/seo/cpf-retirement-sums-block";
import { StructuredData } from "@/components/seo/structured-data";
import { PageHeader } from "@/components/shared/section-header";
import { BASE_URL } from "@/config";
import faqCpfLifeData from "@/data/faq-cpf-life.json";
import {
  buildFAQPage,
  buildGraph,
  buildPageSchema,
  buildWebApplication,
  pageBreadcrumb,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "CPF LIFE Estimator | Estimate Your Monthly Payout",
  description:
    "Estimate your CPF LIFE monthly payout using your Retirement Account balance. Compare the Standard, Escalating, Basic, and defer-to-70 scenarios without logging in.",
  keywords:
    "CPF LIFE estimator, CPF LIFE payout calculator, how much CPF LIFE will I get, CPF LIFE Standard plan, CPF LIFE Escalating plan",
  alternates: {
    canonical: "/cpf-life",
  },
  openGraph: {
    title: "CPF LIFE Estimator | Estimate Your Monthly Payout",
    description:
      "Estimate your CPF LIFE monthly payout and compare the different plan types without logging in.",
    url: `${BASE_URL}/cpf-life`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "CPF LIFE Estimator - SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPF LIFE Estimator | Estimate Your Monthly Payout",
    description:
      "Estimate your CPF LIFE monthly payout and compare the different plan types without logging in.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const schema = buildGraph([
  buildPageSchema({
    name: "CPF LIFE Estimator",
    description:
      "Estimate CPF LIFE monthly payouts using your Retirement Account balance and compare the Standard, Escalating, Basic, and defer-to-70 scenarios.",
    url: `${BASE_URL}/cpf-life`,
    speakableSelectors: ["h1"],
    keywords:
      "CPF LIFE estimator, CPF LIFE payout calculator, Standard plan, Escalating plan, Basic plan",
  }),
  pageBreadcrumb("CPF LIFE", `${BASE_URL}/cpf-life`),
  buildFAQPage(faqCpfLifeData),
  buildWebApplication({
    name: "SimplyCPF CPF LIFE Estimator",
    url: `${BASE_URL}/cpf-life`,
    featureList: [
      "Estimate CPF LIFE monthly payouts",
      "Compare Standard, Escalating, and Basic plans",
      "Estimate the effect of deferring payouts to age 70",
    ],
  }),
]);

export default function CpfLifePage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="CPF LIFE"
          title="One balance, three payout shapes"
          lede="The plans differ in shape, not in generosity: the same Retirement Account buys a flat payout, a rising one that starts lower, or a lower one that can fall further. We show all three side by side and rank none of them."
        />
        <CpfLifeContent />
        <CpfLifeDefinitionBlock />
        <CpfRetirementSumsBlock />
      </div>
    </>
  );
}
