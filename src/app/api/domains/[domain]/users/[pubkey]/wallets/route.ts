import { NextRequest, NextResponse } from "next/server";
import { WalletsService } from "@/services/wallets";
import { DomainsService } from "@/services/domains";
import { ErrorResponse } from "@/types/requests/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string; pubkey: string } }
) {
  const authenticatedPubkey = request.headers.get("x-authenticated-pubkey");

  if (!authenticatedPubkey || authenticatedPubkey !== params.pubkey) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Unauthorized" },
      { status: 401 }
    );
  }
  const { domain, pubkey } = params;

  const domainsService = new DomainsService();
  const walletsService = new WalletsService();

  const domainDoc = await domainsService.findDomainById(domain);
  if (!domainDoc) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Domain not found" },
      { status: 404 }
    );
  }

  const wallets = await walletsService.findWalletsByPubkey(pubkey);

  return NextResponse.json(wallets);
}
