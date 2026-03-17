import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/http.js";
import { createChirp, getAllChirps, getChirpById } from "../db/queries/chirps.js";
import { validateJWT, getBearerToken } from "../auth.js";
import { config } from "../config.js";
import { createChirpSchema, parseBody } from "../validation.js";

const bannedWords = ["kerfuffle", "sharbert", "fornax"];

export async function handlerAddChirp(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwtSecret);
    const parsed = parseBody(createChirpSchema, req.body);

    const originalBody = parsed.body.split(" ");
    const words = parsed.body.toLowerCase().split(" ");

    for (const [index, word] of words.entries()) {
      if (bannedWords.includes(word)) {
        originalBody[index] = "****";
      }
    }
    const result = await createChirp({ body: originalBody.join(" "), userId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handlerGetAllChirps(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getAllChirps();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handlerGetChirpById(req: Request, res: Response, next: NextFunction) {
  try {
    const { chirpId } = req.params;
    const result = await getChirpById(String(chirpId));

    if (!result) {
      throw new NotFoundError("Chirp not found");
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
