import { Router, Request, Response } from 'express';
import { SSEService } from '../../services/SSEService';
import { authMiddleware } from '../middleware/authMiddleware';
import { RepositoryFactory } from '../../../factories/RepositoryFactory';

export const sseRoutes = (sseService: SSEService) => {
  const router = Router();
  const userRepository = RepositoryFactory.createUserRepository();

  // Route SSE avec authentification
  router.get('/sse', authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
      }

      const fullUser = await userRepository.getById(user.userId);
      if (!fullUser) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found'
        });
      }

      sseService.registerClient(fullUser.id, fullUser.role, res);
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to establish SSE connection'
      });
    }
  });

  return router;
};
