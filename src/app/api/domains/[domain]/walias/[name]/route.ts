import { NextRequest, NextResponse } from "next/server";
import { WaliasService } from "@/services/walias";
import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";
import { WaliasUpdateSchema } from "@/types/requests/waliases";

const log = debug("app:api:walias:route");

// GET: Retrieve Walias
export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  const waliasService = new WaliasService();

  try {
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

    const updatedWalias = await waliasService.updateWalias(
      name,
      domain,
      pubkey
    );

    if (!updatedWalias) {
      return NextResponse.json(
        { reason: "Walias not found" } as ErrorResponse,
        { status: 404 }
      );
    }

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

// DELETE: Delete Walias
export async function DELETE(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  const waliasService = new WaliasService();

  try {
    const { domain, name } = params;
    log("Received request to delete walias: %s in domain: %s", name, domain);

    await waliasService.deleteWalias(name, domain);

    log("Successfully deleted walias: %s in domain: %s", name, domain);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    log("Error while deleting walias: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
