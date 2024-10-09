import { NextRequest, NextResponse } from "next/server";
import { WaliasService } from "@/services/waliases";
import { DomainsService } from "@/services/domains";
import { ErrorResponse } from "@/types/requests/shared";

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  const authenticatedPubkey = request.headers.get("x-authenticated-pubkey");

  if (!authenticatedPubkey) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Unauthorized" },
      { status: 401 }
    );
  }
  const { domain, name } = params;

  const domainsService = new DomainsService();
  const waliasService = new WaliasService();

  const domainDoc = await domainsService.findDomainById(domain);
  if (!domainDoc) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Domain not found" },
      { status: 404 }
    );
  }

  const walias = await waliasService.findWaliasByName(name, domain);
  if (!walias) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Walias not found" },
      { status: 404 }
    );
  }

  if (walias.pubkey !== authenticatedPubkey) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Unauthorized" },
      { status: 401 }
    );
  }

  const wallets = await waliasService.getWaliasWallets(name, domain);
  return NextResponse.json(wallets);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { domain: string; name: string } }
) {
  const authenticatedPubkey = request.headers.get("x-authenticated-pubkey");

  if (!authenticatedPubkey) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Unauthorized" },
      { status: 401 }
    );
  }

  const { domain, name } = params;
  const body = await request.json();

  const domainsService = new DomainsService();
  const waliasService = new WaliasService();

  const domainDoc = await domainsService.findDomainById(domain);
  if (!domainDoc) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Domain not found" },
      { status: 404 }
    );
  }

  const walias = await waliasService.findWaliasByName(name, domain);
  if (!walias) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Walias not found" },
      { status: 404 }
    );
  }

  if (walias.pubkey !== authenticatedPubkey) {
    return NextResponse.json<ErrorResponse>(
      { reason: "Unauthorized" },
      { status: 401 }
    );
  }

  const newWallet = await waliasService.addWaliasWallet(name, domain, body);
  return NextResponse.json(newWallet, { status: 201 });
}
