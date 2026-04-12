"use client";

import { Link02Icon, Share01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { latestIncomeCeilingDateAtom } from "@/atoms/income-ceiling-atom";
import { settingsAtom } from "@/atoms/setting-atom";
import { Button } from "@/components/ui/button";
import { EVENT, trackTypedEvent } from "@/lib/analytics";

export function ShareResults() {
  const [copied, setCopied] = useState(false);
  const { monthlyGrossIncome, birthDate } = useAtomValue(settingsAtom);
  const ceilingDate = useAtomValue(latestIncomeCeilingDateAtom);

  const shareUrl =
    typeof globalThis !== "undefined" && globalThis.window
      ? `${globalThis.window.location.origin}/calculator?income=${monthlyGrossIncome}&dob=${birthDate}&ceiling=${ceilingDate}`
      : "";

  const shareText = `My CPF contribution at $${monthlyGrossIncome.toLocaleString()}/month — calculate yours at SimplyCPF!`;

  const handleCopyLink = async () => {
    trackTypedEvent(EVENT.SHARE_CLICK_LINK, {});
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      await navigator.clipboard.writeText(shareUrl);
      textarea.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      handleCopyLink();
      return;
    }
    trackTypedEvent(EVENT.SHARE_CLICK_NATIVE, {});
    try {
      await navigator.share({
        title: "SimplyCPF — CPF Contribution Calculator",
        text: shareText,
        url: shareUrl,
      });
    } catch {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    trackTypedEvent(EVENT.SHARE_CLICK_WHATSAPP, {});
    const encoded = encodeURIComponent(`${shareText} ${shareUrl}`);
    globalThis.window?.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handleTelegram = () => {
    trackTypedEvent(EVENT.SHARE_CLICK_TELEGRAM, {});
    const encoded = encodeURIComponent(shareUrl);
    globalThis.window?.open(
      `https://t.me/share/url?url=${encoded}&text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  };

  const handleLinkedIn = () => {
    trackTypedEvent(EVENT.SHARE_CLICK_LINKEDIN, {});
    const encodedUrl = encodeURIComponent(shareUrl);
    globalThis.window?.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer,width=600,height=600",
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleCopyLink}
        title="Copy a shareable link with your calculation inputs"
      >
        <HugeiconsIcon icon={Link02Icon} className="size-4" strokeWidth={2} />
        {copied ? "Copied!" : "Copy Link"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleShare}
        title="Share your CPF calculation"
      >
        <HugeiconsIcon icon={Share01Icon} className="size-4" strokeWidth={2} />
        Share
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLinkedIn}
        title="Share via LinkedIn"
      >
        <span className="text-sm">LinkedIn</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsApp}
        title="Share via WhatsApp"
      >
        <span className="text-sm">WhatsApp</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleTelegram}
        title="Share via Telegram"
      >
        <span className="text-sm">Telegram</span>
      </Button>
    </div>
  );
}
