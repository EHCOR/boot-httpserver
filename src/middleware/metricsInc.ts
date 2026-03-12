import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
  const isAppPath = req.path === "/app" || req.path.startsWith("/app/");
  if (isAppPath) {
    config.fileserverHits++;
  }
  next();
}