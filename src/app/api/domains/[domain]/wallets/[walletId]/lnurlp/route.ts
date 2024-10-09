import { NextRequest, NextResponse } from "next/server";
import { WalletsService } from "@/services/wallets";
import { DomainsService } from "@/services/domains";
import { ErrorResponse } from "@/types/requests/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string; walletId: string } }
) {
  try {
    const { domain, walletId } = params;

    const domainsService = new DomainsService();
    const walletsService = new WalletsService();

    const domainDoc = await domainsService.findDomainById(domain);
    if (!domainDoc) {
      return NextResponse.json<ErrorResponse>(
        { reason: "Domain not found" },
        { status: 404 }
      );
    }

    throw new Error("Not implemented");
    const lnurlp = await walletsService.getWalletLnurlp(walletId, domain);
    if (!lnurlp) {
      return NextResponse.json<ErrorResponse>(
        { reason: "LNURL-pay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(lnurlp);
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}
