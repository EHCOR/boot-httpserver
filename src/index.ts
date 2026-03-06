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
app.use(express.json());
app.use("/app",express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerServerHits);
app.post("/admin/reset", handlerServerReset);
app.post("/api/validate_chirp", handleValidateChirp);

app.use(middlewareErrorHandler);

function handleValidateChirp(req: Request, res: Response, next: NextFunction) {
  let maxLength = 140;

  type requestData = {
    body: string;
  }
  try {
  const data: requestData = req.body;

  if (data.body.length > maxLength){
    // res.status(400).send({ error: "Chirp is too long"});
    // return;
    next(new Error("Chirp is too long"));
  } else {
    let orgBody = data.body.split(" ");
    let words = data.body.toLowerCase().split(" ");
    if (words.includes("kerfuffle") || words.includes("sharbert") || words.includes("fornax")){
      for  (let nword in words){
        if (words[nword] === "kerfuffle" || words[nword] === "sharbert" || words[nword] === "fornax"){
          orgBody[nword] = "****";
        }
      }
    }
    let responseBody = orgBody.join(" ");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ cleanedBody: responseBody });
    }

  } catch (err) {
    next(err);
  }

}

function middlewareErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.log(err);
  res.status(500).json({ "error": "Something went wrong on our end"});
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