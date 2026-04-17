import type { Metadata } from "next";
import CpfLifeContent from "@/components/cpf-life/cpf-life-content";
import { StructuredData } from "@/components/seo/structured-data";
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
    speakableSelectors: ["h1", "[data-cpf-life-intro]"],
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
        <div className="text-center">
          <h1 className="mb-4 font-bold text-3xl text-foreground tracking-tight md:text-4xl">
            How Much CPF LIFE Could You Get?
          </h1>
          <p
            data-cpf-life-intro
            className="mx-auto max-w-3xl text-muted-foreground"
          >
            Estimate your monthly CPF LIFE payout from your Retirement Account
            balance and compare the Standard, Escalating, Basic, and defer-to-70
            scenarios without logging in.
          </p>
        </div>
        <CpfLifeContent />
      </div>
    </>
  );
}
