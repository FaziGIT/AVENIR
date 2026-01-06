import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { authMiddleware } from '../middleware/authMiddleware';

export const messageRoutes = (messageController: MessageController) => {
  const router = Router();

  router.post('/', authMiddleware, (req, res) => {
    return messageController.sendMessage(req, res);
  });

  router.put('/:messageId/read', authMiddleware, (req, res) => {
    return messageController.markAsRead(req, res);
  });

  return router;
};
