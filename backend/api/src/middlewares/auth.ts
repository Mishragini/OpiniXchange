import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
    token?: string;
}

export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.authToken;

        if (!token) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }

        req.token = token;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};