import { PrismaClient } from "@prisma/client";

// Create a singleton instance of PrismaClient
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Avoid instantiating multiple PrismaClient instances during development
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export { prisma };
