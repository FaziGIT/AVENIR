import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../../auth/JwtService';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Create JwtService inside the middleware to ensure env vars are loaded
        const jwtService = new JwtService();

        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Access token missing',
            });
        }

        const payload = jwtService.verifyAccessToken(accessToken);

        if (!payload) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired access token',
            });
        }

        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication failed',
        });
    }
};
