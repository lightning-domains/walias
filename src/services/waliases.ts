import { PrismaClient, Walias } from "@prisma/client";
import debug from "debug";
import crypto from "crypto";

const log = debug("app:walias-service");

export type WaliasData = { name: string; domainId: string; pubkey: string };

export class WaliasService {
  constructor(private prisma: PrismaClient) {}

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
          id: crypto.randomBytes(32).toString("hex"),
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
          name_domainId: {
            name,
            domainId,
          },
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
        where: { name_domainId: { name, domainId } },
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
