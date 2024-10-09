import { NextRequest, NextResponse } from "next/server";
import { WaliasService } from "@/services/waliases";
import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";

const log = debug("app:api:walias:delete");

// DELETE: Delete Walias
export async function DELETE(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  const waliasService = new WaliasService();

  try {
    const { domain, name } = params;
    log("Received request to delete walias: %s in domain: %s", name, domain);

    const existingWalias = await waliasService.findWaliasByName(name, domain);
    if (!existingWalias) {
      return NextResponse.json(
        { reason: "Walias not found" } as ErrorResponse,
        { status: 404 }
      );
    }

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
