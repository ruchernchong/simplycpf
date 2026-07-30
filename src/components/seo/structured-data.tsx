import type { Graph, Thing, WithContext } from "schema-dts";

interface StructuredDataProps<T extends Thing> {
  data: WithContext<T> | Graph;
}

/**
 * Renders a JSON-LD graph into the server-rendered HTML.
 *
 * This deliberately uses a plain <script> rather than next/script: the default
 * `afterInteractive` strategy injects the tag client-side after hydration, so
 * the structured data is absent from the initial HTML and invisible to any
 * crawler that does not execute JavaScript.
 *
 * `<` is escaped so a string inside the payload cannot close the script tag.
 */
export const StructuredData = <T extends Thing>({
  data,
}: StructuredDataProps<T>) => (
  <script
    type="application/ld+json"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: the only way to emit JSON-LD
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);
