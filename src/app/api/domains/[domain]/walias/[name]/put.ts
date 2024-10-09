import { NextRequest, NextResponse } from "next/server";
import { WaliasService } from "@/services/waliases";
import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";
import { WaliasUpdateSchema } from "@/types/requests/waliases";

const log = debug("app:api:walias:put");

// PUT: Update Walias
export async function PUT(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  const waliasService = new WaliasService();

  try {
    const { domain, name } = params;
    log("Received request to update walias: %s in domain: %s", name, domain);

    const body = await req.json();

    const parseResult = WaliasUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      log(
        "Invalid input for walias %s in domain %s: %s",
        name,
        domain,
        errorMessages
      );
      return NextResponse.json(
        { reason: `Invalid input: ${errorMessages}` } as ErrorResponse,
        { status: 400 }
      );
    }

    const { pubkey } = parseResult.data;

    const updatedWalias = await waliasService.upsertWalias(name, domain, {
      pubkey,
    });

    log("Successfully updated walias: %s in domain: %s", name, domain);
    return NextResponse.json(updatedWalias);
  } catch (error) {
    log("Error while updating walias: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
