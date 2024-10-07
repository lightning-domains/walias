import { DomainsService } from "@/services/domains";
import { NextRequest, NextResponse } from "next/server";

import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";
import { DomainUpdateSchema } from "@/types/requests/domains";

export type SuccessResponse = {
  domain: string;
  relays: string[];
  adminPubkey: string;
  rootPubkey: string | null;
  verifyUrl?: string;
  verifyContent?: string;
};

const log = debug("app:api:domains:put");

// PUT: Update Domain
export async function PUT(
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

    log("Received request to update domain: %s by pubkey: %s", domain, pubkey);

    const body = await req.json();
    // Validate request body with DomainUpdateSchema
    const parseResult = DomainUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      log("Validation failed for: %O", parseResult.error);
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      log("Invalid input for domain %s: %s", domain, errorMessages);
      return NextResponse.json(
        { reason: `Invalid input: ${errorMessages}` } as ErrorResponse,
        { status: 400 }
      );
    }

    let { relays, adminPubkey, rootPrivkey } = parseResult.data;

    // Check if domain exists
    const existingDomain = await domainsService.findDomainById(domain);
    if (!existingDomain) {
      return NextResponse.json(
        { reason: "Domain not found" } as ErrorResponse,
        { status: 404 }
      );
    }

    // Check if the pubkey is authorized (must be admin or root)
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

    const updatedDomain = await domainsService.updateDomain(domain, {
      relays,
      adminPubkey,
      rootPrivkey,
    });

    log("Successfully updated domain: %s", domain);
    return NextResponse.json(updatedDomain as SuccessResponse, { status: 200 });
  } catch (error) {
    log("Error while updating domain: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
