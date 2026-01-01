import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { userRoutes } from './routes/user';
import { authRoutes } from './routes/auth';
import { chatRoutes } from './routes/chat';
import { messageRoutes } from './routes/message';
import { websocketRoutes } from './routes/websocket';
import { investmentRoutes } from './routes/investment';
import { UserController } from './controllers/UserController';
import { InvestmentController } from './controllers/InvestmentController';
import { ChatController } from './controllers/ChatController';
import { MessageController } from './controllers/MessageController';
import { GetUserUseCase } from '@avenir/application/usecases/user/GetUserUseCase';
import { GetUsersUseCase } from '@avenir/application/usecases/user/GetUsersUseCase';
import { AddUserUseCase } from '@avenir/application/usecases/user/AddUserUseCase';
import { RegisterUserUseCase } from '@avenir/application/usecases/user/RegisterUserUseCase';
import { VerifyEmailUseCase } from '@avenir/application/usecases/user/VerifyEmailUseCase';
import { LoginUserUseCase } from '@avenir/application/usecases/user/LoginUserUseCase';
import { NodemailerEmailService } from '../../adapters/email/NodemailerEmailService';
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
import { OrderMatchingService } from '@avenir/application/services/OrderMatchingService';

const fastify = Fastify({
    logger: true
});

const dbContext = RepositoryFactory.createDatabaseContext();

// User
const userRepository = dbContext.userRepository;
const accountRepository = dbContext.accountRepository;
const emailService = new NodemailerEmailService();
const getUserUseCase = new GetUserUseCase(userRepository);
const getUsersUseCase = new GetUsersUseCase(userRepository);
const addUserUseCase = new AddUserUseCase(userRepository);
const registerUserUseCase = new RegisterUserUseCase(userRepository, accountRepository, emailService);
const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, emailService);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const userController = new UserController(getUserUseCase, getUsersUseCase, addUserUseCase, registerUserUseCase, verifyEmailUseCase, loginUserUseCase);

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

// Investment
const stockRepository = dbContext.stockRepository;
const portfolioRepository = dbContext.portfolioRepository;
const tradeRepository = dbContext.tradeRepository;
const orderBookRepository = dbContext.orderBookRepository;
const orderMatchingService = new OrderMatchingService(orderBookRepository, tradeRepository, portfolioRepository, accountRepository, stockRepository, userRepository);
const investmentController = new InvestmentController(stockRepository, portfolioRepository, tradeRepository, accountRepository, userRepository, orderBookRepository, orderMatchingService);

async function setupRoutes() {
    await fastify.register(cors, {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    });

    await fastify.register(fastifyCookie);
    await fastify.register(fastifyWebsocket);

    await fastify.register(healthRoutes, { prefix: '/api' });
    await fastify.register(userRoutes, { prefix: '/api', userController });
    await fastify.register(authRoutes, { prefix: '/api/auth', userController });
    await fastify.register(chatRoutes, { prefix: '/api', chatController, messageRepository, chatRepository });
    await fastify.register(messageRoutes, { prefix: '/api', messageController });
    await fastify.register(websocketRoutes, { prefix: '/api' });
    await fastify.register(investmentRoutes, { prefix: '/api/investment', investmentController, userRepository });
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
        await dbContext.close();
        await fastify.close();
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
