"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface OnThisPageNavProps {
  items: { id: string; title: string }[];
}

export default function OnThisPageNav({ items }: OnThisPageNavProps) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="flex flex-col gap-1">
      {items.map(({ id, title }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={() => setActive(id)}
          className={cn(
            "rounded-md px-2 py-1 text-[13px] transition-colors",
            active === id
              ? "bg-accent/10 font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {title}
        </a>
      ))}
    </nav>
  );
}
