import { Request, Response } from 'express';
import { CreateNotificationUseCase } from '@avenir/application/usecases/notification/CreateNotificationUseCase';
import { GetNotificationsUseCase } from '@avenir/application/usecases/notification/GetNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '@avenir/application/usecases/notification/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '@avenir/application/usecases/notification/MarkAllNotificationsAsReadUseCase';
import { DeleteNotificationUseCase } from '@avenir/application/usecases/notification/DeleteNotificationUseCase';
import { NotificationResponse } from '@avenir/application/responses/NotificationResponse';
import { sendNotificationSchema } from '@avenir/shared/schemas/notification.schema';
import { z } from 'zod';

export class NotificationController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase
  ) {}

  async getNotifications(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const notifications = await this.getNotificationsUseCase.execute(
        req.user.userId
      );

      const notificationsResponse = NotificationResponse.fromNotifications(notifications);

      return res.status(200).json(notificationsResponse);
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      await this.markNotificationAsReadUseCase.execute(
        req.params.notificationId
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      await this.markAllNotificationsAsReadUseCase.execute(req.user.userId);

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      await this.deleteNotificationUseCase.execute(req.params.notificationId);

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createCustomNotification(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const { title, message, type } = sendNotificationSchema.parse(req.body);
      const { userId, advisorName } = req.body;

      const notification = await this.createNotificationUseCase.execute(
        userId,
        title,
        message,
        type as any,
        advisorName || null,
        null
      );

      const notificationResponse = NotificationResponse.fromNotification(notification);

      // La notification SSE est gérée dans CreateNotificationUseCase

      return res.status(201).json(notificationResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
