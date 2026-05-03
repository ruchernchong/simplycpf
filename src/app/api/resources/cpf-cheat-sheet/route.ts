import { renderToBuffer } from "@react-pdf/renderer";
import { checkBotId } from "botid/server";
import React from "react";
import { CpfCheatSheetPdf } from "@/components/pdf/cpf-cheat-sheet-pdf";
import { CACHE_HEADERS } from "@/lib/cache-headers";

export async function GET(): Promise<Response> {
  const { isBot } = await checkBotId();

  if (isBot) {
    return Response.json({ error: "Bot traffic blocked" }, { status: 403 });
  }

  const buffer = await renderToBuffer(React.createElement(CpfCheatSheetPdf));

  return new Response(new Uint8Array(buffer), {
    headers: {
      ...CACHE_HEADERS.immutable,
      "Content-Disposition":
        'attachment; filename="simplycpf-cpf-cheat-sheet.pdf"',
      "Content-Type": "application/pdf",
    },
  });
}
