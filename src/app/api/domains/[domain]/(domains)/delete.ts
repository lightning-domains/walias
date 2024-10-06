import { DomainsService } from "@/services/domains";
import { NextRequest, NextResponse } from "next/server";

import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";

export type SuccessResponse = {
  domain: string;
  relays: string[];
  adminPubkey: string;
  rootPubkey: string | null;
  verifyUrl?: string;
  verifyContent?: string;
};

const log = debug("app:api:domains:delete");

// DELETE: Delete Domain
export async function DELETE(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const domainsService = new DomainsService();

    let { domain } = params;
    domain = domain.trim().toLowerCase();

    const pubkey = req.headers.get("x-authenticated-pubkey");
    if (!pubkey) {
      return NextResponse.json(
        { reason: "Authentication required" } as ErrorResponse,
        { status: 401 }
      );
    }

    log("Received request to delete domain: %s by pubkey: %s", domain, pubkey);

    const existingDomain = await domainsService.findDomainById(domain);
    if (!existingDomain) {
      return NextResponse.json(
        { reason: "Domain not found" } as ErrorResponse,
        { status: 404 }
      );
    }

    if (
      existingDomain.adminPubkey !== pubkey &&
      existingDomain.rootPubkey !== pubkey
    ) {
      return NextResponse.json(
        {
          reason: "Invalid authentication. Must be admin or root",
        } as ErrorResponse,
        { status: 403 }
      );
    }

    await domainsService.deleteDomain(domain);

    log("Successfully deleted domain: %s", domain);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    log("Error while deleting domain: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
