import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authMiddleware } from '../middleware/authMiddleware';

export const chatRoutes = (chatController: ChatController) => {
  const router = Router();

  router.post('/', authMiddleware, (req, res) => {
    return chatController.createChat(req, res);
  });

  router.get('/', authMiddleware, (req, res) => {
    return chatController.getChats(req, res);
  });

  router.get('/:chatId', authMiddleware, (req, res) => {
    return chatController.getChatById(req, res);
  });

  router.get('/:chatId/messages', authMiddleware, (req, res) => {
    return chatController.getChatMessages(req, res);
  });

  router.put('/:chatId/transfer', authMiddleware, (req, res) => {
    return chatController.assignOrTransferChat(req, res);
  });

  router.put('/:chatId/assign', authMiddleware, (req, res) => {
    return chatController.assignOrTransferChat(req, res);
  });

  router.put('/:chatId/messages/read', authMiddleware, (req, res) => {
    return chatController.markChatMessagesAsRead(req, res);
  });

  router.put('/:chatId/close', authMiddleware, (req, res) => {
    return chatController.closeChat(req, res);
  });

  return router;
};
