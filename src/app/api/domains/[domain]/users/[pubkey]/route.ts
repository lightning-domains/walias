import { NextRequest, NextResponse } from "next/server";
import { UsersService } from "@/services/users";
import { WaliasService } from "@/services/waliases";
import { prisma } from "@/lib/prisma";
import { UserUpdateSchema } from "@/types/requests/users";
import debug from "debug";

const usersService = new UsersService(prisma);
const waliasService = new WaliasService(prisma);
const log = debug("app:user-endpoints");

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string; pubkey: string } }
) {
  try {
    const { domain, pubkey } = params;

    log("Fetching user data for pubkey: %s in domain: %s", pubkey, domain);

    const user = await usersService.findUserByPubkey(pubkey);
    if (!user) {
      return NextResponse.json({ reason: "User not found" }, { status: 404 });
    }

    const waliases = await waliasService.findWaliasesByPubkeyAndDomain(
      pubkey,
      domain
    );

    return NextResponse.json({
      names: waliases.map((w) => w.name),
      relays: JSON.parse(user.relays),
    });
  } catch (error) {
    log("Error while fetching user data: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { domain: string; pubkey: string } }
) {
  try {
    const { domain, pubkey } = params;
    const authenticatedPubkey = req.headers.get("x-authenticated-pubkey");

    if (!authenticatedPubkey) {
      return NextResponse.json(
        { reason: "Authentication required" },
        { status: 401 }
      );
    }

    if (authenticatedPubkey !== pubkey) {
      return NextResponse.json(
        { reason: "Invalid authentication" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = UserUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { reason: `Invalid input: ${errorMessages}` },
        { status: 400 }
      );
    }

    const { relays } = parseResult.data;

    log("Updating user data for pubkey: %s in domain: %s", pubkey, domain);

    const updatedUser = await usersService.updateUserRelays(pubkey, relays);
    const waliases = await waliasService.findWaliasesByPubkeyAndDomain(
      pubkey,
      domain
    );

    return NextResponse.json({
      names: waliases.map((w) => w.name),
      relays: JSON.parse(updatedUser.relays),
    });
  } catch (error) {
    log("Error while updating user data: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}
