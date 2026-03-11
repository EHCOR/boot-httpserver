import express from "express";
import { handlerReadiness } from "./handlers/health";
import { handlerServerHits, handlerServerReset } from "./handlers/admin";
import { handleValidateChirp } from "./handlers/chirps";
import { middlewareLogResponses } from "./middleware/logResponses";
import { middlewareMetricsInc } from "./middleware/metricsInc";
import { middlewareErrorHandler } from "./middleware/errorHandler";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config";

process.loadEnvFile();

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);


const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use(middlewareMetricsInc);
app.use(express.json());
app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerServerHits);
app.post("/admin/reset", handlerServerReset);
app.post("/api/validate_chirp", handleValidateChirp);

app.use(middlewareErrorHandler);
