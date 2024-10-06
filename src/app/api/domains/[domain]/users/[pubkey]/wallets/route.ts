import { NextRequest, NextResponse } from "next/server";
import { WalletsService } from "@/services/wallets";
import { prisma } from "@/lib/prisma";
import debug from "debug";

const walletsService = new WalletsService(prisma);
const log = debug("app:user-wallets-endpoints");

export async function GET(
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

    log("Fetching wallets for pubkey: %s in domain: %s", pubkey, domain);

    const wallets = await walletsService.findWalletsByPubkey(pubkey);

    return NextResponse.json(wallets);
  } catch (error) {
    log("Error while fetching wallets: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}
