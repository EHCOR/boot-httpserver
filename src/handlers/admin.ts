import { Request, Response } from "express";
import { config } from "../config";

export function handlerServerHits(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
}

export function handlerServerReset(req: Request, res: Response) {
  config.fileserverHits = 0;
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send("OK");
}