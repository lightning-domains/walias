import { PrismaClient, Walias } from "@prisma/client";
import debug from "debug";
import { isValidKey } from "@/lib/utils";
import { Prisma } from "@prisma/client";

const log = debug("app:service:waliases");

export type WaliasData = { name: string; domainId: string; pubkey: string };

export class WaliasService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async findWaliasById(id: string): Promise<Walias | null> {
    try {
      log("Looking up walias by id: %s", id);
      return await this.prisma.walias.findUnique({ where: { id } });
    } catch (error) {
      log("Error while looking up walias by id %s: %O", id, error);
      throw error;
    }
  }

  async createWalias({ name, domainId, pubkey }: WaliasData): Promise<Walias> {
    try {
      log("Creating walias with name: %s", name);

      const newWalias = await this.prisma.walias.create({
        data: {
          id: `${name}@${domainId}`.toLowerCase().trim(),
          name,
          domainId,
          pubkey,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      log("Successfully created walias: %s", name);
      return newWalias;
    } catch (error) {
      log("Error while creating walias %s: %O", name, error);
      throw error;
    }
  }

  async updateWaliasByNameAndDomain({
    name,
    domainId,
    pubkey,
  }: WaliasData): Promise<Walias> {
    try {
      log("Updating walias with name: %s and domainId: %s", name, domainId);

      const updatedWalias = await this.prisma.walias.update({
        where: {
          id: `${name}@${domainId}`.toLowerCase().trim(),
        },
        data: {
          pubkey: pubkey || undefined,
          updatedAt: new Date(),
        },
      });

      log(
        "Successfully updated walias with name: %s and domainId: %s",
        name,
        domainId
      );
      return updatedWalias;
    } catch (error) {
      log(
        "Error while updating walias with name %s and domainId %s: %O",
        name,
        domainId,
        error
      );
      throw error;
    }
  }

  async updateWaliasById(
    id: string,
    { name, domainId, pubkey }: Partial<WaliasData>
  ): Promise<Walias> {
    try {
      log("Updating walias with id: %s", id);

      const updatedWalias = await this.prisma.walias.update({
        where: { id },
        data: {
          name: name || undefined,
          domainId: domainId || undefined,
          pubkey: pubkey || undefined,
          updatedAt: new Date(),
        },
      });

      log("Successfully updated walias with id: %s", id);
      return updatedWalias;
    } catch (error) {
      log("Error while updating walias with id %s: %O", id, error);
      throw error;
    }
  }

  async findWaliasesByPubkeyAndDomain(
    pubkey: string,
    domainId: string
  ): Promise<Walias[]> {
    try {
      log(
        "Looking up waliases for pubkey: %s and domainId: %s",
        pubkey,
        domainId
      );
      return await this.prisma.walias.findMany({
        where: { pubkey, domainId },
      });
    } catch (error) {
      log(
        "Error while looking up waliases for pubkey %s and domainId %s: %O",
        pubkey,
        domainId,
        error
      );
      throw error;
    }
  }

  async findWaliasByNameAndDomain(
    name: string,
    domainId: string
  ): Promise<Walias | null> {
    try {
      log("Looking up walias by name and domain: %s@%s", name, domainId);
      return await this.prisma.walias.findUnique({
        where: { id: `${name}@${domainId}`.toLowerCase().trim() },
      });
    } catch (error) {
      log(
        "Error while looking up walias by name and domain %s@%s: %O",
        name,
        domainId,
        error
      );
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

  async deleteWalias(id: string): Promise<void> {
    try {
      log("Deleting walias with id: %s", id);
      await this.prisma.walias.delete({ where: { id } });
      log("Successfully deleted walias with id: %s", id);
    } catch (error) {
      log("Error while deleting walias with id %s: %O", id, error);
      throw error;
    }
  }
}
