import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/authMiddleware';

export const notificationRoutes = (notificationController: NotificationController) => {
  const router = Router();

  router.get('/', authMiddleware, (req, res) => {
    return notificationController.getNotifications(req, res);
  });

  router.post('/', authMiddleware, (req, res) => {
    return notificationController.createCustomNotification(req, res);
  });

  router.put('/:notificationId/read', authMiddleware, (req, res) => {
    return notificationController.markAsRead(req, res);
  });

  router.put('/mark-all-read', authMiddleware, (req, res) => {
    return notificationController.markAllAsRead(req, res);
  });

  router.delete('/:notificationId', authMiddleware, (req, res) => {
    return notificationController.deleteNotification(req, res);
  });

  return router;
};

