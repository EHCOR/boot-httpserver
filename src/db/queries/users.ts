import {db} from "../index.js";
import { NewUser, users } from "../schema.js";
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

export async function updateUser(id: string, email: string, hashed_password: string) {
    const [result] = await db
        .update(users)
        .set({ email, hashed_password })
        .where(eq(users.id, id))
        .returning();
    return result;
}

export async function upgradeUserToChirpyRed(id: string) {
    const [result] = await db
        .update(users)
        .set({ isChirpyRed: true })
        .where(eq(users.id, id))
        .returning();
    return result;
}

export async function getUserById(id: string) {
    const result = await db
    .select()
    .from(users)
    .where(eq(users.id,(id)));
    return result[0];
}