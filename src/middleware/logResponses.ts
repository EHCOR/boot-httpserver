import { NextFunction, Request, Response } from "express";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    console.log(`[NON-OK] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
  });
  next();
}