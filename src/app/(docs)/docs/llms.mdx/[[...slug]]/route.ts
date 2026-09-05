import { getLLMText } from "@/app/(docs)/lib/get-llm-text";
import { source } from "@/app/(docs)/lib/source";
import { markdownNotFound, markdownResponse } from "@/lib/markdown-response";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/docs/llms.mdx/[[...slug]]">,
) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) return markdownNotFound();

  return markdownResponse(await getLLMText(page));
}

export function generateStaticParams() {
  return source.generateParams();
}
