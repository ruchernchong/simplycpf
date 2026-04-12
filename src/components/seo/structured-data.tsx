import Script from "next/script";
import { useId } from "react";
import type { Graph, Thing, WithContext } from "schema-dts";

interface StructuredDataProps<T extends Thing> {
  data: WithContext<T> | Graph;
}

export const StructuredData = <T extends Thing>({
  data,
}: StructuredDataProps<T>) => {
  return (
    <Script id={useId()} type="application/ld+json">
      {JSON.stringify(data)}
    </Script>
  );
};
