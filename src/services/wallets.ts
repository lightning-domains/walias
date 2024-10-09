import { PrismaClient, Wallet } from "@prisma/client";
import debug from "debug";
import crypto from "crypto";
import { WalletConfig } from "@/types/requests/wallets";
import { LNURLPayCallbackResponse, LNURLResponse } from "@/types/lud";

const log = debug("app:service:wallets");

export class WalletsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createWallet(data: WalletConfig): Promise<Wallet> {
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

  async updateWallet(id: string, data: Partial<WalletConfig>): Promise<Wallet> {
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

  // Add these new methods to the WalletsService class

  async getWalletLnurlp(
    walletId: string,
    domain: string
  ): Promise<LNURLResponse | null> {
    // Implement the logic to fetch LNURL-pay information for a wallet
    // This is a placeholder implementation
    const wallet = await this.findWalletById(walletId);
    if (!wallet) return null;
    log("Wallet: %O", wallet);

    log("getWalletLnurlp not implemented");

    // Add your LNURL-pay logic here
    return {
      tag: "payRequest",
      callback: `https://${domain}/api/lnurlp/${walletId}/callback`,
      minSendable: 1000,
      maxSendable: 100000000,
      metadata: JSON.stringify([
        ["text/plain", `Payment to ${wallet}`],
        ["text/identifier", `${wallet}@${domain}`],
      ]),
      commentAllowed: 280,
      payerData: {
        name: { mandatory: false },
        email: { mandatory: false },
      },
      nostrPubkey: wallet.pubkey,
      allowsNostr: true,
    };
  }

  async handleLnurlpCallback(
    walletId: string,
    domain: string,
    params: URLSearchParams
  ): Promise<LNURLPayCallbackResponse | null> {
    // Implement the logic to handle LNURL-pay callback
    // This is a placeholder implementation
    const wallet = await this.findWalletById(walletId);
    if (!wallet) return null;
    // Add your LNURL-pay callback handling logic here
    return {
      pr: "TODO",
    };
  }
}
