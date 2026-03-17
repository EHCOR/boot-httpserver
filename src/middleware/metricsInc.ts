import { NextFunction, Request, Response } from "express";
import { appState } from "../state.js";

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  const isAppPath = req.path === "/app" || req.path.startsWith("/app/");
  if (isAppPath) {
    appState.fileserverHits++;
  }
  next();
}
