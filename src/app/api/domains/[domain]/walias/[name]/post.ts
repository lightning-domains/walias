import { NextRequest, NextResponse } from "next/server";
import { WaliasService } from "@/services/waliases";
import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";
import { WaliasCreateSchema } from "@/types/requests/waliases";

const log = debug("app:api:walias:post");

// POST: Create Walias
export async function POST(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  const waliasService = new WaliasService();

  try {
    const { domain, name } = params;
    log("Received request to create walias: %s in domain: %s", name, domain);

    const body = await req.json();

    const parseResult = WaliasCreateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      log(
        "Invalid input for creating walias %s in domain %s: %s",
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

    const newWalias = await waliasService.upsertWalias(name, domain, {
      pubkey,
    });

    log("Successfully created walias: %s in domain: %s", name, domain);
    return NextResponse.json(newWalias, { status: 201 });
  } catch (error) {
    log("Error while creating walias: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
