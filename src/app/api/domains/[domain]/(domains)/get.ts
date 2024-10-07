import { isValidDomain } from "@/lib/utils";
import { DomainsService } from "@/services/domains";
import debug from "debug";
import { NextRequest, NextResponse } from "next/server";

const log = debug("app:api:domains:get");

// GET: Get Domain
export async function GET(
  _request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const { domain } = params;
    const domainsService = new DomainsService();
    const domainInfo = await domainsService.findDomainById(domain);

    if (!isValidDomain(domain)) {
      log("Invalid domain name: %s", domain);
      return NextResponse.json(
        { reason: "Invalid domain name" },
        { status: 400 }
      );
    }
    if (!domainInfo) {
      log("Domain %s not found", domain);
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
