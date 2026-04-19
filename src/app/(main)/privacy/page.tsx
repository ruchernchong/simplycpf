import type { Metadata } from "next";
import type { Graph } from "schema-dts";
import { StructuredData } from "@/components/seo/structured-data";
import { BASE_URL } from "@/config";
import {
  buildGraph,
  buildPageSchema,
  pageBreadcrumb,
} from "@/lib/build-schema";

const PRIVACY_DESCRIPTION =
  "SimplyCPF works without signing up. No account, no email, no backend database. Only anonymous usage analytics and a theme preference cookie.";

export const metadata: Metadata = {
  title: "Privacy | SimplyCPF",
  description: PRIVACY_DESCRIPTION,
  alternates: {
    canonical: "/privacy",
  },
};

const schema: Graph = buildGraph([
  buildPageSchema({
    name: "Privacy",
    description: PRIVACY_DESCRIPTION,
    url: `${BASE_URL}/privacy`,
    speakableSelectors: ["h1", "[data-privacy-summary]"],
  }),
  pageBreadcrumb("Privacy", `${BASE_URL}/privacy`),
]);

interface PolicyItem {
  title: string;
  body: string;
}

const POLICIES: PolicyItem[] = [
  {
    title: "Information We Collect",
    body: "The core calculations work entirely in your browser — your income, age, and all calculation inputs stay on your device. We only collect your email address when you explicitly request a CPF cheat sheet or readiness report.",
  },
  {
    title: "How We Use Information",
    body: "Email addresses are used solely to send the requested resource. We do not sell or share your data with third parties. We do not send marketing emails unless you opt in separately.",
  },
  {
    title: "Analytics",
    body: "We use privacy-respecting analytics to understand how the tool is used. No personal identifiers are collected, and your IP address is not stored.",
  },
  {
    title: "Your Rights",
    body: "You can request deletion of your email address from our mailing list at any time. Contact us via the GitHub repository for any privacy-related concerns.",
  },
  {
    title: "Data Retention",
    body: "If you provide an email address to receive a requested resource, it is retained only as needed to deliver that resource and manage related opt-outs. You may request deletion at any time.",
  },
  {
    title: "Cookies and Local Storage",
    body: "SimplyCPF only uses local storage to preserve your preferences and improve usability. These settings stay in your browser and can be cleared through browser controls.",
  },
  {
    title: "Third-Party Services",
    body: "Where third-party services are used (for example, hosting or privacy-focused analytics), they are selected to support service operation. SimplyCPF does not sell personal data to third parties.",
  },
  {
    title: "Changes to This Policy",
    body: "This policy may be updated when product functionality, legal requirements, or data practices change. The effective date at the top of this page will reflect the latest revision.",
  },
  {
    title: "Contact",
    body: "For privacy questions or deletion requests, contact the SimplyCPF maintainers through the project GitHub repository.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <StructuredData data={schema} />
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <h1 className="font-bold text-[24px] text-foreground tracking-tight">
            Privacy Policy (SimplyCPF)
          </h1>
          <p data-privacy-summary className="text-[12px] text-muted-foreground">
            Effective date: 18 April 2026
          </p>
          <p className="text-[13px] text-muted-foreground leading-[1.55]">
            This page explains what SimplyCPF handles, how it is used, and the
            choices available to you.
          </p>
        </header>

        <ol className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 shadow-sm">
          {POLICIES.map(({ title, body }, index) => (
            <li key={title} className="flex flex-col gap-1">
              <h2 className="font-semibold text-[14px] text-foreground">
                {index + 1}. {title}
              </h2>
              <p className="text-[13px] text-muted-foreground leading-[1.55]">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
