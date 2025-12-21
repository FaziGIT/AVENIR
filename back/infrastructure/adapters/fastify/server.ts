import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { userRoutes } from './routes/user';
import { chatRoutes } from './routes/chat';
import { messageRoutes } from './routes/message';
import { websocketRoutes } from './routes/websocket';
import { UserController } from './controllers/UserController';
import { ChatController } from './controllers/ChatController';
import { MessageController } from './controllers/MessageController';
import { GetUserUseCase } from '@avenir/application/usecases/user/GetUserUseCase';
import { GetUsersUseCase } from '@avenir/application/usecases/user/GetUsersUseCase';
import { AddUserUseCase } from '@avenir/application/usecases/user/AddUserUseCase';
import { CreateChatUseCase } from '@avenir/application/usecases/chat/CreateChatUseCase';
import { GetChatsUseCase } from '@avenir/application/usecases/chat/GetChatsUseCase';
import { GetChatMessagesUseCase } from '@avenir/application/usecases/chat/GetChatMessagesUseCase';
import { TransferChatUseCase } from '@avenir/application/usecases/chat/TransferChatUseCase';
import { SendMessageUseCase } from '@avenir/application/usecases/chat/SendMessageUseCase';
import { CloseChatUseCase } from '@avenir/application/usecases/chat/CloseChatUseCase';
import { RepositoryFactory } from '../../factories/RepositoryFactory';
import { GetChatByIdUseCase } from "@avenir/application/usecases/chat/GetChatByIdUseCase";
import { MarkMessageAsReadUseCase } from "@avenir/application/usecases/chat/MarkMessageAsReadUseCase";
import { MarkChatMessagesAsReadUseCase } from "@avenir/application/usecases/chat/MarkChatMessagesAsReadUseCase";

const fastify = Fastify({
    logger: true
});

const dbContext = RepositoryFactory.createDatabaseContext();

// User
const userRepository = dbContext.userRepository;
const getUserUseCase = new GetUserUseCase(userRepository);
const getUsersUseCase = new GetUsersUseCase(userRepository);
const addUserUseCase = new AddUserUseCase(userRepository);
const userController = new UserController(getUserUseCase, getUsersUseCase, addUserUseCase);

// Chat
const chatRepository = dbContext.chatRepository;
const messageRepository = dbContext.messageRepository;

const createChatUseCase = new CreateChatUseCase(chatRepository, messageRepository, userRepository);
const getChatsUseCase = new GetChatsUseCase(chatRepository, messageRepository);
const getChatByIdUseCase = new GetChatByIdUseCase(chatRepository, messageRepository);
const getChatMessagesUseCase = new GetChatMessagesUseCase(chatRepository, messageRepository);
const markChatMessagesAsReadUseCase = new MarkChatMessagesAsReadUseCase(chatRepository, messageRepository);
const transferChatUseCase = new TransferChatUseCase(chatRepository, userRepository, messageRepository);
const closeChatUseCase = new CloseChatUseCase(chatRepository);
const sendMessageUseCase = new SendMessageUseCase(chatRepository, messageRepository, userRepository);
const markMessageAsReadUseCase = new MarkMessageAsReadUseCase(messageRepository);

const chatController = new ChatController(
    createChatUseCase,
    getChatsUseCase,
    getChatByIdUseCase,
    getChatMessagesUseCase,
    markChatMessagesAsReadUseCase,
    transferChatUseCase,
    closeChatUseCase,
    chatRepository,
    messageRepository
);

const messageController = new MessageController(sendMessageUseCase, markMessageAsReadUseCase, chatRepository);

async function setupRoutes() {
    await fastify.register(cors, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    });

    // Enregistrer le plugin WebSocket
    await fastify.register(fastifyWebsocket);

    // Routes API REST
    await fastify.register(healthRoutes, { prefix: '/api' });
    await fastify.register(userRoutes, { prefix: '/api', userController });
    await fastify.register(chatRoutes, { prefix: '/api', chatController, messageRepository, chatRepository });
    await fastify.register(messageRoutes, { prefix: '/api', messageController });

    // Route WebSocket
    await fastify.register(websocketRoutes, { prefix: '/api' });
}

const start = async () => {
    try {
        await setupRoutes();
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

const shutdown = async () => {
    try {
        console.log('Arrêt du serveur...');
        await dbContext.close();
        await fastify.close();
        console.log('Serveur arrêté proprement');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de l\'arrêt:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
