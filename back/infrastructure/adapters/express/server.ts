import 'dotenv/config';
import express, { Express } from 'express';
import { createServer } from 'http';
import expressWs from 'express-ws';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { healthRoutes } from './routes/health';
import { userRoutes } from './routes/user';
import { authRoutes } from './routes/auth';
import { chatRoutes } from './routes/chat';
import { messageRoutes } from './routes/message';
import { accountRoutes } from './routes/account';
import { newsRoutes } from './routes/news';
import { websocketRoutes } from './routes/websocket';
import { sseRoutes } from './routes/sse';
import { investmentRoutes } from './routes/investment';
import { UserController } from './controllers/UserController';
import { InvestmentController } from './controllers/InvestmentController';
import { ChatController } from './controllers/ChatController';
import { MessageController } from './controllers/MessageController';
import { AccountController } from './controllers/AccountController';
import { NewsController } from './controllers/NewsController';
import { GetUserUseCase } from '@avenir/application/usecases/user/GetUserUseCase';
import { GetUsersUseCase } from '@avenir/application/usecases/user/GetUsersUseCase';
import { AddUserUseCase } from '@avenir/application/usecases/user/AddUserUseCase';
import { RegisterUserUseCase } from '@avenir/application/usecases/user/RegisterUserUseCase';
import { VerifyEmailUseCase } from '@avenir/application/usecases/user/VerifyEmailUseCase';
import { LoginUserUseCase } from '@avenir/application/usecases/user/LoginUserUseCase';
import { GetAdvisorClientsWithChatsAndLoansUseCase } from '@avenir/application/usecases/user/GetAdvisorClientsWithChatsAndLoansUseCase';
import { CheckClientAdvisorUseCase } from '@avenir/application/usecases/user/CheckClientAdvisorUseCase';
import { NodemailerEmailService } from '../email/NodemailerEmailService';
import { CreateChatUseCase } from '@avenir/application/usecases/chat/CreateChatUseCase';
import { GetChatsUseCase } from '@avenir/application/usecases/chat/GetChatsUseCase';
import { GetChatMessagesUseCase } from '@avenir/application/usecases/chat/GetChatMessagesUseCase';
import { TransferChatUseCase } from '@avenir/application/usecases/chat/TransferChatUseCase';
import { SendMessageUseCase } from '@avenir/application/usecases/chat/SendMessageUseCase';
import { CloseChatUseCase } from '@avenir/application/usecases/chat/CloseChatUseCase';
import { CreateNewsUseCase } from '@avenir/application/usecases/news/CreateNewsUseCase';
import { GetAllNewsUseCase } from '@avenir/application/usecases/news/GetAllNewsUseCase';
import { GetNewsByIdUseCase } from '@avenir/application/usecases/news/GetNewsByIdUseCase';
import { DeleteNewsUseCase } from '@avenir/application/usecases/news/DeleteNewsUseCase';
import { CreateNotificationUseCase } from '@avenir/application/usecases/notification/CreateNotificationUseCase';
import { GetNotificationsUseCase } from '@avenir/application/usecases/notification/GetNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '@avenir/application/usecases/notification/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '@avenir/application/usecases/notification/MarkAllNotificationsAsReadUseCase';
import { DeleteNotificationUseCase } from '@avenir/application/usecases/notification/DeleteNotificationUseCase';
import { CreateLoanUseCase } from '@avenir/application/usecases/loan/CreateLoanUseCase';
import { GetClientLoansUseCase } from '@avenir/application/usecases/loan/GetClientLoansUseCase';
import { DeliverLoanUseCase } from '../../../application/usecases/loan/DeliverLoanUseCase';
import { ProcessMonthlyPaymentsUseCase } from '@avenir/application/usecases/loan/ProcessMonthlyPaymentsUseCase';
import { LoanPaymentScheduler } from '../schedulers/LoanPaymentScheduler';
import { NotificationController } from './controllers/NotificationController';
import { LoanController } from './controllers/LoanController';
import { notificationRoutes } from './routes/notification';
import { loanRoutes } from './routes/loan';
import { RepositoryFactory } from '../../factories/RepositoryFactory';
import { GetChatByIdUseCase } from '@avenir/application/usecases/chat/GetChatByIdUseCase';
import { MarkMessageAsReadUseCase } from '@avenir/application/usecases/chat/MarkMessageAsReadUseCase';
import { MarkChatMessagesAsReadUseCase } from '@avenir/application/usecases/chat/MarkChatMessagesAsReadUseCase';
import { AddAccountUseCase } from '@avenir/application/usecases/account/AddAccountUseCase';
import { DeleteAccountUseCase } from '@avenir/application/usecases/account/DeleteAccountUseCase';
import { UpdateAccountNameUseCase } from '@avenir/application/usecases/account/UpdateAccountNameUseCase';
import { GetAccountsUseCase } from '@avenir/application/usecases/account/GetAccountsUseCase';
import { OrderMatchingService } from '@avenir/application/services/OrderMatchingService';
import { SSEService } from '../services/SSEService';

const app: Express = express();
const server = createServer(app);
const { app: wsApp } = expressWs(app, server);

const dbContext = RepositoryFactory.createDatabaseContext();

// Services
const sseService = new SSEService();

// Repositories
const userRepository = dbContext.userRepository;
const accountRepository = dbContext.accountRepository;
const chatRepository = dbContext.chatRepository;
const messageRepository = dbContext.messageRepository;
const newsRepository = dbContext.newsRepository;
const notificationRepository = dbContext.notificationRepository;
const loanRepository = dbContext.loanRepository;

// User
const emailService = new NodemailerEmailService();
const getUserUseCase = new GetUserUseCase(userRepository);
const getUsersUseCase = new GetUsersUseCase(userRepository);
const addUserUseCase = new AddUserUseCase(userRepository);
const registerUserUseCase = new RegisterUserUseCase(userRepository, accountRepository, emailService);
const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, emailService);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const getAdvisorClientsWithChatsAndLoansUseCase = new GetAdvisorClientsWithChatsAndLoansUseCase(
    userRepository,
    chatRepository,
    loanRepository,
    messageRepository
);
const checkClientAdvisorUseCase = new CheckClientAdvisorUseCase(userRepository);
const userController = new UserController(
    getUserUseCase,
    getUsersUseCase,
    addUserUseCase,
    registerUserUseCase,
    verifyEmailUseCase,
    loginUserUseCase,
    getAdvisorClientsWithChatsAndLoansUseCase,
    checkClientAdvisorUseCase
);

// Chat
const createChatUseCase = new CreateChatUseCase(chatRepository, messageRepository, userRepository);
const getChatsUseCase = new GetChatsUseCase(chatRepository, messageRepository, userRepository);
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
    messageRepository,
    userRepository
);

const messageController = new MessageController(sendMessageUseCase, markMessageAsReadUseCase, chatRepository);

// Account
const addAccountUseCase = new AddAccountUseCase(accountRepository, userRepository);
const deleteAccountUseCase = new DeleteAccountUseCase(accountRepository);
const updateAccountNameUseCase = new UpdateAccountNameUseCase(accountRepository);
const getAccountsUseCase = new GetAccountsUseCase(accountRepository);
const accountController = new AccountController(
    addAccountUseCase,
    deleteAccountUseCase,
    updateAccountNameUseCase,
    getAccountsUseCase
);

// Investment
const stockRepository = dbContext.stockRepository;
const portfolioRepository = dbContext.portfolioRepository;
const tradeRepository = dbContext.tradeRepository;
const orderBookRepository = dbContext.orderBookRepository;
const orderMatchingService = new OrderMatchingService(
    orderBookRepository,
    tradeRepository,
    portfolioRepository,
    accountRepository,
    stockRepository,
    userRepository
);
const investmentController = new InvestmentController(
    stockRepository,
    portfolioRepository,
    tradeRepository,
    accountRepository,
    userRepository,
    orderBookRepository,
    orderMatchingService
);

// News
const createNewsUseCase = new CreateNewsUseCase(newsRepository, userRepository, notificationRepository, sseService);
const getAllNewsUseCase = new GetAllNewsUseCase(newsRepository);
const getNewsByIdUseCase = new GetNewsByIdUseCase(newsRepository);
const deleteNewsUseCase = new DeleteNewsUseCase(newsRepository, userRepository, sseService);
const newsController = new NewsController(createNewsUseCase, getAllNewsUseCase, getNewsByIdUseCase, deleteNewsUseCase);

// Notifications
const createNotificationUseCase = new CreateNotificationUseCase(notificationRepository, sseService);
const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notificationRepository);
const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(notificationRepository);
const deleteNotificationUseCase = new DeleteNotificationUseCase(notificationRepository);
const notificationController = new NotificationController(
    createNotificationUseCase,
    getNotificationsUseCase,
    markNotificationAsReadUseCase,
    markAllNotificationsAsReadUseCase,
    deleteNotificationUseCase
);

// Loans
const deliverLoanUseCase = new DeliverLoanUseCase(loanRepository, accountRepository, createNotificationUseCase);
const processMonthlyPaymentsUseCase = new ProcessMonthlyPaymentsUseCase(
    loanRepository,
    accountRepository,
    createNotificationUseCase,
    sseService
);
const createLoanUseCase = new CreateLoanUseCase(
    loanRepository,
    userRepository,
    sseService,
    deliverLoanUseCase,
    createNotificationUseCase
);
const getClientLoansUseCase = new GetClientLoansUseCase(loanRepository);
const loanController = new LoanController(
    createLoanUseCase,
    getClientLoansUseCase,
    processMonthlyPaymentsUseCase,
    userRepository
);
const loanPaymentScheduler = new LoanPaymentScheduler(processMonthlyPaymentsUseCase);
loanPaymentScheduler.start();

function setupMiddlewares() {
    // CORS
    app.use(
        cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );

    // Body parsers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Cookie parser
    app.use(cookieParser());

    // Logger middleware
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

function setupRoutes() {
    app.use('/api', healthRoutes);
    app.use('/api', userRoutes(userController));
    app.use('/api/auth', authRoutes(userController));
    app.use('/api', chatRoutes(chatController, messageRepository, chatRepository));
    app.use('/api', messageRoutes(messageController));
    app.use('/api', accountRoutes(accountController));
    app.use('/api/news', newsRoutes(newsController));
    app.use('/api', notificationRoutes(notificationController));
    app.use('/api/loans', loanRoutes(loanController));
    app.use('/api', websocketRoutes());
    app.use('/api/investment', investmentRoutes(investmentController, userRepository));
    app.use('/api', sseRoutes(sseService));
}

const start = async () => {
    try {
        setupMiddlewares();
        setupRoutes();

        const port = parseInt(process.env.PORT || '3001', 10);
        server.listen(port, '0.0.0.0', () => {
            console.log(`[Express] Server listening on http://0.0.0.0:${port}`);
        });
    } catch (err) {
        console.error('[Express] Error starting server:', err);
        process.exit(1);
    }
};

const shutdown = async () => {
    try {
        console.log('[Express] Shutting down gracefully...');
        loanPaymentScheduler.stop();
        await dbContext.close();
        server.close(() => {
            console.log('[Express] Server closed');
            process.exit(0);
        });
    } catch (err) {
        console.error('[Express] Error during shutdown:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
