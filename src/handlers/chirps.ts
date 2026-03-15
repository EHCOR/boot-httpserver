import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/http.js";
import { createChirp, getAllChirps, getChirpById } from "../db/queries/chirps.js";

type ValidateChirpRequestBody = {
  body: string;
};

const bannedWords = ["kerfuffle", "sharbert", "fornax"];
const maxLength = 140;

export async function handlerAddChirp(req: Request, res: Response, next: NextFunction) {
  try {
    const data: ValidateChirpRequestBody = req.body;

    if (data.body.length > maxLength) {
      next(new BadRequestError("Chirp is too long. Max length is 140"));
      return;
    }

    const originalBody = data.body.split(" ");
    const words = data.body.toLowerCase().split(" ");

    for (const [index, word] of words.entries()) {
      if (bannedWords.includes(word)) {
        originalBody[index] = "****";
      }
    }

    const userId = req.body.userId;
    const result = await createChirp({ body: originalBody.join(" "), userId });
    
    res.setHeader("Content-Type", "application/json");
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handlerGetAllChirps(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getAllChirps();
    res.setHeader("Content-Type", "application/json");
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
      res.status(404).json({ error: "Chirp not found" });
      return;
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}