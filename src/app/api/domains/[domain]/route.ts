import { NextRequest, NextResponse } from "next/server";
import { DomainsService } from "@/services/domains";
import { prisma } from "@/lib/prisma";
import { DomainRegisterSchema } from "@/types/requests/domains";
import debug from "debug";

const domainsService = new DomainsService(prisma);
const log = debug("app:register-domain");

export type SuccessResponse = {
  domain: string;
  relays: string[];
  adminPubkey: string;
  rootPubkey: string | null;
  verifyUrl: string;
  verifyContent: string;
};

export type ErrorResponse = {
  reason: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    let { domain } = params;
    domain = domain.trim().toLowerCase();

    log("Received request to register domain: %s", domain);

    const body = await req.json();

    // Validate request body with zod
    const parseResult = DomainRegisterSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      log("Invalid input for domain %s: %s", domain, errorMessages);
      return NextResponse.json(
        { reason: `Invalid input: ${errorMessages}` } as ErrorResponse,
        {
          status: 400,
        }
      );
    }

    const { relays, adminPubkey, rootPrivkey } = parseResult.data;

    // Create domain using service
    log("Creating domain: %s", domain);
    const newDomain = await domainsService.createDomain({
      id: domain,
      relays,
      adminPubkey,
      rootPrivkey,
    });

    log("Successfully created domain: %s", domain);
    return NextResponse.json(newDomain as SuccessResponse, { status: 201 });
  } catch (error) {
    log("Error while registering domain: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" } as ErrorResponse,
      { status: 500 }
    );
  }
}
