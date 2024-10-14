import {
  cn,
  resolveLud16,
  resolveNip05,
  getDomainProfile,
  isValidDomain,
  isValidKey,
} from "../../src/lib/utils";

describe("Utility functions", () => {
  describe("cn", () => {
    test("should merge class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("class1", { class2: true, class3: false })).toBe(
        "class1 class2"
      );
    });
  });

  describe("resolveLud16", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    test("should resolve a valid LUD-16 address", async () => {
      const mockResponse = { callback: "https://example.com/lnurlp" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resolveLud16("user@example.com");
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/.well-known/lnurlp/user"
      );
    });

    test("should return null for an invalid LUD-16 address", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await resolveLud16("invalid@example.com");
      expect(result).toBeNull();
    });
  });

  describe("resolveNip05", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    test("should resolve a valid NIP-05 address", async () => {
      const mockResponse = { names: { user: "npub1..." } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await resolveNip05("user@example.com");
      expect(result).toBe("npub1...");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/.well-known/nostr.json?name=user"
      );
    });

    test("should return null for an invalid NIP-05 address", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await resolveNip05("invalid@example.com");
      expect(result).toBeNull();
    });
  });

  describe("getDomainProfile", () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    test("should fetch a valid domain profile", async () => {
      const mockResponse = { description: "Test Domain" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getDomainProfile("example.com");
      expect(result).toEqual({ ...mockResponse, name: "example.com" });
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/.well-known/domain.json"
      );
    });

    test("should return null for an invalid domain", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getDomainProfile("invalid.com");
      expect(result).toBeNull();
    });
  });

  describe("isValidDomain", () => {
    test("should return true for valid domain names", () => {
      expect(isValidDomain("example.com")).toBe(true);
      expect(isValidDomain("sub.example.co.uk")).toBe(false);
    });

    test("should return false for invalid domain names", () => {
      expect(isValidDomain("invalid")).toBe(false);
      expect(isValidDomain("invalid.1")).toBe(false);
      expect(isValidDomain("-invalid.com")).toBe(false);
      expect(isValidDomain("invalid-.com")).toBe(false);
    });
  });

  describe("isValidKey", () => {
    test("should return true for valid 32-byte hex strings", () => {
      expect(
        isValidKey(
          "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        )
      ).toBe(true);
    });

    test("should return false for invalid hex strings", () => {
      expect(isValidKey("invalid")).toBe(false);
      expect(isValidKey("0123456789abcdef")).toBe(false);
      expect(
        isValidKey(
          "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde"
        )
      ).toBe(false);
    });

    test("should validate different lengths when specified", () => {
      expect(isValidKey("0123456789abcdef", 8)).toBe(true);
      expect(isValidKey("0123456789abcdef0123456789abcdef", 16)).toBe(true);
    });
  });
});
