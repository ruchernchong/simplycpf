type GtagCommand = "event" | "consent" | "config" | "js";

declare global {
  interface Window {
    dataLayer: Array<unknown>;
    gtag: (command: GtagCommand, ...args: Array<unknown>) => void;
  }
}

type EventParamValue = string | number | boolean;
type EventParams = Record<string, EventParamValue>;

function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof globalThis === "undefined" || !globalThis.window?.gtag) return;
  globalThis.window.gtag("event", eventName, params);
}

export const EVENT = {
  CALCULATOR_COMPLETE: "calculator_complete",
  PDF_DOWNLOAD_CLICK: "pdf_download_click",
  SHARE_CLICK_WHATSAPP: "share_click_whatsapp",
  SHARE_CLICK_TELEGRAM: "share_click_telegram",
  SHARE_CLICK_LINKEDIN: "share_click_linkedin",
  SHARE_CLICK_LINK: "share_click_link",
  SHARE_CLICK_NATIVE: "share_click_native",
  NAVIGATION_CLICK_CALCULATOR: "navigation_click_calculator",
  NAVIGATION_CLICK_INTEREST_RATES: "navigation_click_interest_rates",
  NAVIGATION_CLICK_INVESTMENTS: "navigation_click_investments",
} as const;

export type EventName = (typeof EVENT)[keyof typeof EVENT];

type CalculatorCompleteParams = {
  [EVENT.CALCULATOR_COMPLETE]: {
    age_bracket: string;
    ceiling_year: string;
    income_bracket: string;
  };
};

type PdfDownloadClickParams = {
  [EVENT.PDF_DOWNLOAD_CLICK]: {
    has_ceiling_comparison: boolean;
  };
};

type NavigationClickParams = {
  [EVENT.NAVIGATION_CLICK_CALCULATOR]: { source: string };
  [EVENT.NAVIGATION_CLICK_INTEREST_RATES]: { source: string };
  [EVENT.NAVIGATION_CLICK_INVESTMENTS]: { source: string };
};

type ShareClickParams = {
  [EVENT.SHARE_CLICK_WHATSAPP]: EventParams;
  [EVENT.SHARE_CLICK_TELEGRAM]: EventParams;
  [EVENT.SHARE_CLICK_LINKEDIN]: EventParams;
  [EVENT.SHARE_CLICK_LINK]: EventParams;
  [EVENT.SHARE_CLICK_NATIVE]: EventParams;
};

type EventParamsMap = CalculatorCompleteParams &
  PdfDownloadClickParams &
  NavigationClickParams &
  ShareClickParams;

export function trackTypedEvent<E extends EventName>(
  eventName: E,
  params: EventParamsMap[E],
): void {
  trackEvent(eventName, params as EventParams);
}

export function getIncomeBracket(income: number): string {
  if (income <= 6000) return "at_or_below_6000";
  if (income <= 6800) return "6000_to_6800";
  return "above_6800";
}

export { trackEvent };
