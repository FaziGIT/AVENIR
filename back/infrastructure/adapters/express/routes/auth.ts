import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/authMiddleware';

export const authRoutes = (userController: UserController) => {
    const router = Router();

    // Get current authenticated user
    router.get('/me', authMiddleware, (req, res) => {
        return userController.getCurrentUser(req, res);
    });

    // Logout
    router.post('/logout', (req, res) => {
        return userController.logout(req, res);
    });

    // Refresh access token
    router.post('/refresh', (req, res) => {
        return userController.refreshToken(req, res);
    });

    return router;
};
