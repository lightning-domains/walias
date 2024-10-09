import { NextRequest } from "next/server";
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

import {
  GET,
  POST,
  PUT,
  DELETE,
} from "../../../src/app/api/domains/[domain]/walias/[name]/route";

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

describe("GET /api/domains/[domain]/walias/[name]", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await prisma.walias.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.user.deleteMany();

    // Create a test domain and walias
    await prisma.domain.create({
      data: {
        id: "example.com",
        rootPrivateKey: "somePrivateKey",
        adminPubkey: RANDOM_PUB_KEY,
        verified: true,
        relays: JSON.stringify(["wss://relay.example.com"]),
      },
    });

    // Create a test user with a pubkey
    await prisma.user.create({
      data: {
        pubkey: RANDOM_PUB_KEY,
      },
    });

    await prisma.walias.create({
      data: {
        id: "testuser@example.com",
        name: "testuser",
        domainId: "example.com",
        pubkey: RANDOM_PUB_KEY,
      },
    });
  });

  it("should retrieve an existing walias", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/walias/testuser",
      {
        method: "GET",
      }
    );
    const res = await GET(req, {
      params: { domain: "example.com", name: "testuser" },
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toMatchObject({
      id: "testuser@example.com",
      name: "testuser",
      domainId: "example.com",
      pubkey: RANDOM_PUB_KEY,
    });
  });

  it("should return 404 for a non-existing walias", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/walias/nonexistent",
      {
        method: "GET",
      }
    );
    const res = await GET(req, {
      params: { domain: "example.com", name: "nonexistent" },
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual({
      reason: "Walias not found",
    });
  });
});

describe("POST /api/domains/[domain]/walias/[name]", () => {
  beforeEach(async () => {
    await prisma.walias.deleteMany();
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
  });

  it("should create a new walias", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/walias/newuser",
      {
        method: "POST",
        body: JSON.stringify({ pubkey: RANDOM_PUB_KEY }),
      }
    );
    const res = await POST(req, {
      params: { domain: "example.com", name: "newuser" },
    });

    expect(res.status).toBe(201);
    const data = await res.json();

    expect(data).toMatchObject({
      id: "newuser@example.com",
      name: "newuser",
      domainId: "example.com",
      pubkey: RANDOM_PUB_KEY,
    });

    // Verify the walias was actually created in the database
    const createdWalias = await prisma.walias.findUnique({
      where: { id: "newuser@example.com" },
    });

    expect(createdWalias).not.toBeNull();
  });

  it("should return 400 for invalid input", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/walias/newuser",
      {
        method: "POST",
        body: JSON.stringify({ pubkey: "invalid_pubkey" }),
      }
    );
    const res = await POST(req, {
      params: { domain: "example.com", name: "newuser" },
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.reason).toContain("Invalid input");
  });
});

describe("PUT /api/domains/[domain]/walias/[name]", () => {
  beforeEach(async () => {
    await prisma.walias.deleteMany();
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

    await prisma.walias.create({
      data: {
        id: "existinguser@example.com",
        name: "existinguser",
        domainId: "example.com",
        pubkey: RANDOM_PUB_KEY,
      },
    });
  });

  it("should update an existing walias", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/walias/existinguser",
      {
        method: "PUT",
        body: JSON.stringify({ pubkey: RANDOM_PUB_KEY2 }),
      }
    );
    const res = await PUT(req, {
      params: { domain: "example.com", name: "existinguser" },
    });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toMatchObject({
      id: "existinguser@example.com",
      name: "existinguser",
      domainId: "example.com",
      pubkey: RANDOM_PUB_KEY2,
    });

    // Verify the walias was actually updated in the database
    const updatedWalias = await prisma.walias.findUnique({
      where: { id: "existinguser@example.com" },
    });

    expect(updatedWalias?.pubkey).toBe(RANDOM_PUB_KEY2);
  });

  it("should return 400 for invalid input", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/walias/existinguser",
      {
        method: "PUT",
        body: JSON.stringify({ pubkey: "invalid_pubkey" }),
      }
    );
    const res = await PUT(req, {
      params: { domain: "example.com", name: "existinguser" },
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.reason).toContain("Invalid input");
  });
});

describe("DELETE /api/domains/[domain]/walias/[name]", () => {
  beforeEach(async () => {
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
        id: "existinguser@example.com",
        name: "existinguser",
        domainId: "example.com",
        pubkey: RANDOM_PUB_KEY,
      },
    });
  });

  it("should delete an existing walias", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/walias/existinguser",
      {
        method: "DELETE",
      }
    );
    const res = await DELETE(req, {
      params: { domain: "example.com", name: "existinguser" },
    });

    expect(res.status).toBe(204);

    // Verify the walias was actually deleted from the database
    const deletedWalias = await prisma.walias.findUnique({
      where: { id: "existinguser@example.com" },
    });

    expect(deletedWalias).toBeNull();
  });

  it("should return 404 for a non-existing walias", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/example.com/walias/nonexistent",
      {
        method: "DELETE",
      }
    );
    const res = await DELETE(req, {
      params: { domain: "example.com", name: "nonexistent" },
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.reason).toBe("Walias not found");
  });
});
