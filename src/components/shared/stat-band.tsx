import type { ReactElement } from "react";

export interface StatBandItem {
  label: string;
  value: string;
  note?: string;
}

interface StatBandProps {
  items: StatBandItem[];
}

/**
 * Full-bleed reference strip of headline figures on the band surface:
 * the "numbers are the hero" close to a screen.
 */
export function StatBand({ items }: StatBandProps): ReactElement {
  return (
    <section className="border-border border-t bg-band">
      <dl className="container mx-auto grid grid-cols-2 gap-8 px-4 py-6 md:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-2">
            <dt className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
              {item.label}
            </dt>
            <dd className="flex flex-col">
              <span className="font-semibold text-xl tracking-tight">
                {item.value}
              </span>
              {item.note && (
                <span className="text-muted text-xs">{item.note}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
