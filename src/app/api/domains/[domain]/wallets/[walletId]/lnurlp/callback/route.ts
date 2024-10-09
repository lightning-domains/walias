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
    const searchParams = request.nextUrl.searchParams;

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
    const callbackResponse = await walletsService.handleLnurlpCallback(
      walletId,
      domain,
      searchParams
    );
    if (!callbackResponse) {
      return NextResponse.json<ErrorResponse>(
        { reason: "Invalid callback request" },
        { status: 400 }
      );
    }

    return NextResponse.json(callbackResponse);
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Internal server error" },
      { status: 500 }
    );
  }
}
