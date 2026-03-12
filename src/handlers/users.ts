import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";

export async function handleCreateUser(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const result = await createUser({ email });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}