import Fastify from 'fastify';
import { healthRoutes } from './routes/health';
import { userRoutes } from './routes/user';
import { UserController } from './controllers/UserController';
import { GetUserUseCase } from '../../../application/usecases/user/GetUserUseCase';
import { AddUserUseCase } from '../../../application/usecases/user/AddUserUseCase';
import { RepositoryFactory } from '../../factories/RepositoryFactory';
import { databaseConfig } from '../../config/database.config';

const fastify = Fastify({ logger: true });
const dbContext = RepositoryFactory.createDatabaseContext();

const userRepository = dbContext.userRepository;
const getUserUseCase = new GetUserUseCase(userRepository);
const addUserUseCase = new AddUserUseCase(userRepository);
const userController = new UserController(getUserUseCase, addUserUseCase);

async function setupRoutes() {
    await fastify.register(healthRoutes);
    await fastify.register(userRoutes, { userController });
}

const start = async () => {
    try {
        await setupRoutes();
        await fastify.listen({ port: 3000 });
        console.log(`🚀 Serveur http://localhost:3000 (${databaseConfig.type})`);
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
    } catch {
        process.exit(1);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
