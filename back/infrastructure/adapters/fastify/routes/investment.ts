import { FastifyInstance } from 'fastify';
import { InvestmentController } from '../controllers/InvestmentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { createRoleMiddleware } from '../middleware/roleMiddleware';
import { UserRepository } from '../../../../domain/repositories/UserRepository';
import { UserRole } from '@avenir/shared/enums/UserRole';
import { ZodError } from 'zod';
import {
    purchaseStockSchema,
    placeOrderSchema,
    cancelOrderSchema,
    getUserOrdersQuerySchema,
    getStockPricesQuerySchema,
    getPortfolioHistoryQuerySchema,
    getProfitsBreakdownQuerySchema,
    getRecentTradesQuerySchema,
    getStockTradesQuerySchema,
    stockIdParamSchema,
    orderIdParamSchema,
    stockIdAdminParamSchema,
    createStockApiSchema,
    updateStockApiSchema,
} from '@avenir/shared';

interface InvestmentRoutesOptions {
    investmentController: InvestmentController;
    userRepository: UserRepository;
}

export async function investmentRoutes(fastify: FastifyInstance, options: InvestmentRoutesOptions) {
    const { investmentController, userRepository } = options;

    const directorOnly = createRoleMiddleware(userRepository, UserRole.DIRECTOR);

    fastify.get<{ Querystring: never }>(
        '/stocks',
        { preHandler: authMiddleware },
        async (request, reply) => investmentController.getStocks(request, reply)
    );

    fastify.get<{ Querystring: never }>(
        '/portfolio',
        { preHandler: authMiddleware },
        async (request, reply) => investmentController.getPortfolio(request, reply)
    );

    fastify.get<{ Querystring: { limit?: string } }>(
        '/trades/recent',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedQuery = getRecentTradesQuerySchema.parse(request.query);
                request.query = validatedQuery as any;
                return investmentController.getRecentTrades(request, reply);
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
        }
    );

    fastify.get<{ Querystring: never }>(
        '/balance',
        { preHandler: authMiddleware },
        async (request, reply) => investmentController.getBalance(request, reply)
    );

    fastify.post<{ Body: { stockId: string; quantity: number } }>(
        '/purchase',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedData = purchaseStockSchema.parse(request.body);
                request.body = validatedData;
                return investmentController.purchaseStock(request, reply);
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
        }
    );

    fastify.post<{
        Body: {
            stockId: string;
            side: 'BID' | 'ASK';
            type: 'MARKET' | 'LIMIT' | 'STOP';
            quantity: number;
            limitPrice?: number;
        }
    }>(
        '/order',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedData = placeOrderSchema.parse(request.body);
                request.body = validatedData;
                return investmentController.placeOrder(request, reply);
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
        }
    );

    fastify.get<{ Params: { stockId: string } }>(
        '/orderbook/:stockId',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedParams = stockIdParamSchema.parse(request.params);
                request.params = validatedParams;
                return investmentController.getOrderBook(request, reply);
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
        }
    );

    fastify.get<{ Params: { stockId: string }; Querystring: { limit?: string } }>(
        '/trades/:stockId',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedParams = stockIdParamSchema.parse(request.params);
                const validatedQuery = getStockTradesQuerySchema.parse(request.query);
                request.params = validatedParams;
                request.query = validatedQuery as any;
                return investmentController.getStockTrades(request, reply);
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
        }
    );

    fastify.delete<{ Params: { orderId: string } }>(
        '/order/:orderId',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedParams = orderIdParamSchema.parse(request.params);
                request.params = validatedParams;
                return investmentController.cancelOrder(request, reply);
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
        }
    );

    fastify.get<{ Querystring: { stockId?: string; state?: string } }>(
        '/orders',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedQuery = getUserOrdersQuerySchema.parse(request.query);
                request.query = validatedQuery as any;
                return investmentController.getUserOrders(request, reply);
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
        }
    );

    fastify.get<{ Params: { stockId: string }; Querystring: { period?: string } }>(
        '/prices/:stockId',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedParams = stockIdParamSchema.parse(request.params);
                const validatedQuery = getStockPricesQuerySchema.parse(request.query);
                request.params = validatedParams;
                request.query = validatedQuery as any;
                return investmentController.getStockPrices(request, reply);
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
        }
    );

    fastify.get<{ Querystring: { period?: string } }>(
        '/portfolio/history',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedQuery = getPortfolioHistoryQuerySchema.parse(request.query);
                request.query = validatedQuery as any;
                return investmentController.getPortfolioHistory(request, reply);
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
        }
    );

    fastify.get<{ Querystring: { period?: string } }>(
        '/profits/breakdown',
        { preHandler: authMiddleware },
        async (request, reply) => {
            try {
                const validatedQuery = getProfitsBreakdownQuerySchema.parse(request.query);
                request.query = validatedQuery as any;
                return investmentController.getProfitsBreakdown(request, reply);
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
        }
    );

    fastify.get<{ Querystring: never }>(
        '/admin/stocks',
        { preHandler: [authMiddleware, directorOnly] },
        async (request, reply) => investmentController.getAllStocksAdmin(request, reply)
    );

    fastify.post<{ Body: any }>(
        '/admin/stocks',
        { preHandler: [authMiddleware, directorOnly] },
        async (request, reply) => {
            try {
                const validatedData = createStockApiSchema.parse(request.body);
                request.body = validatedData;
                return investmentController.createStock(request, reply);
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
        }
    );

    fastify.put<{ Params: { id: string }; Body: any }>(
        '/admin/stocks/:id',
        { preHandler: [authMiddleware, directorOnly] },
        async (request, reply) => {
            try {
                const validatedParams = stockIdAdminParamSchema.parse(request.params);
                const bodyData = request.body as Record<string, any>;
                const validatedData = updateStockApiSchema.parse({ id: validatedParams.id, ...bodyData });
                request.params = validatedParams;
                request.body = validatedData;
                return investmentController.updateStock(request, reply);
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
        }
    );

    fastify.delete<{ Params: { id: string } }>(
        '/admin/stocks/:id',
        { preHandler: [authMiddleware, directorOnly] },
        async (request, reply) => {
            try {
                const validatedParams = stockIdAdminParamSchema.parse(request.params);
                request.params = validatedParams;
                return investmentController.deleteStock(request, reply);
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
        }
    );
}
