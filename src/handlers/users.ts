import { Request, Response } from "express";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, hashPassword } from "../middleware/auth.js";
import { users } from "../db/schema.js";
import { makeJWT } from "../middleware/auth.js";
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
try {
    const email = req.body.email;
    const password = req.body.password;
    const expiresInSeconds = req.body.expiresInSeconds ? (req.body.expiresInSeconds > 3600 ? 3600 : req.body.expiresInSeconds) : 3600;
    
    const user = await getUserByEmail(email);
    const passMatch = await checkPasswordHash(password, user.hashed_password);
    if (passMatch) {
      const token = makeJWT(user.id, expiresInSeconds, config.jwtSecret);
      const { hashed_password, ...safeUser } = user;
        res.status(200).json({ ...safeUser, token } satisfies SafeUser & { token: string });
    } else {
        res.status(401).json({ message: "incorrect email or password" });
    }

} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Failed to login user" });
}

}