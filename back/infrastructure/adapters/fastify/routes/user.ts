import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { UserController } from '../controllers/UserController';
import { RegisterUserRequest, LoginUserRequest } from '../../../../application/requests';
import { registrationSchema, loginSchema } from '@avenir/shared';
import { ZodError } from 'zod';
import {authMiddleware} from "../middleware/authMiddleware";

export async function userRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions & { userController: UserController }
) {
    const { userController } = options;

    fastify.get(
        '/users',
        { preHandler: authMiddleware },
        async (request, reply) => {
            return userController.getUsers(request as any, reply);
        }
    );

    fastify.get(
        '/users/:id',
        { preHandler: authMiddleware },
        async (request, reply) => {
            return userController.getUser(request as any, reply);
        }
    );

    fastify.post(
        '/users',
        { preHandler: authMiddleware },
        async (request, reply) => {
            return userController.addUser(request as any, reply);
        }
    );

    fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterUserRequest }>, reply: FastifyReply) => {
        try {
            request.body = registrationSchema.parse(request.body);
            return userController.registerUser(request, reply);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues
                });
            }
            throw error;
        }
    });

    fastify.post('/login', async (request: FastifyRequest<{ Body: LoginUserRequest }>, reply: FastifyReply) => {
        try {
            request.body = loginSchema.parse(request.body);
            return userController.loginUser(request, reply);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues
                });
            }
            throw error;
        }
    });

    fastify.get('/verify-email', async (request: FastifyRequest<{ Querystring: { token: string } }>, reply: FastifyReply) => {
        if (!request.query.token) {
            return reply.code(400).send({
                error: 'Validation error',
                message: 'Token is required'
            });
        }
        return userController.verifyEmail(request, reply);
    });

    fastify.get(
        '/advisors/:advisorId/clients',
        { preHandler: authMiddleware },
        async (request, reply) => {
            return userController.getAdvisorClients(request as any, reply);
        }
    );

    fastify.get(
        '/directors/:directorId/clients',
        { preHandler: authMiddleware },
        async (request, reply) => {
            return userController.getAllClientsWithDetails(request as any, reply);
        }
    );

    fastify.get(
        '/advisors/:advisorId/clients/:clientId/check',
        { preHandler: authMiddleware },
        async (request, reply) => {
            return userController.checkClientAdvisor(request as any, reply);
        }
    );

    fastify.put(
        '/users/:userId/ban',
        { preHandler: authMiddleware },
        async (request, reply) => {
            return userController.banUser(request as any, reply);
        }
    );

    fastify.put(
        '/users/:userId/activate',
        { preHandler: authMiddleware },
        async (request, reply) => {
            return userController.activateUser(request as any, reply);
        }
    );

    fastify.delete(
        '/users/:userId',
        {
            preHandler: authMiddleware,
            schema: {
                body: {
                    type: 'object',
                    required: ['transferIBAN'],
                    properties: {
                        transferIBAN: { type: 'string' }
                    }
                }
            }
        },
        async (request, reply) => {
            return userController.deleteUser(request as any, reply);
        }
    );
}
