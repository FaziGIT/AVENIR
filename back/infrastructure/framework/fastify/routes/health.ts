import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
    fastify.get('/health', async (request, reply) => {
        return reply.code(200).send({ 
            status: 'ok',
            timestamp: new Date().toISOString()
        });
    });
}


