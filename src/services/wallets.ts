import { PrismaClient, Wallet } from "@prisma/client";
import debug from "debug";
import crypto from "crypto";

const log = debug("app:service:wallets");

export type WalletData = {
  id?: string;
  lastEventId?: string;
  config: Record<string, unknown>;
  provider: string;
  pubkey: string;
  waliasId: string;
  priority?: number;
};

export class WalletsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createWallet(data: WalletData): Promise<Wallet> {
    try {
      log("Creating wallet for pubkey: %s", data.pubkey);

      // generate random hex 32 bytes if no id present
      const id = data.id || crypto.randomBytes(32).toString("hex");

      return await this.prisma.wallet.create({
        data: {
          id,
          lastEventId: data.lastEventId,
          config: JSON.stringify(data.config),
          provider: data.provider,
          pubkey: data.pubkey,
          waliasId: data.waliasId,
          priority: data.priority || 0,
        },
      });
    } catch (error) {
      log("Error while creating wallet for pubkey %s: %O", data.pubkey, error);
      throw error;
    }
  }

  async findWalletById(id: string): Promise<Wallet | null> {
    try {
      log("Looking up wallet by id: %s", id);
      const wallet = await this.prisma.wallet.findUnique({ where: { id } });
      if (wallet) {
        wallet.config = JSON.parse(wallet.config);
      }
      return wallet;
    } catch (error) {
      log("Error while looking up wallet by id %s: %O", id, error);
      throw error;
    }
  }

  async updateWallet(id: string, data: Partial<WalletData>): Promise<Wallet> {
    try {
      log("Updating wallet with id: %s", id);
      const wallet = await this.prisma.wallet.update({
        where: { id },
        data: {
          lastEventId: data.lastEventId,
          config: JSON.stringify(data.config),
          provider: data.provider,
          priority: data.priority,
        },
      });
      wallet.config = JSON.parse(wallet.config);
      return wallet;
    } catch (error) {
      log("Error while updating wallet with id %s: %O", id, error);
      throw error;
    }
  }

  async deleteWallet(id: string): Promise<void> {
    try {
      log("Deleting wallet with id: %s", id);
      await this.prisma.wallet.delete({ where: { id } });
    } catch (error) {
      log("Error while deleting wallet with id %s: %O", id, error);
      throw error;
    }
  }

  async findWalletsByPubkey(pubkey: string): Promise<Wallet[]> {
    try {
      log("Looking up wallets for pubkey: %s", pubkey);
      return await this.prisma.wallet.findMany({ where: { pubkey } });
    } catch (error) {
      log("Error while looking up wallets for pubkey %s: %O", pubkey, error);
      throw error;
    }
  }
}
