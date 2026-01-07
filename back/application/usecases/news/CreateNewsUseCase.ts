import { NewsRepository } from '@avenir/domain/repositories/NewsRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { NotificationRepository } from '@avenir/domain/repositories/NotificationRepository';
import { CreateNewsRequest } from '../../requests/CreateNewsRequest';
import { NewsResponse } from '../../responses/NewsResponse';
import { NotificationResponse } from '../../responses/NotificationResponse';
import { News } from '@avenir/domain/entities/News';
import { Notification } from '@avenir/domain/entities/Notification';
import { UserRole, NotificationType } from '@avenir/shared/enums';
import { UserNotFoundError } from '@avenir/domain/errors';
import { ValidationError } from '../../errors';
import { randomUUID } from 'crypto';
import { SSEService } from '@avenir/infrastructure/adapters/services/SSEService';

export class CreateNewsUseCase {
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly sseService: SSEService
  ) {}

  async execute(request: CreateNewsRequest): Promise<NewsResponse> {
    const user = await this.userRepository.getById(request.authorId);

    if (!user) {
      throw new UserNotFoundError(request.authorId);
    }

    if (user.role !== UserRole.ADVISOR) {
      throw new ValidationError('Only advisors can create news');
    }

    const newsId = randomUUID();
    const now = new Date();
    const authorName = `${user.firstName} ${user.lastName}`;

    const news = new News(
      newsId,
      request.title,
      request.description,
      request.authorId,
      authorName,
      now,
      now
    );

    const createdNews = await this.newsRepository.addNews(news);

    const newsResponse = NewsResponse.fromNews(createdNews);
    this.sseService.notifyNewsCreated(newsResponse.toApiDto());

    try {
      const allUsers = await this.userRepository.getAll();
      const clients = allUsers.filter((u) => u.role === UserRole.CLIENT);

      const notificationPromises = clients.map(async (client) => {
        const notification = new Notification(
          randomUUID(),
          client.id,
          'Nouvelle actualité',
          request.title,
          NotificationType.NEWS,
          authorName,
          false,
          now,
          newsId
        );

        const createdNotification = await this.notificationRepository.addNotification(notification);

        const notificationResponse = NotificationResponse.fromNotification(createdNotification);
        this.sseService.notifyNotificationCreated(client.id, notificationResponse.toWebSocketPayload());

        return createdNotification;
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error creating notifications for news:', error);
    }

    return newsResponse;
  }
}
