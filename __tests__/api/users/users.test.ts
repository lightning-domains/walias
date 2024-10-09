import { NextRequest } from "next/server";
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

import { GET, PUT } from "../../../src/app/api/users/[pubkey]/route";

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

describe("GET /api/users/[id]", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await prisma.walias.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should retrieve an existing user", async () => {
    // Create a test user
    await prisma.user.create({
      data: {
        pubkey: RANDOM_PUB_KEY,
        relays: JSON.stringify([
          "wss://relay1.test.com",
          "wss://relay2.test.com",
        ]),
      },
    });

    const req = new NextRequest(
      `http://localhost:3000/api/users/${RANDOM_PUB_KEY}`,
      {
        method: "GET",
      }
    );
    const res = await GET(req, { params: { pubkey: RANDOM_PUB_KEY } });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data).toEqual({
      pubkey: RANDOM_PUB_KEY,
      relays: ["wss://relay1.test.com", "wss://relay2.test.com"],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("should return 404 for a non-existing user", async () => {
    const nonExistentPubkey = RANDOM_PUB_KEY2;
    const req = new NextRequest(
      `http://localhost:3000/api/users/${nonExistentPubkey}`,
      {
        method: "GET",
      }
    );
    const res = await GET(req, { params: { pubkey: nonExistentPubkey } });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual({
      reason: "User not found",
    });
  });

  it("should return 400 for an invalid pubkey", async () => {
    const invalidPubkey = "invalid_pubkey";
    const req = new NextRequest(
      `http://localhost:3000/api/users/${invalidPubkey}`,
      {
        method: "GET",
      }
    );
    const res = await GET(req, { params: { pubkey: invalidPubkey } });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual({
      reason: "Invalid pubkey format",
    });
  });
});

describe("PUT /api/users/[pubkey]", () => {
  it("should update an existing user's relays", async () => {
    const existingPubkey = RANDOM_PUB_KEY;
    const newRelays = ["wss://newrelay1.test.com", "wss://newrelay2.test.com"];

    const req = new NextRequest(
      `http://localhost:3000/api/users/${existingPubkey}`,
      {
        method: "PUT",
        body: JSON.stringify({ relays: newRelays }),
      }
    );

    const res = await PUT(req, { params: { pubkey: existingPubkey } });

    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.pubkey).toEqual(existingPubkey);
    expect(data.relays).toEqual(newRelays);

    // Verify the update with a GET request
    const getReq = new NextRequest(
      `http://localhost:3000/api/users/${existingPubkey}`,
      {
        method: "GET",
      }
    );
    const getRes = await GET(getReq, { params: { pubkey: existingPubkey } });
    const getData = await getRes.json();

    expect(getData.relays).toEqual(newRelays);
  });

  it("should return 400 for an invalid pubkey", async () => {
    const invalidPubkey = "invalid_pubkey";
    const newRelays = ["wss://newrelay.test.com"];

    const req = new NextRequest(
      `http://localhost:3000/api/users/${invalidPubkey}`,
      {
        method: "PUT",
        body: JSON.stringify({ relays: newRelays }),
      }
    );

    const res = await PUT(req, { params: { pubkey: invalidPubkey } });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual({
      reason: "Invalid pubkey format",
    });
  });

  it("should return 400 for invalid relays format", async () => {
    const existingPubkey = RANDOM_PUB_KEY;
    const invalidRelays = "not_an_array";

    const req = new NextRequest(
      `http://localhost:3000/api/users/${existingPubkey}`,
      {
        method: "PUT",
        body: JSON.stringify({ relays: invalidRelays }),
      }
    );

    const res = await PUT(req, { params: { pubkey: existingPubkey } });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual({
      reason: "Invalid input: Expected array, received string",
    });
  });
});
