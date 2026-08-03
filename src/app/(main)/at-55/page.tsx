import type { Metadata } from "next";
import At55Content from "@/components/at-55/at-55-content";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildPageSchema,
  pageBreadcrumb,
} from "@/lib/build-schema";

export const metadata: Metadata = {
  title: "What happens to your CPF at 55 | SimplyCPF",
  description:
    "Your Special Account closes at 55 and a Retirement Account is created in its place. See where the money goes, in your own projected numbers.",
  keywords:
    "CPF at 55, Special Account closure, Retirement Account, CPF SA closure 2025, Full Retirement Sum, CPF withdrawal at 55",
  alternates: {
    canonical: "/at-55",
  },
  openGraph: {
    title: "What happens to your CPF at 55 | SimplyCPF",
    description:
      "The Special Account closes at 55 and a Retirement Account is created. See where the money goes, in your own projected numbers.",
    url: `${BASE_URL}/at-55`,
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "What happens to your CPF at 55 - SimplyCPF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What happens to your CPF at 55 | SimplyCPF",
    description:
      "The Special Account closes at 55 and a Retirement Account is created. See where the money goes.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

const schema = buildGraph([
  buildPageSchema({
    name: "What happens to your CPF at 55",
    description:
      "How the Special Account closure at 55 works, how the Retirement Account is filled to the Full Retirement Sum, and what stays in the Ordinary Account.",
    url: `${BASE_URL}/at-55`,
    speakableSelectors: ["h1"],
    keywords:
      "CPF at 55, Special Account closure, Retirement Account, Full Retirement Sum",
  }),
  pageBreadcrumb("At 55", `${BASE_URL}/at-55`),
]);

export default function At55Page() {
  return (
    <>
      <StructuredData data={schema} />
      <At55Content />
    </>
  );
}
