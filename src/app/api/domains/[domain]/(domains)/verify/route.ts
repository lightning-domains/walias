import { NextRequest, NextResponse } from "next/server";
import { DomainsService } from "@/services/domains";

export async function POST(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  const domainsService = new DomainsService();
  const { domain } = params;

  try {
    const verificationResult = await domainsService.verifyDomain(domain);

    if (verificationResult.verified) {
      const domainInfo = await domainsService.findDomainById(domain);

      if (!domainInfo) {
        return NextResponse.json(
          { reason: "Domain not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          domain: domainInfo.domain,
          relays: domainInfo.relays,
          adminPubkey: domainInfo.adminPubkey,
          rootPubkey: domainInfo.rootPubkey,
        },
        { status: verificationResult.alreadyVerified ? 208 : 200 }
      );
    } else {
      return NextResponse.json(
        { reason: "Validation failed" },
        { status: 409 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ reason: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { reason: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
