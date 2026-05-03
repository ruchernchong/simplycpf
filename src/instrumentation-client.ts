import { initBotId } from "botid/client/core";
import posthog from "posthog-js";

initBotId({
  protect: [{ path: "/api/resources/cpf-cheat-sheet", method: "GET" }],
});

if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN as string, {
    api_host: "/ph",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}
