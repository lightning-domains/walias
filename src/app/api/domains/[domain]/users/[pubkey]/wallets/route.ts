import { NextRequest, NextResponse } from "next/server";
import debug from "debug";
import { UsersService } from "@/services/users";
import { WaliasService } from "@/services/waliases";
const log = debug("app:user-wallets-endpoints");

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string; pubkey: string } }
) {
  try {
    const usersService = new UsersService();
    const waliasService = new WaliasService();

    const { domain, pubkey } = params;

    log("Fetching wallets for pubkey: %s in domain: %s", pubkey, domain);

    const user = await usersService.findUserByPubkey(pubkey);

    if (!user) {
      log("User not found for pubkey: %s", pubkey);
      return NextResponse.json({ reason: "User not found" }, { status: 404 });
    }

    const walias = await waliasService.findWaliasesByDomain(domain, pubkey);

    return NextResponse.json({
      names: walias.map((w) => w.name),
      relays: user.relays,
    });
  } catch (error) {
    log("Error while fetching wallets: %O", error);
    return NextResponse.json(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}
