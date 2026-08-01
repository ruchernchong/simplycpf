import { getLLMText } from "@/app/(docs)/lib/get-llm-text";
import { source } from "@/app/(docs)/lib/source";
import { CACHE_HEADERS } from "@/lib/cache-headers";

export const revalidate = 86400;

export async function GET() {
  const scan = source.getPages().map(getLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"), {
    headers: {
      ...CACHE_HEADERS.policy,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
