import { DomainsService } from "@/services/domains";
import { NextRequest, NextResponse } from "next/server";

// GET: Get Domain
export async function GET(
  _request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain } = params;
    const domainsService = new DomainsService();
    const domainInfo = await domainsService.findDomainById(domain);

    if (!domainInfo) {
      return NextResponse.json(
        { success: false, reason: "Domain not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(domainInfo, { status: 200 });
  } catch (error) {
    console.error("Error fetching domain information:", error);
    return NextResponse.json(
      { success: false, reason: "Internal server error" },
      { status: 500 }
    );
  }
}
