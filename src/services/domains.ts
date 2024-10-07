import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import debug from "debug";
import { isValidDomain, isValidKey } from "@/lib/utils";
import { getPublicKey } from "nostr-tools";

const log = debug("app:service:domains");

export class DomainsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findDomainById(id: string) {
    try {
      log("Looking up domain by id: %s", id);
      const domain = await this.prisma.domain.findUnique({ where: { id } });
      // Remove rootPrivateKey
      if (!domain) {
        return null;
      }

      return {
        domain: domain.id,
        adminPubkey: domain.adminPubkey,
        verified: domain.verified,
        verifyKey: domain.verifyKey,
        relays: JSON.parse(domain.relays),
        rootPubkey: getPublicKey(Buffer.from(domain.rootPrivateKey, "hex")),
      };
    } catch (error) {
      log("Error while looking up domain by id %s: %O", id, error);
      throw error;
    }
  }

  async createDomain({
    id,
    relays = [],
    adminPubkey,
    rootPrivkey,
  }: {
    id: string;
    relays: string[];
    adminPubkey: string;
    rootPrivkey: string;
  }) {
    try {
      id = id.trim().toLowerCase();

      if (!isValidKey(adminPubkey)) {
        throw new Error("Invalid adminPubkey");
      }

      if (!isValidKey(rootPrivkey)) {
        throw new Error("Invalid rootPrivkey");
      }

      if (!isValidDomain(id)) {
        throw new Error("Invalid domain name");
      }

      log("Creating domain with id: %s", id);

      const verifyKey = crypto.randomBytes(16).toString("hex");

      const createData = {
        id,
        rootPrivateKey: rootPrivkey,
        adminPubkey,
        verifyKey,
        relays: JSON.stringify(relays),
        verified: false,
        // waliases: {
        //   create: [
        //     {
        //       name: "_",
        //       pubkey: getPublicKey(Buffer.from(rootPrivkey, "hex")),
        //       domainId: id,
        //     },
        //     {
        //       name: "admin",
        //       pubkey: adminPubkey,
        //       domainId: id,
        //     },
        //   ],
        // },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      log("Attempting to create domain with data: %O", id);
      const newDomain = await this.prisma.domain.create({ data: createData });

      if (!newDomain) {
        log("Failed to create domain: %O", createData);

        throw new Error("Failed to create domain");
      }

      log("Successfully created domain: %s", id);

      return {
        domain: newDomain.id,
        relays: JSON.parse(newDomain.relays),
        adminPubkey: newDomain.adminPubkey,
        rootPubkey: rootPrivkey,
        verifyUrl: `https://${id}/.well-known/${verifyKey}`,
        verifyContent: verifyKey,
      };
    } catch (error) {
      log("Error while creating domain %s: %O", id, (error as Error).message);
      throw error;
    }
  }

  async updateDomain(
    id: string,
    {
      relays,
      adminPubkey,
      rootPrivkey,
      verified,
    }: {
      relays?: string[];
      adminPubkey?: string;
      rootPrivkey?: string;
      verified?: boolean;
    }
  ) {
    try {
      id = id.trim().toLowerCase();

      if (!isValidDomain(id)) {
        throw new Error("Invalid domain name");
      }

      log("Updating domain with id: %s", id);

      const updatedDomain = await this.prisma.domain.update({
        where: { id },
        data: {
          adminPubkey,
          rootPrivateKey: rootPrivkey,
          verified,
          relays: relays ? JSON.stringify(relays) : undefined,
          updatedAt: new Date(),
        },
      });

      log("Successfully updated domain: %s", id);

      return {
        domain: updatedDomain.id,
        relays: JSON.parse(updatedDomain.relays),
        adminPubkey: updatedDomain.adminPubkey,
        rootPubkey: updatedDomain.rootPrivateKey,
        verified: updatedDomain.verified,
      };
    } catch (error) {
      log("Error while updating domain %s: %O", id, error);
      throw error;
    }
  }

  async deleteDomain(domain: string) {
    try {
      domain = domain.trim().toLowerCase();

      log("Deleting domain: %s", domain);

      await this.prisma.domain.delete({ where: { id: domain } });

      log("Successfully deleted domain: %s", domain);
    } catch (error) {
      log("Error while deleting domain: %O", error);
      throw error;
    }
  }

  async verifyDomain(
    domain: string
  ): Promise<{ verified: boolean; alreadyVerified: boolean }> {
    try {
      log("Verifying domain: %s", domain);
      // First, get the domain information
      const domainInfo = await this.findDomainById(domain);

      if (!domainInfo) {
        throw new Error("Domain not found");
      }

      // Check if the domain is already verified
      if (domainInfo.verified) {
        log("Domain %s is already verified", domain);
        return { verified: true, alreadyVerified: true };
      }

      // Construct the verifyUrl
      const verifyUrl = `https://${domain}/.well-known/${domainInfo.verifyKey}`;

      // Fetch the content from the verifyUrl
      log("Fetching content from %s", verifyUrl);
      const response = await fetch(verifyUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const fetchedContent = (await response.text()).trim();

      // Compare the fetched content with the expected verifyContent
      if (fetchedContent === domainInfo.verifyKey) {
        // If the content matches, update the domain as verified
        log("Verification content matched for domain %s", domain);
        await this.updateDomain(domain, { verified: true });
        return { verified: true, alreadyVerified: false };
      } else {
        // If the content doesn't match, verification failed
        log("Verification failed for domain %s", domain);
        return { verified: false, alreadyVerified: false };
      }
    } catch (error) {
      log("Error verifying domain %s: %O", domain, error);
      throw new Error("Failed to verify domain");
    }
  }
}
