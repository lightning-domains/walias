import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  const pubkey = req.headers.get("x-authenticated-pubkey");
  if (!pubkey) {
    return NextResponse.json(
      { reason: "Authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    domain: params.domain,
  });
}
