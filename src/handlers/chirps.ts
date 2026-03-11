import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/http";

type ValidateChirpRequestBody = {
  body: string;
};

const bannedWords = ["kerfuffle", "sharbert", "fornax"];
const maxLength = 140;

export function handleValidateChirp(req: Request, res: Response, next: NextFunction) {
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

    const responseBody = originalBody.join(" ");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ cleanedBody: responseBody });
  } catch (err) {
    next(err);
  }
}