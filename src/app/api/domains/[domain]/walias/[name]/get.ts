import { NextRequest, NextResponse } from "next/server";
import { WaliasService } from "@/services/waliases";
import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";

const log = debug("app:api:walias:get");

// GET: Retrieve Walias
export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  try {
    const waliasService = new WaliasService();
    const { domain, name } = params;
    log("Received request to retrieve walias: %s in domain: %s", name, domain);

    const walias = await waliasService.findWaliasByName(name, domain);
    if (!walias) {
      return NextResponse.json(
        { reason: "Walias not found" } as ErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(walias);
  } catch (error) {
    log("Error while retrieving walias: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
