# Boot.dev HTTP Server course

A REST API built with Express, TypeScript, Drizzle ORM, and PostgreSQL.

## Setup

```bash
npm install
```

Create a `.env` file in the project root with the following variables:

```env
DB_URL="postgresql://user:password@localhost:port/dbname?sslmode=disable"
PLATFORM="dev"
JWT_SECRET="sekret"
```

See `src/config.ts` for details.

## Development

```bash
npm run dev
```

## Database Migrations

Generate a new migration after changing `src/db/schema.ts`:

```bash
npx drizzle-kit generate
```

Run migrations:

```bash
npx drizzle-kit migrate
```

## Testing

Tests use [Vitest](https://vitest.dev/).

```bash
npm test
```

## Build & Run

```bash
npm run build
npm start
```
