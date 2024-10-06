import { prisma } from "@/lib/prisma";
import { DomainsService } from "@/services/domains";
import { NextRequest, NextResponse } from "next/server";
const domainsService = new DomainsService(prisma);
import crypto from "crypto";

import debug from "debug";
import { DomainRegisterSchema } from "@/types/requests/domains";
import { ErrorResponse } from "@/types/requests/shared";

export type SuccessResponse = {
  domain: string;
  relays: string[];
  adminPubkey: string;
  rootPubkey: string | null;
  verifyUrl?: string;
  verifyContent?: string;
};

const log = debug("app:api:domains:post");

// POST: Register Domain
export async function POST(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    let { domain } = params;
    domain = domain.trim().toLowerCase();

    log("Received request to register domain: %s", domain);

    const body = await req.json();

    // Validate request body with DomainRegisterSchema
    const parseResult = DomainRegisterSchema.safeParse(body);
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

    let { relays, adminPubkey, rootPrivkey } = parseResult.data;

    // Check if domain already exists
    const existingDomain = await domainsService.findDomainById(domain);
    if (existingDomain) {
      if (!existingDomain.verified) {
        const verifyUrl = `https://${domain}/.well-known/${existingDomain.verifyKey}`;
        return NextResponse.json(
          {
            domain: existingDomain.domain,
            relays,
            adminPubkey,
            rootPubkey: existingDomain.rootPubkey,
            verifyUrl,
            verifyContent: existingDomain.verifyKey,
          } as SuccessResponse,
          { status: 201 }
        );
      }
      return NextResponse.json(
        { reason: "Already taken or not available" } as ErrorResponse,
        { status: 409 }
      );
    }
    // Generate root private key if not provided
    if (!rootPrivkey) {
      rootPrivkey = crypto.randomBytes(32).toString("hex");
    }

    // Create domain using service
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
