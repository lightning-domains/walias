import { PrismaClient } from "@prisma/client";
import debug from "debug";

const log = debug("app:users-service");

export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async findUserByPubkey(pubkey: string) {
    try {
      log("Looking up user by pubkey: %s", pubkey);
      return await this.prisma.user.findUnique({ where: { pubkey } });
    } catch (error) {
      log("Error while looking up user by pubkey %s: %O", pubkey, error);
      throw error;
    }
  }

  async createUser(pubkey: string) {
    try {
      log("Creating user with pubkey: %s", pubkey);

      const newUser = await this.prisma.user.create({
        data: {
          pubkey,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      log("Successfully created user: %s", pubkey);
      return newUser;
    } catch (error) {
      log("Error while creating user %s: %O", pubkey, error);
      throw error;
    }
  }

  async updateUserRelays(pubkey: string, relays: string[]) {
    try {
      log("Updating relays for user with pubkey: %s", pubkey);

      const updatedUser = await this.prisma.user.update({
        where: { pubkey },
        data: {
          relays: JSON.stringify(relays),
          updatedAt: new Date(),
        },
      });

      log("Successfully updated relays for user: %s", pubkey);
      return updatedUser;
    } catch (error) {
      log("Error while updating user %s: %O", pubkey, error);
      throw error;
    }
  }
}