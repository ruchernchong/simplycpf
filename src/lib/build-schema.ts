import type { Graph, Thing, WithContext } from "schema-dts";
import { BASE_URL } from "@/config";

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

export function buildFAQPage(faqs: FAQItem[]) {
  return {
    "@type": "FAQPage" as const,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question" as const,
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: faq.answer,
      },
    })),
  };
}

interface WebApplicationParams {
  name: string;
  url: string;
  featureList?: string[];
}

export function buildWebApplication({
  name,
  url,
  featureList,
}: WebApplicationParams) {
  return {
    "@type": "SoftwareApplication" as const,
    name,
    url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer" as const,
      price: "0",
      priceCurrency: "SGD",
    },
    ...(featureList && { featureList }),
  };
}

interface DataDownload {
  encodingFormat: string;
  contentUrl: string;
}

interface DatasetParams {
  name: string;
  description: string;
  url: string;
  distributions: DataDownload[];
  variables: string[];
  temporalCoverage?: string;
}

export function buildDataset({
  name,
  description,
  url,
  distributions,
  variables,
  temporalCoverage,
}: DatasetParams) {
  return {
    "@type": "Dataset" as const,
    name,
    description,
    url,
    creator: {
      "@type": "Organization" as const,
      name: "SimplyCPF",
    },
    distribution: distributions.map((d) => ({
      "@type": "DataDownload" as const,
      encodingFormat: d.encodingFormat,
      contentUrl: d.contentUrl,
    })),
    variableMeasured: variables,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    ...(temporalCoverage && { temporalCoverage }),
  };
}

interface HowToStep {
  name: string;
  text: string;
}

export function buildHowTo(
  name: string,
  description: string,
  steps: HowToStep[],
) {
  return {
    "@type": "HowTo" as const,
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep" as const,
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function buildSpeakable(cssSelectors: string[]) {
  return {
    "@type": "SpeakableSpecification" as const,
    cssSelector: cssSelectors,
  };
}

export function buildPageSchema(params: {
  name: string;
  description: string;
  url: string;
  speakableSelectors?: string[];
  keywords?: string;
}) {
  return {
    "@type": "WebPage" as const,
    name: params.name,
    description: params.description,
    url: params.url,
    inLanguage: "en-SG",
    ...(params.speakableSelectors && {
      speakable: buildSpeakable(params.speakableSelectors),
    }),
    ...(params.keywords && { keywords: params.keywords }),
  };
}

export function buildGraph(items: Thing[]): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": items as WithContext<Thing>[],
  };
}

export function homeBreadcrumb() {
  return buildBreadcrumbList([{ name: "Home", url: BASE_URL }]);
}

export function pageBreadcrumb(name: string, url: string) {
  return buildBreadcrumbList([
    { name: "Home", url: BASE_URL },
    { name, url },
  ]);
}
