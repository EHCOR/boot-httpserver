import { NextFunction, Request, Response } from "express";
import { createUser, getUserByEmail, updateUser } from "../db/queries/users.js";
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from "../db/queries/refreshTokens.js";
import { checkPasswordHash, hashPassword, makeJWT, makeRefreshToken, JWT_EXPIRY_SECONDS, getBearerToken, validateJWT } from "../auth.js";
import { users } from "../db/schema.js";
import { config } from "../config.js";
import { createUserSchema, loginUserSchema, updateUserSchema, parseBody } from "../validation.js";
import { UnauthorizedError } from "../errors/http.js";

type User = typeof users.$inferSelect;
type SafeUser = Omit<User, "hashed_password">;

export async function handlerCreateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = parseBody(createUserSchema, req.body);
    const hashedPassword = await hashPassword(parsed.password);
    const result = await createUser({ email: parsed.email, hashed_password: hashedPassword });
    const { hashed_password, ...safeUser } = result;
    res.status(201).json(safeUser satisfies SafeUser);
  } catch (err) {
    next(err);
  }
}

export async function handlerLoginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = parseBody(loginUserSchema, req.body);

    const user = await getUserByEmail(parsed.email);
    if (!user) {
      throw new UnauthorizedError("incorrect email or password");
    }
    const passMatch = await checkPasswordHash(parsed.password, user.hashed_password);
    if (!passMatch) {
      throw new UnauthorizedError("incorrect email or password");
    }

    const token = makeJWT(user.id, JWT_EXPIRY_SECONDS, config.jwtSecret);
    const refreshToken = makeRefreshToken();
    await createRefreshToken({ token: refreshToken, userId: user.id });
    const { hashed_password, ...safeUser } = user;
    res.status(200).json({ ...safeUser, token, refreshToken } satisfies SafeUser & { token: string, refreshToken: string });
  } catch (err) {
    next(err);
  }
}

export async function handlerRevokeToken(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = getBearerToken(req);
    const tokenRecord = await getRefreshToken(refreshToken);
    if (!tokenRecord) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    await revokeRefreshToken(refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function handlerUpdateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwtSecret);
    const parsed = parseBody(updateUserSchema, req.body);
    const hashedPassword = await hashPassword(parsed.password);
    const result = await updateUser(userId, parsed.email, hashedPassword);
    const { hashed_password, ...safeUser } = result;
    res.status(200).json(safeUser satisfies SafeUser);
  } catch (err) {
    next(err);
  }
}

export async function handlerRefreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = getBearerToken(req);

    const tokenRecord = await getRefreshToken(refreshToken);
    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const token = makeJWT(tokenRecord.userId, JWT_EXPIRY_SECONDS, config.jwtSecret);
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
}
