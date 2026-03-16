import { Request, Response } from "express";
import { createUser, getUserByEmail, createRefreshToken, getRefreshToken, revokeRefreshToken } from "../db/queries/users.js";
import { checkPasswordHash, hashPassword } from "../middleware/auth.js";
import { users } from "../db/schema.js";
import { makeJWT , makeRefreshToken, getBearerToken} from "../middleware/auth.js";
import { config } from "../config.js";

type User = typeof users.$inferSelect;
type SafeUser = Omit<User, "hashed_password">;

export async function handlerCreateUser(req: Request, res: Response) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const hashedPassword = await hashPassword(password);
    const result = await createUser({ email, hashed_password: hashedPassword });
    const { hashed_password, ...safeUser } = result;
    res.status(201).json(safeUser satisfies SafeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

export async function handlerLoginUser(req: Request, res: Response) {
  const JWT_EXPIRY_SECONDS = 3600; // 1 hour
try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await getUserByEmail(email);
    const passMatch = await checkPasswordHash(password, user.hashed_password);
    if (passMatch) {
      const token = makeJWT(user.id, JWT_EXPIRY_SECONDS, config.jwtSecret);
      const refreshToken = makeRefreshToken();
      await createRefreshToken({ token: refreshToken, userId: user.id });
      const { hashed_password, ...safeUser } = user;
        res.status(200).json({ ...safeUser, token, refreshToken } satisfies SafeUser & { token: string, refreshToken: string });
    } else {
        res.status(401).json({ message: "incorrect email or password" });
    }

} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Failed to login user" });
}

}

export async function handlerRevokeToken(req: Request, res: Response) {
  try {
    const refreshToken = getBearerToken(req);
    await revokeRefreshToken(refreshToken);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to revoke token" });
  }
}

export async function handlerRefreshToken(req: Request, res: Response) {
  try {
    const refreshToken = getBearerToken(req);
    if (!refreshToken) {
      res.status(401).json({ error: "No refresh token provided" });
      return;
    }

    const tokenRecord = await getRefreshToken(refreshToken);
    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const token = makeJWT(tokenRecord.userId, 3600, config.jwtSecret);
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
}