import Fastify from 'fastify';
import { healthRoutes } from './routes/health';
import { userRoutes } from './routes/user';
import { UserController } from './controllers/UserController';
import { GetUserUseCase } from '../../../application/usecases/user/GetUserUseCase';
import { InMemoryUserRepository } from '../../../infrastructure/repositories/InMemoryUserRepository';
import { AddUserUseCase } from '../../../application/usecases/user/AddUserUseCase';

const fastify = Fastify({ logger: true });

// Injection de dépendances - Clean Architecture
const userRepository = new InMemoryUserRepository();
const getUserUseCase = new GetUserUseCase(userRepository);
const addUserUseCase = new AddUserUseCase(userRepository);
const userController = new UserController(getUserUseCase, addUserUseCase);

// Déclaration des routes
async function setupRoutes() {
    await fastify.register(healthRoutes);
    await fastify.register(userRoutes, { userController });
}

// Démarrage du serveur
const start = async () => {
    try {
        await setupRoutes();
        await fastify.listen({ port: 3000 });
        console.log(`Serveur démarré sur http://localhost:3000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

