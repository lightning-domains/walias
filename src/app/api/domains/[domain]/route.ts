import { NextRequest, NextResponse } from "next/server";
import { DomainsService } from "@/services/domains";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import {
  DomainRegisterSchema,
  DomainUpdateSchema,
} from "@/types/requests/domains";
import { getPublicKey } from "nostr-tools";
import debug from "debug";

const domainsService = new DomainsService(prisma);
const log = debug("app:domain-endpoints");

export type SuccessResponse = {
  domain: string;
  relays: string[];
  adminPubkey: string;
  rootPubkey: string | null;
  verifyUrl?: string;
  verifyContent?: string;
};

export type ErrorResponse = {
  reason: string;
};

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

// PUT: Update Domain
export async function PUT(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
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

// DELETE: Delete Domain
export async function DELETE(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
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
