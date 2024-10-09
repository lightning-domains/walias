import { isValidKey } from "@/lib/utils";
import { Prisma, PrismaClient, Walias } from "@prisma/client";
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
        where: { id: `${name}@${domain}` },
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
        where: { id: `${name}@${domain}` },
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
        where: { id: `${name}@${domain}` },
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

  async findWaliasesByDomain(domain: string, pubkey?: string) {
    try {
      log("Finding waliases for domain: %s", domain);
      const whereClause: { domainId: string; pubkey?: string } = {
        domainId: domain,
      };
      if (pubkey) {
        whereClause.pubkey = pubkey;
        log("Filtering waliases by pubkey: %s", pubkey);
      }
      const waliases = await this.prisma.walias.findMany({
        where: whereClause,
      });
      log("Found %d waliases for domain: %s", waliases.length, domain);
      return waliases;
    } catch (error) {
      log("Error while finding waliases for domain %s: %O", domain, error);
      throw error;
    }
  }

  async upsertWalias(
    name: string,
    domainId: string,
    data: { pubkey: string; relays?: string[] }
  ): Promise<Walias> {
    try {
      log("Upserting walias by name and domain: %s@%s", name, domainId);

      // Validate the pubkey
      if (!isValidKey(data.pubkey)) {
        throw new Error(`Invalid pubkey: ${data.pubkey}`);
      }

      // Use a transaction to ensure data consistency
      const upsertedWalias = await this.prisma.$transaction(async (prisma) => {
        // Check if the domain exists
        const domain = await prisma.domain.findUnique({
          where: { id: domainId },
        });

        if (!domain) {
          throw new Error(`Domain with id ${domainId} does not exist`);
        }

        // Check if the user exists
        const user = await prisma.user.findUnique({
          where: { pubkey: data.pubkey },
        });

        if (!user) {
          log(
            `User with pubkey ${data.pubkey} does not exist. Creating new user.`
          );
          await prisma.user.create({
            data: {
              pubkey: data.pubkey,
              relays: data.relays ? JSON.stringify(data.relays) : "[]",
            },
          });
        }

        const waliasId = `${name}@${domainId}`.toLowerCase().trim();
        // Upsert the Walias
        return prisma.walias.upsert({
          where: { id: waliasId },
          update: {
            pubkey: data.pubkey,
            updatedAt: new Date(),
          },
          create: {
            id: waliasId,
            name,
            domainId, // Use domainId directly as it's a String in your schema
            pubkey: data.pubkey,
          },
        });
      });

      log("Successfully upserted walias: %s@%s", name, domainId);
      return upsertedWalias;
    } catch (error) {
      log(
        "Error while upserting walias by name and domain %s@%s: %O",
        name,
        domainId,
        error
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error(
            `A walias with name ${name} already exists for domain ${domainId}`
          );
        }
        if (error.code === "P2003") {
          log("Foreign key constraint details: %O", error.meta);
          throw new Error(
            `Foreign key constraint failed. Please check if the domain and user exist.`
          );
        }
      }
      throw error;
    }
  }
}
