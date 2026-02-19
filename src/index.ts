import express from "express";
import { NextFunction, Request, Response } from "express";
import { APIConfig } from "./config";

const app = express();
const PORT = 8080;

const config: APIConfig = {
  fileserverHits: 0,
};

app.use(middlewareLogResponses);
app.use(middlewareMetricsInc);
app.use("/app",express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerServerHits);
app.get("/admin/reset", handlerServerReset);

function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    console.log(`[NON-OK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
  });
  next();
}

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  const isAppPath = req.path === "/app" || req.path.startsWith("/app/");
  if (isAppPath) {
    config.fileserverHits++;
  }
  next();
}

function handlerReadiness(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send("OK");
}

function handlerServerHits(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
}

function handlerServerReset(req: Request, res: Response) {
  config.fileserverHits = 0;
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send("OK");
}