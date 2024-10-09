import { NextRequest, NextResponse } from "next/server";
import { WaliasService } from "@/services/waliases";
import { DomainsService } from "@/services/domains";
import { ErrorResponse } from "@/types/requests/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string; verificationId: string } }
) {
  const { domain, verificationId } = params;

  const domainsService = new DomainsService();
  const waliasService = new WaliasService();

  const domainDoc = await domainsService.findDomainById(domain);
  if (!domainDoc) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Domain not found" },
      { status: 404 }
    );
  }

  return NextResponse.json<ErrorResponse>(
    { reason: "Needs implementation" },
    { status: 501 }
  );

  const payment = await waliasService.getWaliasPayment(verificationId, domain);
  if (!payment) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Payment not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(payment);
}
