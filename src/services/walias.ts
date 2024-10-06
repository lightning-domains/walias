import { PrismaClient } from "@prisma/client";
import debug from "debug";

const log = debug("app:service:walias");

export class WaliasService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findWaliasByName(name: string, domain: string) {
    try {
      log("Looking up walias by name: %s in domain: %s", name, domain);
      const walias = await this.prisma.walias.findUnique({
        where: { name_domainId: { name, domainId: domain } },
      });
      return walias;
    } catch (error) {
      log(
        "Error while looking up walias %s in domain %s: %O",
        name,
        domain,
        error
      );
      throw error;
    }
  }

  async deleteWalias(name: string, domain: string) {
    try {
      log("Deleting walias: %s in domain: %s", name, domain);
      await this.prisma.walias.delete({
        where: { name_domainId: { name, domainId: domain } },
      });
      log("Successfully deleted walias: %s in domain: %s", name, domain);
    } catch (error) {
      log(
        "Error while deleting walias %s in domain %s: %O",
        name,
        domain,
        error
      );
      throw error;
    }
  }

  async updateWalias(name: string, domain: string, pubkey: string) {
    try {
      log("Updating walias: %s in domain: %s", name, domain);
      const updatedWalias = await this.prisma.walias.update({
        where: { name_domainId: { name, domainId: domain } },
        data: { pubkey },
      });
      log("Successfully updated walias: %s in domain: %s", name, domain);
      return updatedWalias;
    } catch (error) {
      log(
        "Error while updating walias %s in domain %s: %O",
        name,
        domain,
        error
      );
      throw error;
    }
  }

  async findWaliasesByDomain(domain: string) {
    try {
      log("Finding waliases for domain: %s", domain);
      const waliases = await this.prisma.walias.findMany({
        where: { domainId: domain },
      });
      log("Found %d waliases for domain: %s", waliases.length, domain);
      return waliases;
    } catch (error) {
      log("Error while finding waliases for domain %s: %O", domain, error);
      throw error;
    }
  }
}
