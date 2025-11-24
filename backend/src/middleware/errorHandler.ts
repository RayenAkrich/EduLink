import { Request, Response, NextFunction } from "express";
import { getErrorMessage } from "../utils";

export default function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // La réponse est déjà envoyée -> on laisse Express gérer
    if (res.headersSent) {
        return next(error);
    }

    // Réponse d'erreur
    res.status(500).json({
        error: {
            message: getErrorMessage(error),
        },
    });
}
