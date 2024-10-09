import { NextRequest } from "next/server";
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

import {
  GET,
  PUT,
  DELETE,
} from "../../../src/app/api/domains/[domain]/wallets/[walletId]/route";

let prisma: PrismaClient;
let testDbUrl: string;

const RANDOM_PUB_KEY =
  "92763cc6af957acc8159c3d0fbcd9f00e20b4222c1dcff07107190ff5f3667d8";
const RANDOM_PUB_KEY2 =
  "12763cc6af957acc8159c3d0fbcd9f00e20b4222c1dcff07107190ff5f3667d1";

beforeAll(async () => {
  // Generate a unique database file name for each test run
  const randomString = crypto.randomBytes(8).toString("hex");
  const uniqueDbName = `test-${randomString}.db`;
  testDbUrl = `${path.join(__dirname, "../../../prisma/", uniqueDbName)}`;

  // Set up the test database
  process.env.DATABASE_URL = `file:${testDbUrl}`;

  execSync("pnpm prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });

  prisma = new PrismaClient();
});

afterAll(async () => {
  await prisma.$disconnect();

  try {
    if (testDbUrl) {
      execSync(`rm ${testDbUrl}`, {
        stdio: "inherit",
      });
    }
  } catch (error) {
    console.warn(`Warning: Could not remove test database file: ${error}`);
  }
});

describe("GET /api/domains/[domain]/wallets/[walletId]", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await prisma.wallet.deleteMany();
    await prisma.walias.deleteMany();
    await prisma.user.deleteMany();
    await prisma.domain.deleteMany();

    // Create a test domain and wallet
    await prisma.domain.create({
      data: {
        id: "example.com",
        rootPrivateKey: "somePrivateKey",
        adminPubkey: RANDOM_PUB_KEY,
        verified: true,
        relays: JSON.stringify(["wss://relay.example.com"]),
      },
    });

    // Create a test user
    await prisma.user.create({
      data: {
        pubkey: RANDOM_PUB_KEY,
        relays: JSON.stringify(["wss://relay.example.com"]),
      },
    });
    // Create a test walias
    await prisma.walias.create({
      data: {
        id: "testwalias@example.com",
        name: "testwalias",
        domainId: "example.com",
        pubkey: RANDOM_PUB_KEY,
      },
    });

    await prisma.wallet.create({
      data: {
        id: "testwallet",
        pubkey: RANDOM_PUB_KEY,
        config: JSON.stringify({}),
        provider: "DEFAULT",
        waliasId: "testwalias@example.com",
      },
    });
  });

  it("should retrieve an existing wallet when authenticated", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/testwallet",
      {
        method: "GET",
        headers: {
          "x-authenticated-pubkey": RANDOM_PUB_KEY,
        },
      }
    );
    const res = await GET(req, {
      params: { domain: "example.com", walletId: "testwallet" },
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toMatchObject({
      id: "testwallet",
      pubkey: RANDOM_PUB_KEY,
    });
  });

  it("should return 401 when not authenticated", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/testwallet",
      {
        method: "GET",
      }
    );
    const res = await GET(req, {
      params: { domain: "example.com", walletId: "testwallet" },
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toEqual({
      reason: "Authentication required",
    });
  });

  it("should return 404 for a non-existing wallet", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/nonexistent",
      {
        method: "GET",
        headers: {
          "x-authenticated-pubkey": RANDOM_PUB_KEY,
        },
      }
    );
    const res = await GET(req, {
      params: { domain: "example.com", walletId: "nonexistent" },
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual({
      reason: "Wallet not found",
    });
  });
});

describe("PUT /api/domains/[domain]/wallets/[walletId]", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await prisma.wallet.deleteMany();
    await prisma.walias.deleteMany();
    await prisma.user.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.domain.create({
      data: {
        id: "example.com",
        rootPrivateKey: "somePrivateKey",
        adminPubkey: RANDOM_PUB_KEY,
        verified: true,
        relays: JSON.stringify(["wss://relay.example.com"]),
      },
    });

    await prisma.user.create({
      data: {
        pubkey: RANDOM_PUB_KEY,
      },
    });

    await prisma.walias.create({
      data: {
        id: "testwalias@example.com",
        name: "testwalias",
        domainId: "example.com",
        pubkey: RANDOM_PUB_KEY,
      },
    });

    await prisma.wallet.create({
      data: {
        id: "existingwallet",
        pubkey: RANDOM_PUB_KEY,
        config: JSON.stringify({}),
        provider: "DEFAULT",
        waliasId: "testwalias@example.com",
      },
    });
  });

  it("should update an existing wallet when authenticated", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/existingwallet",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-authenticated-pubkey": RANDOM_PUB_KEY,
        },
        body: JSON.stringify({
          config: { someKey: "someValue" },
        }),
      }
    );
    const res = await PUT(req, {
      params: { domain: "example.com", walletId: "existingwallet" },
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toMatchObject({
      id: "existingwallet",
      pubkey: RANDOM_PUB_KEY,
      config: { someKey: "someValue" },
    });

    // Verify the wallet was actually updated in the database
    const updatedWallet = await prisma.wallet.findUnique({
      where: {
        id: "existingwallet",
      },
    });

    expect(updatedWallet?.pubkey).toBe(RANDOM_PUB_KEY);
    expect(JSON.parse(updatedWallet?.config || "{}")).toEqual({
      someKey: "someValue",
    });
  });

  it("should return 403 when authenticated with a different pubkey", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/existingwallet",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-authenticated-pubkey": RANDOM_PUB_KEY2,
        },
        body: JSON.stringify({
          config: { someKey: "someValue" },
        }),
      }
    );
    const res = await PUT(req, {
      params: { domain: "example.com", walletId: "existingwallet" },
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.reason).toBe("Invalid authentication");
  });

  it("should return 401 when not authenticated", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/existingwallet",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pubkey: RANDOM_PUB_KEY2,
          config: { someKey: "someValue" },
        }),
      }
    );
    const res = await PUT(req, {
      params: { domain: "example.com", walletId: "existingwallet" },
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.reason).toBe("Authentication required");
  });

  it("should return 400 for invalid input", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/existingwallet",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-authenticated-pubkey": RANDOM_PUB_KEY2,
        },
        body: JSON.stringify({
          pubkey: "invalid_pubkey",
          config: "not_an_object",
        }),
      }
    );
    const res = await PUT(req, {
      params: { domain: "example.com", walletId: "existingwallet" },
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.reason).toContain("Invalid input");
  });
});

describe("DELETE /api/domains/[domain]/wallets/[walletId]", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await prisma.wallet.deleteMany();
    await prisma.walias.deleteMany();
    await prisma.user.deleteMany();
    await prisma.domain.deleteMany();

    await prisma.domain.create({
      data: {
        id: "example.com",
        rootPrivateKey: "somePrivateKey",
        adminPubkey: RANDOM_PUB_KEY,
        verified: true,
        relays: '["wss://relay.example.com"]',
      },
    });

    await prisma.user.create({
      data: {
        pubkey: RANDOM_PUB_KEY,
        relays: '["wss://relay.example.com"]',
      },
    });

    await prisma.walias.create({
      data: {
        id: "testwalias@example.com",
        name: "testwalias",
        domainId: "example.com",
        pubkey: RANDOM_PUB_KEY,
      },
    });

    await prisma.wallet.create({
      data: {
        id: "existingwallet",
        pubkey: RANDOM_PUB_KEY,
        config: JSON.stringify({}),
        provider: "DEFAULT",
        waliasId: "testwalias@example.com",
      },
    });
  });

  it("should delete an existing wallet", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/existingwallet",
      {
        method: "DELETE",
        headers: {
          "x-authenticated-pubkey": RANDOM_PUB_KEY,
        },
      }
    );
    const res = await DELETE(req, {
      params: { domain: "example.com", walletId: "existingwallet" },
    });

    expect(res.status).toBe(200);

    // Verify the wallet was actually deleted from the database
    const deletedWallet = await prisma.wallet.findUnique({
      where: {
        id: "existingwallet",
      },
    });

    expect(deletedWallet).toBeNull();
  });

  it("should return 401 for unauthenticated deletion attempt", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/existingwallet",
      {
        method: "DELETE",
        // No authentication headers provided
      }
    );
    const res = await DELETE(req, {
      params: { domain: "example.com", walletId: "existingwallet" },
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.reason).toBe("Authentication required");

    // Verify the wallet was not deleted from the database
    const wallet = await prisma.wallet.findUnique({
      where: {
        id: "existingwallet",
      },
    });

    expect(wallet).not.toBeNull();
  });

  it("should return 403 for unauthorized deletion attempt", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/existingwallet",
      {
        method: "DELETE",
        headers: {
          "x-authenticated-pubkey": "wrongpubkey",
        },
      }
    );
    const res = await DELETE(req, {
      params: { domain: "example.com", walletId: "existingwallet" },
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.reason).toBe("Invalid authentication");

    // Verify the wallet was not deleted from the database
    const wallet = await prisma.wallet.findUnique({
      where: {
        id: "existingwallet",
      },
    });

    expect(wallet).not.toBeNull();
  });

  it("should return 404 for a non-existing wallet", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/wallets/nonexistent",
      {
        method: "DELETE",
        headers: {
          "x-authenticated-pubkey": "validpubkey",
        },
      }
    );
    const res = await DELETE(req, {
      params: { domain: "example.com", walletId: "nonexistent" },
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.reason).toBe("Wallet not found");
  });
});
