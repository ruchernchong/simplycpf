import type { Metadata } from "next";
import CpfCheckContent from "@/components/check/cpf-check-content";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildPageSchema,
  pageBreadcrumb,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "Five things worth knowing about CPF | SimplyCPF",
  description:
    "Tick what you already know about CPF and we will point you at the screen that explains each of the rest. Nothing is recorded and no email is asked for.",
  keywords:
    "CPF check, CPF knowledge, what happens at 55, accrued interest, CPF LIFE plans, payout eligibility age",
  alternates: {
    canonical: "/cpf-check",
  },
  openGraph: {
    title: "Five things worth knowing about CPF | SimplyCPF",
    description:
      "Tick what you already know about CPF and we will point you at the screen that explains each of the rest.",
    url: `${BASE_URL}/cpf-check`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Five things worth knowing about CPF - SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Five things worth knowing about CPF | SimplyCPF",
    description:
      "Tick what you already know about CPF and we will point you at the screen that explains each of the rest.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const schema = buildGraph([
  buildPageSchema({
    name: "Five things worth knowing about CPF",
    description:
      "A short self-check covering the age 55 account change, accrued interest on housing, the three CPF LIFE plans, retirement versus payout age, and the employer share.",
    url: `${BASE_URL}/cpf-check`,
    speakableSelectors: ["h1"],
    keywords:
      "CPF check, CPF knowledge, accrued interest, CPF LIFE plans, payout eligibility age",
  }),
  pageBreadcrumb("Check", `${BASE_URL}/cpf-check`),
]);

export default function CpfCheckPage() {
  return (
    <>
      <StructuredData data={schema} />
      <CpfCheckContent />
    </>
  );
}
