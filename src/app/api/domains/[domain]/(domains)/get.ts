import { prisma } from "@/lib/prisma";
import { DomainsService } from "@/services/domains";
import { NextRequest, NextResponse } from "next/server";
const domainsService = new DomainsService(prisma);

// GET: Get Domain
export async function GET(
  _request: NextRequest,
  { params }: { params: { domain: string } }
) {
  const { domain } = params;

  try {
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
