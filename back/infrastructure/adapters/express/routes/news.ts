import { Router } from 'express';
import { NewsController } from '../controllers/NewsController';
import { authMiddleware } from '../middleware/authMiddleware';

export const newsRoutes = (newsController: NewsController) => {
  const router = Router();

  router.post('/', authMiddleware, (req, res) => {
    return newsController.createNews(req, res);
  });

  router.get('/', authMiddleware, (req, res) => {
    return newsController.getAllNews(req, res);
  });

  router.get('/:newsId', authMiddleware, (req, res) => {
    return newsController.getNewsById(req, res);
  });

  router.delete('/:newsId', authMiddleware, (req, res) => {
    return newsController.deleteNews(req, res);
  });

  return router;
};
