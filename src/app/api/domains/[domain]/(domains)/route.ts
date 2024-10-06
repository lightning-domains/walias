import { NextRequest, NextResponse } from "next/server";
import { DomainsService } from "@/services/domains";
import { WaliasService } from "@/services/walias";
import debug from "debug";
import { ErrorResponse } from "@/types/requests/shared";
import { DomainUpdateSchema } from "@/types/requests/domains";

const log = debug("app:api:domains:route");

// GET: Retrieve Domain
export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  const domainsService = new DomainsService();
  const waliasService = new WaliasService();

  try {
    const { domain } = params;
    log("Received request to retrieve domain: %s", domain);

    const domainData = await domainsService.findDomainById(domain);
    if (!domainData) {
      return NextResponse.json(
        { reason: "Domain not found" } as ErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({ ...domainData });
  } catch (error) {
    log("Error while retrieving domain: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}

// PUT: Update Domain
export async function PUT(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  const domainsService = new DomainsService();

  try {
    const { domain } = params;
    log("Received request to update domain: %s", domain);

    const body = await req.json();

    const parseResult = DomainUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      log("Invalid input for domain %s: %s", domain, errorMessages);
      return NextResponse.json(
        { reason: `Invalid input: ${errorMessages}` } as ErrorResponse,
        { status: 400 }
      );
    }

    const { relays, adminPubkey, rootPrivkey } = parseResult.data;

    const updatedDomain = await domainsService.updateDomain(domain, {
      relays,
      adminPubkey,
      rootPrivkey,
    });

    if (!updatedDomain) {
      return NextResponse.json(
        { reason: "Domain not found" } as ErrorResponse,
        { status: 404 }
      );
    }

    log("Successfully updated domain: %s", domain);
    return NextResponse.json(updatedDomain);
  } catch (error) {
    log("Error while updating domain: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}

// DELETE: Delete Domain
export async function DELETE(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  const domainsService = new DomainsService();

  try {
    const { domain } = params;
    log("Received request to delete domain: %s", domain);

    await domainsService.deleteDomain(domain);

    log("Successfully deleted domain: %s", domain);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    log("Error while deleting domain: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
