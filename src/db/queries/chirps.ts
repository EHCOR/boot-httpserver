import {db} from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { asc, eq , desc} from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
    const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
    return result;
}

export async function deleteAllChirps() {
    await db.delete(chirps);
}

export async function getAllChirps(filter: { userId?: string, sortOrder?: "asc" | "desc" } = {}) {
    const query = db
    .select()
    .from(chirps)
    .orderBy(filter.sortOrder === "desc" ? desc(chirps.createdAt) : asc(chirps.createdAt));

    if (filter?.userId) {
        query.where(eq(chirps.userId, filter.userId));
    }

    return await query;
}

export async function getChirpById(id: string) {
    const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id));
    return result;
}

export async function deleteChirp(id: string) {
    await db
    .delete(chirps)
    .where(eq(chirps.id, id));
}