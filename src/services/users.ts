import { PrismaClient } from "@prisma/client";
import debug from "debug";

const log = debug("app:service:users");

export class UsersService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findUserByPubkey(pubkey: string) {
    try {
      log("Looking up user by pubkey: %s", pubkey);
      const user = await this.prisma.user.findUnique({ where: { pubkey } });
      if (!user) {
        return null;
      }
      user.relays = JSON.parse(user.relays);
      return user;
    } catch (error) {
      log("Error while looking up user by pubkey %s: %O", pubkey, error);
      throw error;
    }
  }

  async createUser(pubkey: string) {
    try {
      log("Creating or updating user with pubkey: %s", pubkey);

      const upsertedUser = await this.prisma.user.upsert({
        where: { pubkey },
        update: {
          updatedAt: new Date(),
        },
        create: {
          pubkey,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      log("Successfully created or updated user: %s", pubkey);
      return upsertedUser;
    } catch (error) {
      log("Error while creating or updating user %s: %O", pubkey, error);
      throw error;
    }
  }

  async updateUserRelays(pubkey: string, relays: string[]) {
    try {
      log("Updating relays for user with pubkey: %s", pubkey);

      const updatedUser = await this.prisma.user.upsert({
        where: { pubkey },
        create: {
          pubkey,
          relays: JSON.stringify(relays),
        },
        update: {
          relays: JSON.stringify(relays),
        },
      });

      log("Successfully updated relays for user: %s", pubkey);
      updatedUser.relays = JSON.parse(updatedUser.relays);
      return updatedUser;
    } catch (error) {
      log("Error while updating user %s: %O", pubkey, error);
      throw error;
    }
  }
}
