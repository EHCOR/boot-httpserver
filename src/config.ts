import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export type DBConfig = {
  readonly url: string;
  readonly migrationConfig: MigrationConfig;
};

const migrationConfig: MigrationConfig = {
    migrationsFolder: "src/db/migrations",
};

const dbConfig: DBConfig = {
  url: requireEnv("DB_URL"),
  migrationConfig: migrationConfig,
};

export const config = {
  db: dbConfig,
  platform: requireEnv("PLATFORM"),
  jwtSecret: requireEnv("JWT_SECRET"),
} as const;
