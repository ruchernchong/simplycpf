import { markdownNotFound } from "@/lib/markdown-response";

export function GET(): Response {
  return markdownNotFound();
}
