import { NextRequest } from "next/server";
import { POST } from "../../src/app/api/domains/[domain]/(domains)/post";
import { PrismaClient } from "@prisma/client";

// Mock PrismaClient
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    domain: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Initialize prisma client
let prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/domains/[domain]", () => {
  it("should create a new domain", async () => {
    // Mock the create function to resolve a domain
    (prisma.domain.create as jest.Mock).mockResolvedValue({
      id: "newdomain.com",
      rootPrivateKey:
        "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
      adminPubkey:
        "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
      verifyKey: "verifykey1234",
      verified: false,
      relays: `["wss://relay1.example.com","wss://relay2.example.com"]`,
      createdAt: new Date("2023-01-01T00:00:00Z"),
      updatedAt: new Date("2023-01-01T00:00:00Z"),
    });

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
  });

  it("should return 400 if domain already exists", async () => {
    (prisma.domain.findUnique as jest.Mock).mockResolvedValue({
      id: "existing.com",
      rootPrivateKey:
        "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
      adminPubkey:
        "3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
      verifyKey: "existingVerifyKey789",
      verified: true,
      relays: "wss://relay1.existing.com,wss://relay2.existing.com",
      createdAt: new Date("2023-01-01T00:00:00Z"),
      updatedAt: new Date("2023-01-01T00:00:00Z"),
    });

    const req = new NextRequest(
      "http://localhost:3000/api/domains/existing.com",
      {
        method: "POST",
        body: JSON.stringify({ name: "existing.com" }),
      }
    );
    const res = await POST(req, { params: { domain: "existing.com" } });

    expect(res.status).toBe(400);
  });
});
