import express from "express";
import { Request, Response } from "express";

type Middleware = (req: Request, res: Response, next: () => void) => void;