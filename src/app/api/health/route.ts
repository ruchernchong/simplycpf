import { NextResponse } from "next/server";

export const GET = async (): Promise<NextResponse> => {
  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
};
