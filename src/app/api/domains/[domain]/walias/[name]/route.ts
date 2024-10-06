import { NextRequest, NextResponse } from "next/server";
import { WaliasService } from "@/services/waliases";
import { DomainsService } from "@/services/domains";
import { UsersService } from "@/services/users";
import { prisma } from "@/lib/prisma";
import {
  WaliasRegisterSchema,
  WaliasTransferSchema,
} from "@/types/requests/waliases";
import debug from "debug";

const waliasService = new WaliasService(prisma);
const domainsService = new DomainsService(prisma);
const usersService = new UsersService(prisma);
const log = debug("app:walias-endpoints");

// GET: Check walias availability or get public data
export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  try {
    const { domain, name } = params;
    log("Checking walias availability: %s@%s", name, domain);

    const existingWalias = await waliasService.findWaliasByNameAndDomain(
      name,
      domain
    );

    if (existingWalias) {
      return NextResponse.json({
        available: false,
        pubkey: existingWalias.pubkey,
      });
    } else {
      // Here you would implement your pricing logic
      const quote = {
        price: 10000, // Example price in sats
        data: {
          type: "short",
        },
      };

      return NextResponse.json({
        available: true,
        quote,
      });
    }
  } catch (error) {
    log("Error while checking walias availability: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Register new walias
export async function POST(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  try {
    const { domain, name } = params;
    log("Registering new walias: %s@%s", name, domain);

    const body = await req.json();
    const parseResult = WaliasRegisterSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { reason: `Invalid input: ${errorMessages}` },
        { status: 400 }
      );
    }

    const { pubkey } = parseResult.data;

    const existingWalias = await waliasService.findWaliasByNameAndDomain(
      name,
      domain
    );
    if (existingWalias) {
      return NextResponse.json(
        { reason: "Already taken or not available" },
        { status: 409 }
      );
    }

    const domainExists = await domainsService.findDomainById(domain);
    if (!domainExists) {
      return NextResponse.json({ reason: "Domain not found" }, { status: 404 });
    }

    const newWalias = await waliasService.createWalias({
      name,
      domainId: domain,
      pubkey,
    });

    // Ensure user exists
    await usersService.createUser(pubkey);

    return NextResponse.json(
      {
        walias: `${name}@${domain}`,
        pubkey: newWalias.pubkey,
      },
      { status: 201 }
    );
  } catch (error) {
    log("Error while registering walias: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Transfer walias ownership
export async function PUT(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  try {
    const { domain, name } = params;
    const authenticatedPubkey = req.headers.get("x-authenticated-pubkey");

    if (!authenticatedPubkey) {
      return NextResponse.json(
        { reason: "Authentication required" },
        { status: 401 }
      );
    }

    log("Transferring walias ownership: %s@%s", name, domain);

    const body = await req.json();
    const parseResult = WaliasTransferSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { reason: `Invalid input: ${errorMessages}` },
        { status: 400 }
      );
    }

    const { pubkey: newPubkey } = parseResult.data;

    const existingWalias = await waliasService.findWaliasByNameAndDomain(
      name,
      domain
    );
    if (!existingWalias) {
      return NextResponse.json({ reason: "Walias not found" }, { status: 404 });
    }

    if (existingWalias.pubkey !== authenticatedPubkey) {
      return NextResponse.json(
        { reason: "Invalid authentication" },
        { status: 403 }
      );
    }

    const updatedWalias = await waliasService.updateWaliasByNameAndDomain({
      name,
      domainId: domain,
      pubkey: newPubkey,
    });

    // Ensure new user exists
    await usersService.createUser(newPubkey);

    return NextResponse.json({ success: true });
  } catch (error) {
    log("Error while transferring walias ownership: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete walias
export async function DELETE(
  req: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  try {
    const { domain, name } = params;
    const authenticatedPubkey = req.headers.get("x-authenticated-pubkey");

    if (!authenticatedPubkey) {
      return NextResponse.json(
        { reason: "Authentication required" },
        { status: 401 }
      );
    }

    log("Deleting walias: %s@%s", name, domain);

    const existingWalias = await waliasService.findWaliasByNameAndDomain(
      name,
      domain
    );
    if (!existingWalias) {
      return NextResponse.json({ reason: "Walias not found" }, { status: 404 });
    }

    if (existingWalias.pubkey !== authenticatedPubkey) {
      return NextResponse.json(
        { reason: "Invalid authentication" },
        { status: 403 }
      );
    }

    await waliasService.deleteWalias(existingWalias.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    log("Error while deleting walias: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}
