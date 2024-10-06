import { PrismaClient } from "@prisma/client";
import debug from "debug";

const log = debug("app:service:wallet");

export class WalletService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findWalletById(id: string) {
    try {
      log("Looking up wallet by id: %s", id);
      const wallet = await this.prisma.wallet.findUnique({ where: { id } });
      return wallet;
    } catch (error) {
      log("Error while looking up wallet by id %s: %O", id, error);
      throw error;
    }
  }

  // ... other methods ...

  async deleteWallet(id: string) {
    try {
      log("Deleting wallet: %s", id);
      await this.prisma.wallet.delete({ where: { id } });
      log("Successfully deleted wallet: %s", id);
    } catch (error) {
      log("Error while deleting wallet: %O", error);
      throw error;
    }
  }

  async updateWallet(
    id: string,
    data: Partial<{
      lastEventId: string | null;
      config: string;
      provider: string;
      waliasId: string;
      priority: number;
    }>
  ) {
    try {
      log("Updating wallet: %s", id);
      const updatedWallet = await this.prisma.wallet.update({
        where: { id },
        data: {
          lastEventId: data.lastEventId,
          config: data.config,
          provider: data.provider,
          waliasId: data.waliasId,
          priority: data.priority,
        },
      });
      log("Successfully updated wallet: %s", id);
      return updatedWallet;
    } catch (error) {
      log("Error while updating wallet: %O", error);
      throw error;
    }
  }
}
