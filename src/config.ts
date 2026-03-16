import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

export type APIConfig = {
  fileserverHits: number;
  platform: string;
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

export const config: APIConfig & { db: DBConfig; jwtSecret: string } = {
  db: dbConfig,
  fileserverHits: 0,
  platform: process.env.PLATFORM || '',
  jwtSecret: process.env.JWT_SECRET || '',
};