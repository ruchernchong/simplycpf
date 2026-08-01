import { Typography } from "@heroui/react";

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
export function StatBand({ items }: StatBandProps) {
  return (
    <section className="border-border border-t bg-band">
      <dl className="container mx-auto grid grid-cols-2 gap-8 px-4 py-6 md:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <dt>
              <Typography color="muted" type="body-xs" weight="semibold">
                {item.label}
              </Typography>
            </dt>
            <dd className="flex flex-col">
              <Typography type="h4">{item.value}</Typography>
              {item.note && (
                <Typography color="muted" type="body-xs">
                  {item.note}
                </Typography>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
