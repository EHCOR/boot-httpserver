import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

export const userss = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").
    notNull().defaultNow().$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).notNull().unique()
    }
);

export type NewUser = typeof userss.$inferInsert;