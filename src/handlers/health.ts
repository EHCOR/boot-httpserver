import { Request, Response } from "express";

export function handlerReadiness(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send("OK");
}