import {db} from "../index.js";
import { NewUser, NewRefreshToken, users, refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
    const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
    return result;
}

export async function deleteAllUsers() {
    await db.delete(users);
}

export async function getUserByEmail(email: string) {
    const result = await db
    .select()
    .from(users)
    .where(eq(users.email,(email)));
    return result[0];
}

export async function createRefreshToken(data: NewRefreshToken) {
    const [result] = await db
    .insert(refreshTokens)
    .values(data)
    .returning();
    return result;
}

export async function getRefreshToken(token: string) {
    const result = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
    return result[0];
}

export async function revokeRefreshToken(token: string) {
    await db
    .update(refreshTokens)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(eq(refreshTokens.token, token));
}

export async function getUserFromRefreshToken(token: string) {
    const result = await db
    .select({ user: users })
    .from(refreshTokens)
    .innerJoin(users, eq(refreshTokens.userId, users.id))
    .where(eq(refreshTokens.token, token));
    return result[0]?.user;
}

