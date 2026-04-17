"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CheatSheetSignupProps {
  sourceRoute: string;
}

function getCaptureContext() {
  const searchParams = new URLSearchParams(window.location.search);

  return {
    referrer: window.location.href,
    utmSource: searchParams.get("utm_source") ?? undefined,
    utmMedium: searchParams.get("utm_medium") ?? undefined,
    utmCampaign: searchParams.get("utm_campaign") ?? undefined,
    utmContent: searchParams.get("utm_content") ?? undefined,
  };
}

export default function CheatSheetSignup({
  sourceRoute,
}: CheatSheetSignupProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          asset: "cheat_sheet",
          sourceRoute,
          ...getCaptureContext(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send cheat sheet email");
      }

      setIsSent(true);
      setEmail("");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to send cheat sheet email",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
        <p className="mb-2 font-semibold text-foreground">Cheat sheet sent</p>
        <p className="text-muted-foreground text-sm">
          Check your inbox for the SimplyCPF cheat sheet. The core tools remain
          usable without sign-up.
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cheat-sheet-email">Email address</Label>
        <Input
          id="cheat-sheet-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <p className="text-muted-foreground text-sm">
        We will only use your email to send this cheat sheet.
      </p>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Email me the cheat sheet"}
      </Button>
    </form>
  );
}
