import { pgTable, timestamp, varchar, uuid, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").
    notNull().defaultNow().$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).notNull().unique(),
    hashed_password: varchar("hashed_password", { length: 256 }).notNull().default("unset"),
    isChirpyRed: boolean("is_chirpy_red").notNull().default(false),    
}
);

export type NewUser = typeof users.$inferInsert;

export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").
    notNull().defaultNow().$onUpdate(() => new Date()),
    body: varchar("body", {}).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull()
    }
);

export type NewChirp = typeof chirps.$inferInsert;

export const refreshTokens = pgTable("refresh_tokens", {
    token: varchar("token", { length: 512 }).primaryKey(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    expiresAt: timestamp("expires_at").notNull()
    .$defaultFn(() => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)), // default to 60 days from now
    revokedAt: timestamp("revoked_at")
});

export type NewRefreshToken = typeof refreshTokens.$inferInsert;