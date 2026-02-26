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
app.post("/admin/reset", handlerServerReset);
app.post("/api/validate_chirp", handleValidateChirp);

function handleValidateChirp(req: Request, res: Response) {
  let maxLength = 140;
  type responseDataValid = {
    valid: boolean;
  }
  type responseDataError = {
    error: string;
  }

  let body = "";

  req.on("data",(chunk) => {
    body += chunk;
  })

  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      if (data.body.length > maxLength){
        res.status(400).send({ error: "Chirp is too long"} as responseDataError);
        return;
      } else {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ valid: true } as responseDataValid);
      }

    } catch (err) {
      res.status(400).send({ error: "Something went wrong" } as responseDataError);
      return;
    }
  });


}

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