import { NextRequest } from "next/server";
import { POST } from "../../src/app/api/domains/[domain]/(domains)/post";
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

beforeAll(async () => {
  // Set up the test database
  const testDbUrl = `file:${path.join(__dirname, "../../prisma/test.db")}`;
  process.env.DATABASE_URL = testDbUrl;

  console.log("Setting DATABASE_URL to:", testDbUrl);

  execSync("pnpm prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testDbUrl },
  });

  // Log PrismaClient configuration if needed for debugging
  prisma = new PrismaClient();
  console.log("PrismaClient config:", prisma);
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
          adminPubkey:
            "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
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
    expect(createdDomain?.adminPubkey).toBe(
      "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b"
    );
  });

  it("should return 409 if domain already exists", async () => {
    // Create a domain first
    await prisma.domain.create({
      data: {
        id: "existing.com",
        rootPrivateKey:
          "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
        adminPubkey:
          "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
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
          adminPubkey:
            "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
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
          adminPubkey:
            "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
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
