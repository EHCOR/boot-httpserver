import { describe, it, expect, beforeAll } from "vitest";
import {makeJWT, validateJWT, hashPassword, checkPasswordHash, getBearerToken, getAPIKey} from "../src/auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT", () => {
  const userId = "user-123";
  const secret = "test-secret";

  it("should return the userId from a valid token", () => {
    const token = makeJWT(userId, 3600, secret);
    const result = validateJWT(token, secret);
    expect(result).toBe(userId);
  });

  it("should throw when validating with the wrong secret", () => {
    const token = makeJWT(userId, 3600, secret);
    expect(() => validateJWT(token, "wrong-secret")).toThrow("Invalid token");
  });

  it("should throw for an expired token", async () => {
    const token = makeJWT(userId, -1, secret); // expired 1 second ago
    expect(() => validateJWT(token, secret)).toThrow("Invalid token");
  });

  it("should throw for a malformed token", () => {
    expect(() => validateJWT("not.a.valid.token", secret)).toThrow("Invalid token");
  });
});

describe("Bearer Token Extraction", () => {
  it("should extract the token from a valid Authorization header", () => {
    const req = {
      get: (header: string) => header === "Authorization" ? "Bearer valid-token" : undefined
    } as any;
    const token = getBearerToken(req);
    expect(token).toBe("valid-token");
  });

  it("should throw if the Authorization header is missing", () => {
    const req = {
      get: (header: string) => undefined
    } as any;
    expect(() => getBearerToken(req)).toThrow("No Authorization header");
  });

  it("should throw if the Authorization header is malformed", () => {
    const req = {
        get: (header: string) => header === "Authorization" ? "InvalidHeaderFormat" : undefined
    } as any;
    expect(() => getBearerToken(req)).toThrow("Invalid Authorization header format");
  });
});

describe("API Key Extraction", () => {
  it("should extract the API key from a valid Authorization header", () => {
    const req = {
      get: (header: string) => header === "Authorization" ? "ApiKey valid-api-key" : undefined
    } as any;
    const apiKey = getAPIKey(req);
    expect(apiKey).toBe("valid-api-key");
  });

  it("should throw if the Authorization header is missing", () => {
    const req = {
      get: (header: string) => undefined
    } as any;
    expect(() => getAPIKey(req)).toThrow("No Authorization header");
  });

  it("should throw if the Authorization header is malformed", () => {
    const req = {
        get: (header: string) => header === "Authorization" ? "InvalidHeaderFormat" : undefined
    } as any;
    expect(() => getAPIKey(req)).toThrow("Invalid Authorization header format");
  });
});