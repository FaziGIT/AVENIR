import { Router, Request, Response, NextFunction } from 'express';
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

export const investmentRoutes = (investmentController: InvestmentController, userRepository: UserRepository) => {
    const router = Router();

    const directorOnly = createRoleMiddleware(userRepository, UserRole.DIRECTOR);

    // GET /stocks - Get all active stocks
    router.get('/stocks', authMiddleware, (req, res) => {
        return investmentController.getStocks(req, res);
    });

    // GET /portfolio - Get user portfolio
    router.get('/portfolio', authMiddleware, (req, res) => {
        return investmentController.getPortfolio(req, res);
    });

    // GET /trades/recent - Get recent trades
    router.get('/trades/recent', authMiddleware, async (req: Request, res: Response) => {
        try {
            getRecentTradesQuerySchema.parse(req.query);
            return investmentController.getRecentTrades(req, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // GET /balance - Get user balance
    router.get('/balance', authMiddleware, (req, res) => {
        return investmentController.getBalance(req, res);
    });

    // POST /purchase - Purchase stock
    router.post('/purchase', authMiddleware, async (req: Request, res: Response) => {
        try {
            const validatedData = purchaseStockSchema.parse(req.body);
            req.body = validatedData;
            return investmentController.purchaseStock(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // POST /order - Place order
    router.post('/order', authMiddleware, async (req: Request, res: Response) => {
        try {
            const validatedData = placeOrderSchema.parse(req.body);
            req.body = validatedData;
            return investmentController.placeOrder(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // GET /orderbook/:stockId - Get order book for stock
    router.get('/orderbook/:stockId', authMiddleware, async (req: Request, res: Response) => {
        try {
            stockIdParamSchema.parse(req.params);
            return investmentController.getOrderBook(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // GET /trades/:stockId - Get trades for stock
    router.get('/trades/:stockId', authMiddleware, async (req: Request, res: Response) => {
        try {
            stockIdParamSchema.parse(req.params);
            getStockTradesQuerySchema.parse(req.query);
            return investmentController.getStockTrades(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // DELETE /order/:orderId - Cancel order
    router.delete('/order/:orderId', authMiddleware, async (req: Request, res: Response) => {
        try {
            orderIdParamSchema.parse(req.params);
            return investmentController.cancelOrder(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // GET /orders - Get user orders
    router.get('/orders', authMiddleware, async (req: Request, res: Response) => {
        try {
            getUserOrdersQuerySchema.parse(req.query);
            return investmentController.getUserOrders(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // GET /prices/:stockId - Get stock prices
    router.get('/prices/:stockId', authMiddleware, async (req: Request, res: Response) => {
        try {
            stockIdParamSchema.parse(req.params);
            getStockPricesQuerySchema.parse(req.query);
            return investmentController.getStockPrices(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // GET /portfolio/history - Get portfolio history
    router.get('/portfolio/history', authMiddleware, async (req: Request, res: Response) => {
        try {
            getPortfolioHistoryQuerySchema.parse(req.query);
            return investmentController.getPortfolioHistory(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // GET /profits/breakdown - Get profits breakdown
    router.get('/profits/breakdown', authMiddleware, async (req: Request, res: Response) => {
        try {
            getProfitsBreakdownQuerySchema.parse(req.query);
            return investmentController.getProfitsBreakdown(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // ADMIN ROUTES - Protected with directorOnly middleware

    // GET /admin/stocks - Get all stocks (admin)
    router.get('/admin/stocks', authMiddleware, directorOnly, (req, res) => {
        return investmentController.getAllStocksAdmin(req, res);
    });

    // POST /admin/stocks - Create stock (admin)
    router.post('/admin/stocks', authMiddleware, directorOnly, async (req: Request, res: Response) => {
        try {
            const validatedData = createStockApiSchema.parse(req.body);
            req.body = validatedData;
            return investmentController.createStock(req, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // PUT /admin/stocks/:id - Update stock (admin)
    router.put('/admin/stocks/:id', authMiddleware, directorOnly, async (req: Request, res: Response) => {
        try {
            stockIdAdminParamSchema.parse(req.params);
            const bodyData = req.body as Record<string, any>;
            updateStockApiSchema.parse({ id: req.params.id, ...bodyData });
            return investmentController.updateStock(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    // DELETE /admin/stocks/:id - Delete stock (admin)
    router.delete('/admin/stocks/:id', authMiddleware, directorOnly, async (req: Request, res: Response) => {
        try {
            stockIdAdminParamSchema.parse(req.params);
            return investmentController.deleteStock(req as any, res);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues[0]?.message || 'Invalid request data',
                    details: error.issues,
                });
            }
            throw error;
        }
    });

    return router;
};
