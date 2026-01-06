import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/UserController';
import { RegisterUserRequest, LoginUserRequest } from '../../../../application/requests';
import { registrationSchema, loginSchema } from '@avenir/shared';
import { ZodError } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';

export const userRoutes = (userController: UserController) => {
    const router = Router();

    router.get('/users', authMiddleware, (req, res) => {
        return userController.getUsers(req as any, res);
    });

    router.get('/users/:id', authMiddleware, (req, res) => {
        return userController.getUser(req as any, res);
    });

    router.post('/users', authMiddleware, (req, res) => {
        return userController.addUser(req as any, res);
    });

    router.post('/register', async (req: Request<{}, {}, RegisterUserRequest>, res: Response) => {
        try {
            req.body = registrationSchema.parse(req.body);
            return userController.registerUser(req, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    router.post('/login', async (req: Request<{}, {}, LoginUserRequest>, res: Response) => {
        try {
            req.body = loginSchema.parse(req.body);
            return userController.loginUser(req, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    router.get('/verify-email', async (req: Request<{}, {}, {}, { token: string }>, res: Response) => {
        if (!req.query.token) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Token is required',
            });
        }
        return userController.verifyEmail(req, res);
    });

    router.get('/advisors/:advisorId/clients', authMiddleware, (req, res) => {
        return userController.getAdvisorClients(req as any, res);
    });

    router.get('/advisors/:advisorId/clients/:clientId/check', authMiddleware, (req, res) => {
        return userController.checkClientAdvisor(req as any, res);
    });

    return router;
};
