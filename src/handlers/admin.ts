import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { appState } from "../state.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { ForbiddenError } from "../errors/http.js";

export function handlerServerHits(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${appState.fileserverHits} times!</p>
  </body>
</html>`);
}

export async function handlerServerReset(req: Request, res: Response, next: NextFunction) {
  try {
    if (config.platform !== "dev") {
      throw new ForbiddenError("Forbidden");
    }
    appState.fileserverHits = 0;
    await deleteAllUsers();
    res.status(200).send("OK");
  } catch (err) {
    next(err);
  }
}
