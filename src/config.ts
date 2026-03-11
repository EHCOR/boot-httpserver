import type { MigrationConfig } from "drizzle-orm/migrator";

export type APIConfig = {
  fileserverHits: number;
};

export type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

const migrationConfig: MigrationConfig = {
    migrationsFolder: "src/db/migrations",
};

const dbConfig: DBConfig = {
  url: process.env.DB_URL || '',
  migrationConfig: migrationConfig,
};

export const config: APIConfig & { db: DBConfig } = {
  db: dbConfig,
  fileserverHits: 0,
};