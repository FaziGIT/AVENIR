import { Request, Response } from 'express';
import { CreateNewsUseCase } from '@avenir/application/usecases/news/CreateNewsUseCase';
import { GetAllNewsUseCase } from '@avenir/application/usecases/news/GetAllNewsUseCase';
import { GetNewsByIdUseCase } from '@avenir/application/usecases/news/GetNewsByIdUseCase';
import { DeleteNewsUseCase } from '@avenir/application/usecases/news/DeleteNewsUseCase';
import { CreateNewsRequest } from '@avenir/application/requests/CreateNewsRequest';
import { GetAllNewsRequest } from '@avenir/application/requests/GetAllNewsRequest';
import { GetNewsByIdRequest } from '@avenir/application/requests/GetNewsByIdRequest';
import { DeleteNewsRequest } from '@avenir/application/requests/DeleteNewsRequest';
import { ValidationError } from '@avenir/application/errors';
import { NewsNotFoundError, UserNotFoundError, UnauthorizedNewsAccessError } from '@avenir/domain/errors';
import {
  createNewsSchema,
  deleteNewsParamsSchema,
  getAllNewsSchema,
} from '@avenir/shared/schemas/news.schema';
import { ZodError } from 'zod';

export class NewsController {
  constructor(
    private readonly createNewsUseCase: CreateNewsUseCase,
    private readonly getAllNewsUseCase: GetAllNewsUseCase,
    private readonly getNewsByIdUseCase: GetNewsByIdUseCase,
    private readonly deleteNewsUseCase: DeleteNewsUseCase
  ) {}

  async createNews(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const validatedData = createNewsSchema.parse({
        title: req.body.title,
        description: req.body.description,
      });

      const createNewsRequest: CreateNewsRequest = new CreateNewsRequest(
        validatedData.title,
        validatedData.description,
        req.user.userId,
        ''
      );

      const response = await this.createNewsUseCase.execute(createNewsRequest);

      // La notification SSE est gérée dans CreateNewsUseCase
      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.issues
            .map((e: any) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        });
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.message,
        });
      }

      console.error('Erreur lors de la création de l\'actualité:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getAllNews(req: Request, res: Response) {
    try {
      const validatedData = getAllNewsSchema.parse(req.query);
      const getAllNewsRequest = new GetAllNewsRequest(
        validatedData.limit,
        validatedData.offset
      );

      const response = await this.getAllNewsUseCase.execute(getAllNewsRequest);

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.issues
            .map((e: any) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        });
      }

      console.error('Erreur lors de la récupération des actualités:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getNewsById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const getNewsByIdRequest = new GetNewsByIdRequest(req.params.newsId);

      const response = await this.getNewsByIdUseCase.execute(getNewsByIdRequest);

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof NewsNotFoundError) {
        return res.status(404).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteNews(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const validatedParams = deleteNewsParamsSchema.parse({
        newsId: req.params.newsId,
      });

      const deleteNewsRequest = new DeleteNewsRequest(
        validatedParams.newsId,
        req.user.userId
      );

      await this.deleteNewsUseCase.execute(deleteNewsRequest);

      // La notification SSE est gérée dans DeleteNewsUseCase
      return res.status(204).send();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.issues
            .map((e: any) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        });
      }

      if (error instanceof NewsNotFoundError) {
        return res.status(404).json({
          error: error.message,
        });
      }

      if (error instanceof UserNotFoundError) {
        return res.status(404).json({
          error: error.message,
        });
      }

      if (error instanceof UnauthorizedNewsAccessError) {
        return res.status(403).json({
          error: error.message,
        });
      }

      console.error('Erreur lors de la suppression de l\'actualité:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
