import {defineConfig} from 'drizzle-kit';
import {config} from './src/config';

const {db: {url}} = config;

export default defineConfig({
    schema: './src/db/schema.ts',
    out: "src/db/migrations",
    dialect: 'postgresql',
    dbCredentials: {
        url: url
    }
});