import { NotFoundError } from "../errors/http.js";
import { getUserById, upgradeUserToChirpyRed } from "../db/queries/users.js";
import { NextFunction, Request, Response } from "express";

export async function handlerPolkaUserUpgradeEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = req.body.event;
        if (event !== "user.upgraded") {
            return res.status(204).send();
        }
        const userId = req.body.data.userId;
        const user = await getUserById(userId);
        if (user === undefined) {
            throw new NotFoundError("User not found");
        }
        await upgradeUserToChirpyRed(userId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}