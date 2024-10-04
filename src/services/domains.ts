import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { getPublicKey } from "nostr-tools";
import { isValidDomain } from "@/lib/utils";
import debug from "debug";

export type DomainData = {
  id: string;
  relays: string[];
  adminPubkey: string;
  rootPrivkey?: string | null;
};

const log = debug("app:domains-service");

export class DomainsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findDomainById(domainId: string) {
    domainId = domainId.trim().toLowerCase();
    log("Searching for domain with ID: %s", domainId);
    return this.prisma.domain.findUnique({
      where: { id: domainId },
    });
  }

  async createDomain(data: DomainData) {
    data.id = data.id.trim().toLowerCase();

    if (!isValidDomain(data.id)) {
      log("Invalid domain name: %s", data.id);
      throw new Error("Invalid domain name");
    }

    let { id, relays, adminPubkey, rootPrivkey } = data;

    if (!rootPrivkey) {
      rootPrivkey = crypto.randomBytes(32).toString("hex");
      log("Generated random rootPrivkey for domain: %s", id);
    }

    const rootPrivkeyUint8Array = new Uint8Array(
      Buffer.from(rootPrivkey, "hex")
    );
    const rootPubkey = getPublicKey(rootPrivkeyUint8Array);

    // Generate verification data
    const verifyContent = crypto.randomBytes(16).toString("hex");
    const verifyUrl = `https://${id}/.well-known/${verifyContent}`;

    log("Creating domain with ID: %s", id);
    const newDomain = await this.prisma.domain.create({
      data: {
        id,
        rootPrivateKey: rootPrivkey,
        verifyKey: verifyContent,
        verified: false,
        waliases: {
          create: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    log("Successfully created domain: %s", id);

    return {
      domain: newDomain.id,
      relays,
      adminPubkey,
      rootPubkey,
      verifyUrl,
      verifyContent,
    };
  }

  async updateDomainVerificationStatus(domainId: string, verified: boolean) {
    log(
      "Updating verification status for domain with ID: %s to %s",
      domainId,
      verified
    );
    return this.prisma.domain.update({
      where: { id: domainId },
      data: { verified },
    });
  }
}
