import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import crypto from "crypto";
import { UnauthorizedError } from "../errors/http.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, password);
}

export function makeJWT(userId: string, expiresIn: number, secret: string): string {
    const payload: payload = {
        iss: "httpserver",
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn
    };
    return jwt.sign(payload, secret);
}

export function validateJWT(token: string, secret: string): string {
  try {
    const decoded = jwt.verify(token, secret) as payload;
    if (!decoded.sub) {
      throw new UnauthorizedError("Invalid token");
    }
    return decoded.sub;
  } catch (err) {
    throw new UnauthorizedError("Invalid token");
  }
}

export function getBearerToken(req: Request): string {
    const bearer = req.get("Authorization");
    if (!bearer) {
        throw new UnauthorizedError("No Authorization header");
    }
    const parts = bearer.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        throw new UnauthorizedError("Invalid Authorization header format");
    }
    return parts[1];
}

export function makeRefreshToken(): string {
    const randomBytes = crypto.randomBytes(32).toString("hex");
    return randomBytes;
}