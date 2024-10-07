import { NextRequest } from "next/server";
import { POST } from "../../src/app/api/domains/[domain]/(domains)/post";
import { GET } from "../../src/app/api/domains/[domain]/(domains)/get";
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

const RANDOM_PRIV_KEY =
  "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b";

const RANDOM_PUB_KEY =
  "92763cc6af957acc8159c3d0fbcd9f00e20b4222c1dcff07107190ff5f3667d8";

beforeAll(async () => {
  // Set up the test database
  const testDbUrl = `file:${path.join(__dirname, "../../prisma/test.db")}`;
  process.env.DATABASE_URL = testDbUrl;

  execSync("pnpm prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testDbUrl },
  });

  // Log PrismaClient configuration if needed for debugging
  prisma = new PrismaClient();
});

afterAll(async () => {
  execSync(`rm ${path.join(__dirname, "../../prisma/test.db")}`, {
    stdio: "inherit",
  });
});

describe("POST /api/domains/[domain]", () => {
  it("should create a new domain", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/newdomain.com",
      {
        method: "POST",
        body: JSON.stringify({
          relays: ["wss://relay1.example.com", "wss://relay2.example.com"],
          adminPubkey: RANDOM_PRIV_KEY,
        }),
      }
    );
    const res = await POST(req, { params: { domain: "newdomain.com" } });

    expect(res.status).toBe(201);
    const data = await res.json();

    expect(data).toHaveProperty("domain", "newdomain.com");

    // Verify the domain was actually created in the database
    const createdDomain = await prisma.domain.findUnique({
      where: { id: "newdomain.com" },
    });

    expect(createdDomain).not.toBeNull();
    expect(createdDomain?.adminPubkey).toBe(RANDOM_PRIV_KEY);
  });

  it("should return 409 if domain already exists", async () => {
    // Create a domain first
    await prisma.domain.create({
      data: {
        id: "existing.com",
        rootPrivateKey: RANDOM_PRIV_KEY,
        adminPubkey: RANDOM_PRIV_KEY,
        verifyKey: "existingVerifyKey789",
        verified: true,
        relays: JSON.stringify([
          "wss://relay1.existing.com",
          "wss://relay2.existing.com",
        ]),
      },
    });

    const req = new NextRequest(
      "http://localhost:3000/api/domains/existing.com",
      {
        method: "POST",
        body: JSON.stringify({
          relays: ["wss://relay1.existing.com", "wss://relay2.existing.com"],
          adminPubkey: RANDOM_PRIV_KEY,
        }),
      }
    );
    const res = await POST(req, { params: { domain: "existing.com" } });

    expect(res.status).toBe(409);
  });

  it("should return 400 for an invalid domain name", async () => {
    const invalidDomain = "invalid domain.com";
    const req = new NextRequest(
      `http://localhost:3000/api/domains/${invalidDomain}`,
      {
        method: "POST",
        body: JSON.stringify({
          relays: ["wss://relay1.example.com", "wss://relay2.example.com"],
          adminPubkey: RANDOM_PRIV_KEY,
        }),
      }
    );
    const res = await POST(req, { params: { domain: invalidDomain } });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty("reason");
    expect(data.reason).toContain("Invalid domain name");
  });
});

describe("GET /api/domains/[domain]", () => {
  it("should retrieve an existing domain", async () => {
    // Create a test domain
    await prisma.domain.create({
      data: {
        id: "testdomain.com",
        rootPrivateKey: RANDOM_PRIV_KEY,
        adminPubkey: RANDOM_PRIV_KEY,
        verifyKey: "testVerifyKey789",
        verified: true,
        relays: JSON.stringify([
          "wss://relay1.test.com",
          "wss://relay2.test.com",
        ]),
      },
    });

    const req = new NextRequest(
      "http://localhost:3000/api/domains/testdomain.com",
      {
        method: "GET",
      }
    );
    const res = await GET(req, { params: { domain: "testdomain.com" } });

    expect(res.status).toBe(200);
    const data = await res.json();

    // Check if the response matches the OpenAPI spec
    expect(data).toEqual({
      domain: "testdomain.com",
      adminPubkey: RANDOM_PRIV_KEY,
      verified: true,
      verifyKey: "testVerifyKey789",
      relays: ["wss://relay1.test.com", "wss://relay2.test.com"],
      rootPubkey: RANDOM_PUB_KEY,
    });
    expect(data).not.toHaveProperty("rootPrivateKey");
    expect(data).toHaveProperty("verifyKey");
  });

  it("should return 404 for a non-existing domain", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/domains/nonexistent.com",
      {
        method: "GET",
      }
    );
    const res = await GET(req, { params: { domain: "nonexistent.com" } });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual({
      reason: "Domain not found",
      success: false,
    });
  });

  it("should return 400 for an invalid domain name", async () => {
    const invalidDomain = "invalid domain.com";
    const req = new NextRequest(
      `http://localhost:3000/api/domains/${invalidDomain}`,
      {
        method: "GET",
      }
    );
    const res = await GET(req, { params: { domain: invalidDomain } });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual({
      reason: "Invalid domain name",
    });
  });
});
