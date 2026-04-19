"use client";

import { Bookmark02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { CPF_INCOME_CEILING } from "@/constants";
import { useCpfStore } from "@/hooks/use-cpf-store";
import { formatDate } from "@/lib/format";
import { selectLatestIncomeCeilingDate } from "@/stores/selectors";

export function CeilingChangeReminder() {
  const [bookmarkHint, setBookmarkHint] = useState(false);
  const currentCeilingDate = useCpfStore(selectLatestIncomeCeilingDate);
  const dateKeys = Object.keys(CPF_INCOME_CEILING);
  const currentIndex = dateKeys.indexOf(currentCeilingDate);
  const nextCeilingDate = dateKeys[currentIndex + 1];

  if (!nextCeilingDate) {
    return null;
  }

  const nextCeiling = CPF_INCOME_CEILING[nextCeilingDate];
  const currentCeiling = CPF_INCOME_CEILING[currentCeilingDate];
  const difference = nextCeiling - currentCeiling;

  const handleBookmark = () => {
    setBookmarkHint(true);
    setTimeout(() => setBookmarkHint(false), 3000);
    void navigator.clipboard?.writeText(globalThis.window?.location.href ?? "");
  };

  return (
    <div className="mb-8 rounded-lg border border-accent/20 bg-accent/5 p-4">
      <div className="flex gap-4">
        <HugeiconsIcon
          icon={Bookmark02Icon}
          className="size-5 flex-shrink-0 text-accent"
          strokeWidth={2}
        />
        <div className="flex flex-col gap-2">
          <p className="font-medium text-foreground text-sm">
            Your ceiling changes again on {formatDate(nextCeilingDate)}
          </p>
          <p className="text-muted-foreground text-sm">
            The CPF income ceiling will increase by{" "}
            <span className="font-medium text-foreground">
              ${difference.toLocaleString()}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              ${nextCeiling.toLocaleString()}
            </span>{" "}
            on {formatDate(nextCeilingDate)}. Save this page to recalculate when
            the change takes effect.
          </p>
          <button
            type="button"
            onClick={handleBookmark}
            className="w-fit rounded-md border border-accent/30 bg-accent/10 px-3 py-1.5 font-medium text-accent text-sm transition-colors hover:bg-accent/20"
          >
            {bookmarkHint ? "Link copied!" : "Copy page link"}
          </button>
        </div>
      </div>
    </div>
  );
}
