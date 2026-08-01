import { notFound } from "next/navigation";
import { getLLMText } from "@/app/(docs)/lib/get-llm-text";
import { source } from "@/app/(docs)/lib/source";
import { CACHE_HEADERS } from "@/lib/cache-headers";

export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/docs/llms.mdx/[[...slug]]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      ...CACHE_HEADERS.policy,
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

export function generateStaticParams() {
  return source.generateParams();
}
