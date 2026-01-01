import { FastifyRequest, FastifyReply } from 'fastify';
import { StockRepository } from '@avenir/domain/repositories/StockRepository';
import { PortfolioRepository } from '@avenir/domain/repositories/PortfolioRepository';
import { TradeRepository } from '@avenir/domain/repositories/TradeRepository';
import { AccountRepository } from '@avenir/domain/repositories/AccountRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { OrderBookRepository } from '@avenir/domain/repositories/OrderBookRepository';
import { OrderBook } from '@avenir/domain/entities/OrderBook';
import { Portfolio } from '@avenir/domain/entities/Portfolio';
import { OrderSide } from '@avenir/domain/enumerations/OrderSide';
import { OrderBookType } from '@avenir/domain/enumerations/OrderBookType';
import { OrderBookState } from '@avenir/domain/enumerations/OrderBookState';
import { OrderMatchingService } from '@avenir/application/services/OrderMatchingService';
import { Stock } from '@avenir/domain/entities/Stock';
import { v4 as uuidv4 } from 'uuid';

export class InvestmentController {
    private readonly TRANSACTION_FEE = 1;

    constructor(
        private stockRepository: StockRepository,
        private portfolioRepository: PortfolioRepository,
        private tradeRepository: TradeRepository,
        private accountRepository: AccountRepository,
        private userRepository: UserRepository,
        private orderBookRepository: OrderBookRepository,
        private orderMatchingService: OrderMatchingService
    ) { }

    private generateISIN(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let isin = 'XX';

        for (let i = 0; i < 10; i++) {
            isin += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return isin;
    }

    private getStartDateByPeriod(period: string | undefined, allTrades: any[]): Date {
        const now = new Date();

        if (period === 'weekly') {
            now.setDate(now.getDate() - 7);
            return now;
        }

        if (period === 'monthly') {
            now.setMonth(now.getMonth() - 1);
            return now;
        }

        if (allTrades.length > 0) {
            const sortedTrades = [...allTrades].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            return sortedTrades[0].createdAt;
        }

        now.setFullYear(now.getFullYear() - 1);
        return now;
    }

    private async calculatePortfolioValueAtDate(userId: string, targetDate: Date): Promise<number> {
        const allUserTrades = await this.tradeRepository.getAll();
        const userTrades = allUserTrades.filter(t => t.buyer.id === userId || t.seller.id === userId);

        const tradesBeforeDate = userTrades.filter(t => t.createdAt <= targetDate);

        const holdings = new Map<string, { quantity: number }>();

        for (const trade of tradesBeforeDate) {
            const isBuy = trade.buyer.id === userId;
            const stockId = trade.stock.id;

            if (!holdings.has(stockId)) {
                holdings.set(stockId, { quantity: 0 });
            }

            const holding = holdings.get(stockId)!;

            if (isBuy) {
                holding.quantity += trade.quantity;
            } else {
                holding.quantity -= trade.quantity;
            }
        }

        let totalValue = 0;

        for (const [stockId, holding] of holdings.entries()) {
            if (holding.quantity > 0) {
                const stockTrades = userTrades.filter(t => t.stock.id === stockId && t.createdAt <= targetDate);

                if (stockTrades.length > 0) {
                    const sortedTrades = [...stockTrades].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                    const priceAtDate = sortedTrades[0].price;
                    totalValue += holding.quantity * priceAtDate;
                }
            }
        }

        return totalValue;
    }

    async getStocks(request: FastifyRequest, reply: FastifyReply) {
        try {
            const stocks = await this.stockRepository.getAllActive();
            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const stocksData = await Promise.all(stocks.map(async (stock) => {
                const trades = await this.tradeRepository.getByStockId(stock.id);

                let changePercent = 0;
                let change = 0;

                if (trades.length > 0) {
                    const tradesBeforeCutoff = trades.filter(t => t.createdAt <= twentyFourHoursAgo);
                    const referencePrice = tradesBeforeCutoff.length > 0
                        ? [...tradesBeforeCutoff].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].price
                        : [...trades].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0].price;

                    change = stock.currentPrice - referencePrice;
                    changePercent = (change / referencePrice) * 100;
                }

                return {
                    id: stock.id,
                    symbol: stock.symbol,
                    name: stock.name,
                    currentPrice: stock.currentPrice,
                    bestBid: stock.bestBid,
                    bestAsk: stock.bestAsk,
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2)),
                };
            }));

            return reply.status(200).send(stocksData);
        } catch (error) {
            console.error('Error fetching stocks:', error);
            return reply.status(500).send({ error: 'Failed to fetch stocks' });
        }
    }

    async getPortfolio(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;

            const portfolios = await this.portfolioRepository.getByUserId(userId);

            const positions = portfolios.map(portfolio => ({
                id: portfolio.id,
                stockId: portfolio.stock.id,
                symbol: portfolio.stock.symbol,
                name: portfolio.stock.name,
                quantity: portfolio.quantity,
                averageBuyPrice: portfolio.averageBuyPrice,
                currentPrice: portfolio.stock.currentPrice,
                totalInvested: portfolio.totalInvested,
                currentValue: portfolio.getCurrentValue(),
                profitLoss: portfolio.getProfitLoss(),
                profitLossPercent: portfolio.getProfitLossPercentage(),
            }));

            const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
            const totalInvested = positions.reduce((sum, pos) => sum + pos.totalInvested, 0);
            const totalProfitLoss = totalValue - totalInvested;
            const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

            let yesterdayIncome = 0;
            let yesterdayIncomePercent = 0;

            try {
                const mockRequest = {
                    user: request.user,
                    query: { period: 'weekly' }
                } as any;

                const mockReply = {
                    status: (code: number) => ({
                        send: (data: any) => data
                    })
                } as any;

                const historyResponse = await this.getPortfolioHistory(mockRequest, mockReply);
                const history = (historyResponse as any).history || [];

                if (history.length >= 2) {
                    const sortedHistory = [...history].sort((a: any, b: any) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                    const todayData = sortedHistory[0];
                    const yesterdayData = sortedHistory[1];

                    if (todayData && yesterdayData) {
                        yesterdayIncome = todayData.value - yesterdayData.value;
                        yesterdayIncomePercent = yesterdayData.value > 0
                            ? (yesterdayIncome / yesterdayData.value) * 100
                            : 0;
                    }
                } else if (history.length === 1) {
                    yesterdayIncome = totalValue - history[0].value;
                    yesterdayIncomePercent = history[0].value > 0
                        ? (yesterdayIncome / history[0].value) * 100
                        : 0;
                }
            } catch (error) {
                console.error('Error calculating yesterday income:', error);
                yesterdayIncome = 0;
                yesterdayIncomePercent = 0;
            }

            const portfolioSummary = {
                totalValue,
                totalInvested,
                totalProfitLoss,
                totalProfitLossPercent,
                yesterdayIncome,
                yesterdayIncomePercent,
                positions,
            };

            return reply.status(200).send(portfolioSummary);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            return reply.status(500).send({ error: 'Failed to fetch portfolio' });
        }
    }

    async getRecentTrades(request: FastifyRequest<{ Querystring: { limit?: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;

            const limit = request.query.limit ? parseInt(request.query.limit) : 20;
            const trades = await this.tradeRepository.getByUserId(userId);

            const recentTrades = trades.slice(0, limit).map(trade => ({
                id: trade.id,
                stockSymbol: trade.stock.symbol,
                quantity: trade.quantity,
                price: trade.price,
                totalValue: trade.getTotalValue(),
                type: trade.buyer.id === userId ? 'BUY' : 'SELL',
                createdAt: trade.createdAt,
            }));

            return reply.status(200).send(recentTrades);
        } catch (error) {
            console.error('Error fetching recent trades:', error);
            return reply.status(500).send({ error: 'Failed to fetch recent trades' });
        }
    }

    async getBalance(request: FastifyRequest, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;
            const accounts = await this.accountRepository.findByUserId(userId);

            const currentAccount = accounts.find(account => account.type === 'CURRENT');

            if (!currentAccount) {
                return reply.status(404).send({ error: 'Current account not found' });
            }

            return reply.status(200).send({
                balance: currentAccount.balance,
                currency: currentAccount.currency,
                accountId: currentAccount.id,
            });
        } catch (error) {
            console.error('Error fetching balance:', error);
            return reply.status(500).send({ error: 'Failed to fetch balance' });
        }
    }

    async purchaseStock(request: FastifyRequest<{ Body: { stockId: string; quantity: number } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;
            const { stockId, quantity } = request.body;

            const stock = await this.stockRepository.getById(stockId);
            if (!stock) {
                return reply.status(404).send({ error: 'Stock not found' });
            }

            // Security: Block trading on inactive stocks
            if (!stock.isActive) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: 'Cette action est désactivée et ne peut pas être tradée'
                });
            }

            const accounts = await this.accountRepository.findByUserId(userId);
            const currentAccount = accounts.find(account => account.type === 'CURRENT');

            if (!currentAccount) {
                return reply.status(404).send({ error: 'Current account not found' });
            }

            const totalCost = (stock.currentPrice * quantity) + this.TRANSACTION_FEE;

            if (currentAccount.balance < totalCost) {
                return reply.status(400).send({
                    error: 'Insufficient balance',
                    required: totalCost,
                    available: currentAccount.balance
                });
            }

            const user = await this.userRepository.getById(userId);
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }

            const now = new Date();

            const buyOrder = new OrderBook(
                uuidv4(),
                stock,
                user,
                OrderSide.BID,
                OrderBookType.MARKET,
                quantity,
                quantity,
                null,
                null,
                OrderBookState.PENDING,
                now,
                now
            );

            await this.orderBookRepository.add(buyOrder);

            await this.orderMatchingService.matchOrders(stockId);

            const updatedOrder = await this.orderBookRepository.getById(buyOrder.id);
            const updatedAccount = await this.accountRepository.findByUserId(userId);
            const newBalance = updatedAccount.find(account => account.type === 'CURRENT')?.balance || 0;

            return reply.status(200).send({
                success: true,
                message: 'Stock purchased successfully',
                trade: {
                    id: buyOrder.id,
                    stockSymbol: stock.symbol,
                    quantity,
                    price: stock.currentPrice,
                    totalCost,
                },
                newBalance,
                orderState: updatedOrder?.state || buyOrder.state,
            });
        } catch (error) {
            console.error('Error purchasing stock:', error);
            return reply.status(500).send({ error: 'Failed to purchase stock' });
        }
    }

    async placeOrder(request: FastifyRequest<{
        Body: {
            stockId: string;
            side: 'BID' | 'ASK';
            type: 'MARKET' | 'LIMIT' | 'STOP';
            quantity: number;
            limitPrice?: number;
        }
    }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;
            const { stockId, side, type, quantity, limitPrice } = request.body;

            const stock = await this.stockRepository.getById(stockId);
            if (!stock) {
                return reply.status(404).send({ error: 'Stock not found' });
            }

            // Security: Block trading on inactive stocks
            if (!stock.isActive) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: 'Cette action est désactivée et ne peut pas être tradée'
                });
            }

            const user = await this.userRepository.getById(userId);
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }

            if (side === 'BID') {
                const accounts = await this.accountRepository.findByUserId(userId);
                const currentAccount = accounts.find(account => account.type === 'CURRENT');

                if (!currentAccount) {
                    return reply.status(404).send({ error: 'Current account not found' });
                }

                const estimatedCost = (limitPrice || stock.currentPrice) * quantity + this.TRANSACTION_FEE;

                if (currentAccount.balance < estimatedCost) {
                    return reply.status(400).send({
                        error: 'Insufficient balance',
                        required: estimatedCost,
                        available: currentAccount.balance
                    });
                }
            }

            if (side === 'ASK') {
                const portfolio = await this.portfolioRepository.getByUserIdAndStockId(userId, stockId);

                if (!portfolio || portfolio.quantity < quantity) {
                    return reply.status(400).send({
                        error: 'Insufficient stock quantity',
                        required: quantity,
                        available: portfolio?.quantity || 0
                    });
                }
            }

            const orderPrice = type === 'MARKET' ? null : limitPrice!;
            const now = new Date();

            const order = new OrderBook(
                uuidv4(),
                stock,
                user,
                side === 'BID' ? OrderSide.BID : OrderSide.ASK,
                type === 'MARKET' ? OrderBookType.MARKET : OrderBookType.LIMIT,
                quantity,
                quantity,
                orderPrice,
                null,
                OrderBookState.PENDING,
                now,
                now
            );

            await this.orderBookRepository.add(order);
            await this.orderMatchingService.matchOrders(stockId);

            const updatedOrder = await this.orderBookRepository.getById(order.id);

            let warningMessage = null;
            let executedQuantity = quantity;

            if (updatedOrder) {
                executedQuantity = quantity - updatedOrder.remainingQuantity;

                if (type === OrderBookType.MARKET && updatedOrder.state === OrderBookState.CANCELLED && updatedOrder.remainingQuantity > 0) {
                    warningMessage = `Partial fill: Only ${executedQuantity.toFixed(2)} shares were executed. ${updatedOrder.remainingQuantity.toFixed(2)} shares cancelled due to insufficient liquidity.`;
                }
            }

            return reply.status(200).send({
                success: true,
                message: warningMessage || 'Order placed successfully',
                warning: warningMessage ? true : false,
                order: {
                    id: updatedOrder?.id || order.id,
                    stockSymbol: stock.symbol,
                    side,
                    type,
                    quantity,
                    executedQuantity,
                    limitPrice: orderPrice,
                    state: updatedOrder?.state || order.state,
                    remainingQuantity: updatedOrder?.remainingQuantity || order.remainingQuantity,
                }
            });
        } catch (error) {
            console.error('Error placing order:', error);
            return reply.status(500).send({ error: 'Failed to place order' });
        }
    }

    async getOrderBook(request: FastifyRequest<{ Params: { stockId: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const { stockId } = request.params;

            const stock = await this.stockRepository.getById(stockId);
            if (!stock) {
                return reply.status(404).send({ error: 'Stock not found' });
            }

            const bidOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.BID);
            const askOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.ASK);

            const activeBids = bidOrders
                .filter(order => order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL)
                .sort((a, b) => (b.limitPrice || 0) - (a.limitPrice || 0))
                .map(order => ({
                    id: order.id,
                    price: order.limitPrice,
                    quantity: order.remainingQuantity,
                    type: order.orderType,
                    createdAt: order.createdAt,
                }));

            const activeAsks = askOrders
                .filter(order => order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL)
                .sort((a, b) => (a.limitPrice || 0) - (b.limitPrice || 0))
                .map(order => ({
                    id: order.id,
                    price: order.limitPrice,
                    quantity: order.remainingQuantity,
                    type: order.orderType,
                    createdAt: order.createdAt,
                }));

            return reply.status(200).send({
                stockId,
                stockSymbol: stock.symbol,
                stockName: stock.name,
                currentPrice: stock.currentPrice,
                bestBid: stock.bestBid,
                bestAsk: stock.bestAsk,
                bids: activeBids,
                asks: activeAsks,
            });
        } catch (error) {
            console.error('Error fetching order book:', error);
            return reply.status(500).send({ error: 'Failed to fetch order book' });
        }
    }

    async getStockTrades(request: FastifyRequest<{ Params: { stockId: string }; Querystring: { limit?: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const { stockId } = request.params;
            const limit = request.query.limit ? parseInt(request.query.limit) : 50;

            if (!stockId) {
                return reply.status(400).send({ error: 'Stock ID is required' });
            }

            const trades = await this.tradeRepository.getByStockId(stockId);

            const recentTrades = trades
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, limit)
                .map(trade => {
                    let side: 'BUY' | 'SELL';

                    if (trade.sellOrder.orderType === OrderBookType.MARKET) {
                        side = 'SELL';
                    } else if (trade.buyOrder.orderType === OrderBookType.MARKET) {
                        side = 'BUY';
                    } else {
                        const buyOrderCreatedAt = trade.buyOrder.createdAt.getTime();
                        const sellOrderCreatedAt = trade.sellOrder.createdAt.getTime();
                        side = sellOrderCreatedAt > buyOrderCreatedAt ? 'SELL' : 'BUY';
                    }

                    return {
                        id: trade.id,
                        price: trade.price,
                        quantity: trade.quantity,
                        buyerId: trade.buyer.id,
                        sellerId: trade.seller.id,
                        side,
                        createdAt: trade.createdAt.toISOString(),
                    };
                });

            return reply.status(200).send(recentTrades);
        } catch (error) {
            console.error('Error fetching stock trades:', error);
            return reply.status(500).send({ error: 'Failed to fetch stock trades' });
        }
    }

    async cancelOrder(request: FastifyRequest<{ Params: { orderId: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;
            const { orderId } = request.params;

            if (!orderId) {
                return reply.status(400).send({ error: 'Order ID is required' });
            }

            const order = await this.orderBookRepository.getById(orderId);

            if (!order) {
                return reply.status(404).send({ error: 'Order not found' });
            }

            if (order.user.id !== userId) {
                return reply.status(403).send({ error: 'Forbidden: You can only cancel your own orders' });
            }

            if (order.state !== OrderBookState.PENDING && order.state !== OrderBookState.PARTIAL) {
                return reply.status(400).send({
                    error: 'Cannot cancel order',
                    reason: `Order is in ${order.state} state`,
                });
            }

            const cancelledOrder = new OrderBook(
                order.id,
                order.stock,
                order.user,
                order.side,
                order.orderType,
                order.quantity,
                order.remainingQuantity,
                order.limitPrice,
                order.stopPrice,
                OrderBookState.CANCELLED,
                order.createdAt,
                new Date()
            );

            await this.orderBookRepository.update(cancelledOrder);

            return reply.status(200).send({
                success: true,
                message: 'Order cancelled successfully',
                order: {
                    id: cancelledOrder.id,
                    state: cancelledOrder.state,
                },
            });
        } catch (error) {
            console.error('Error cancelling order:', error);
            return reply.status(500).send({ error: 'Failed to cancel order' });
        }
    }

    async getUserOrders(request: FastifyRequest<{ Querystring: { stockId?: string; state?: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;
            const { stockId, state } = request.query;

            const allOrders = await this.orderBookRepository.getByUserId(userId);

            let filteredOrders = allOrders;

            if (stockId) {
                filteredOrders = filteredOrders.filter(order => order.stock.id === stockId);
            }

            if (state) {
                const orderState = state.toUpperCase() as keyof typeof OrderBookState;
                filteredOrders = filteredOrders.filter(order => order.state === OrderBookState[orderState]);
            }

            const orders = filteredOrders
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map(order => ({
                    id: order.id,
                    stockId: order.stock.id,
                    stockSymbol: order.stock.symbol,
                    stockName: order.stock.name,
                    side: order.side,
                    type: order.orderType,
                    quantity: order.quantity,
                    remainingQuantity: order.remainingQuantity,
                    limitPrice: order.limitPrice,
                    state: order.state,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                }));

            return reply.status(200).send(orders);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return reply.status(500).send({ error: 'Failed to fetch user orders' });
        }
    }

    async getStockPrices(request: FastifyRequest<{ Params: { stockId: string }; Querystring: { period?: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const { stockId } = request.params;
            const { period } = request.query;

            if (!stockId) {
                return reply.status(400).send({ error: 'Stock ID is required' });
            }

            const stock = await this.stockRepository.getById(stockId);
            if (!stock) {
                return reply.status(404).send({ error: 'Stock not found' });
            }

            const allTrades = await this.tradeRepository.getByStockId(stockId);

            let startDate: Date | undefined;
            if (period === 'weekly') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
            } else if (period === 'monthly') {
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
            }

            const filteredTrades = startDate
                ? allTrades.filter(trade => trade.createdAt >= startDate)
                : allTrades;

            const pricesMap = new Map<string, { prices: number[]; volumes: number[] }>();

            filteredTrades.forEach(trade => {
                const dateKey = trade.createdAt.toISOString().split('T')[0];
                if (!pricesMap.has(dateKey)) {
                    pricesMap.set(dateKey, { prices: [], volumes: [] });
                }
                pricesMap.get(dateKey)!.prices.push(trade.price);
                pricesMap.get(dateKey)!.volumes.push(trade.quantity);
            });

            const pricesData = Array.from(pricesMap.entries())
                .map(([date, data]) => ({
                    price: data.prices[data.prices.length - 1],
                    volume: data.volumes.reduce((sum, v) => sum + v, 0),
                    timestamp: new Date(date + 'T16:00:00Z').toISOString(),
                }))
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            return reply.status(200).send({
                stockId,
                stockSymbol: stock.symbol,
                stockName: stock.name,
                period: period || 'all',
                prices: pricesData,
            });
        } catch (error) {
            console.error('Error fetching stock prices:', error);
            return reply.status(500).send({ error: 'Failed to fetch stock prices' });
        }
    }

    async getPortfolioHistory(request: FastifyRequest<{ Querystring: { period?: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;
            const { period } = request.query;

            const portfolios = await this.portfolioRepository.getByUserId(userId);
            if (portfolios.length === 0) {
                return reply.status(200).send({ history: [] });
            }

            const stockIds = portfolios.map(p => p.stock.id);

            const allUserTrades: any[] = [];
            for (const stockId of stockIds) {
                const trades = await this.tradeRepository.getByStockId(stockId);
                allUserTrades.push(...trades.filter(t => t.buyer.id === userId || t.seller.id === userId));
            }

            const allTradesForPrices: any[] = [];
            for (const stockId of stockIds) {
                const trades = await this.tradeRepository.getByStockId(stockId);
                allTradesForPrices.push(...trades);
            }
            allTradesForPrices.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            const priceHistory = new Map<string, Map<string, number>>();
            for (const trade of allTradesForPrices) {
                const stockId = trade.stock.id;
                const dateKey = trade.createdAt.toISOString().split('T')[0];

                if (!priceHistory.has(stockId)) {
                    priceHistory.set(stockId, new Map());
                }
                priceHistory.get(stockId)!.set(dateKey, trade.price);
            }

            const startDate = this.getStartDateByPeriod(period, allUserTrades);

            const filteredTrades = allUserTrades.filter(trade => trade.createdAt >= startDate);
            filteredTrades.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            const valueByDate = new Map<string, number>();
            const holdings = new Map<string, { quantity: number }>();

            const getPriceAtDate = (stockId: string, targetDate: string): number => {
                const stockPrices = priceHistory.get(stockId);
                if (!stockPrices) {
                    return portfolios.find(p => p.stock.id === stockId)?.stock.currentPrice || 0;
                }

                let price = 0;
                for (const [date, p] of Array.from(stockPrices.entries()).sort()) {
                    if (date <= targetDate) {
                        price = p;
                    } else {
                        break;
                    }
                }

                return price || portfolios.find(p => p.stock.id === stockId)?.stock.currentPrice || 0;
            };

            if (period === 'weekly' || period === 'monthly') {
                const tradesBeforePeriod = allUserTrades.filter(trade => trade.createdAt < startDate);
                for (const trade of tradesBeforePeriod) {
                    const isBuy = trade.buyer.id === userId;
                    const stockId = trade.stock.id;

                    if (!holdings.has(stockId)) {
                        holdings.set(stockId, { quantity: 0 });
                    }

                    const holding = holdings.get(stockId)!;

                    if (isBuy) {
                        holding.quantity += trade.quantity;
                    } else {
                        holding.quantity -= trade.quantity;
                    }
                }

                const startDateKey = startDate.toISOString().split('T')[0];
                let initialValue = 0;
                for (const [hStockId, hData] of holdings.entries()) {
                    const priceAtStart = getPriceAtDate(hStockId, startDateKey);
                    initialValue += hData.quantity * priceAtStart;
                }
                if (initialValue > 0) {
                    valueByDate.set(startDateKey, initialValue);
                }
            }

            const tradesByDate = new Map<string, any[]>();
            for (const trade of filteredTrades) {
                const dateKey = trade.createdAt.toISOString().split('T')[0];
                if (!tradesByDate.has(dateKey)) {
                    tradesByDate.set(dateKey, []);
                }
                tradesByDate.get(dateKey)!.push(trade);
            }

            const today = new Date();
            const todayKey = today.toISOString().split('T')[0];
            const currentDate = new Date(startDate);

            while (currentDate <= today) {
                const dateKey = currentDate.toISOString().split('T')[0];

                const tradesOnThisDay = tradesByDate.get(dateKey) || [];
                for (const trade of tradesOnThisDay) {
                    const isBuy = trade.buyer.id === userId;
                    const stockId = trade.stock.id;

                    if (!holdings.has(stockId)) {
                        holdings.set(stockId, { quantity: 0 });
                    }

                    const holding = holdings.get(stockId)!;

                    if (isBuy) {
                        holding.quantity += trade.quantity;
                    } else {
                        holding.quantity -= trade.quantity;
                    }
                }

                let totalValue = 0;
                for (const [hStockId, hData] of holdings.entries()) {
                    const historicalPrice = getPriceAtDate(hStockId, dateKey);
                    totalValue += hData.quantity * historicalPrice;
                }

                if (totalValue > 0 || valueByDate.size > 0) {
                    valueByDate.set(dateKey, totalValue);
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            const currentValue = portfolios.reduce((sum, p) => sum + p.getCurrentValue(), 0);
            valueByDate.set(todayKey, currentValue);

            const history = Array.from(valueByDate.entries())
                .map(([date, value]) => ({
                    date,
                    value: parseFloat(value.toFixed(2)),
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            return reply.status(200).send({
                period: period || 'yearly',
                history,
            });
        } catch (error) {
            console.error('Error fetching portfolio history:', error);
            return reply.status(500).send({ error: 'Failed to fetch portfolio history' });
        }
    }

    async getProfitsBreakdown(request: FastifyRequest<{ Querystring: { period?: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const userId = request.user.userId;
            const { period } = request.query;

            const portfolios = await this.portfolioRepository.getByUserId(userId);
            if (portfolios.length === 0) {
                return reply.status(200).send({ breakdown: [] });
            }

            const allUserTrades: any[] = [];
            for (const portfolio of portfolios) {
                const trades = await this.tradeRepository.getByStockId(portfolio.stock.id);
                allUserTrades.push(...trades.filter(t => t.buyer.id === userId || t.seller.id === userId));
            }

            const startDate = period ? this.getStartDateByPeriod(period, allUserTrades) : undefined;

            const breakdown = await Promise.all(portfolios.map(async (portfolio) => {
                let profitLoss = 0;

                if (!startDate) {
                    profitLoss = portfolio.getProfitLoss();
                } else {
                    let allTrades = await this.tradeRepository.getByStockId(portfolio.stock.id);
                    allTrades = allTrades.filter(t => t.buyer.id === userId || t.seller.id === userId);

                    let quantityAtStart = 0;
                    let quantityAtEnd = 0;

                    for (const trade of allTrades) {
                        const isBuy = trade.buyer.id === userId;
                        const qty = isBuy ? trade.quantity : -trade.quantity;

                        if (trade.createdAt < startDate) {
                            quantityAtStart += qty;
                        }
                        quantityAtEnd += qty;
                    }

                    const tradesInPeriod = allTrades.filter(t => t.createdAt >= startDate);
                    const priceAtStart = tradesInPeriod.length > 0
                        ? tradesInPeriod[0].price
                        : portfolio.stock.currentPrice;

                    const valueAtStart = quantityAtStart * priceAtStart;
                    const valueAtEnd = quantityAtEnd * portfolio.stock.currentPrice;

                    profitLoss = valueAtEnd - valueAtStart;
                }

                return {
                    symbol: portfolio.stock.symbol,
                    name: portfolio.stock.name,
                    profitLoss: parseFloat(profitLoss.toFixed(2)),
                    percentage: 0,
                };
            }));

            const totalProfits = breakdown.reduce((sum, item) => sum + Math.max(0, item.profitLoss), 0);
            breakdown.forEach(item => {
                item.percentage = totalProfits > 0 ? (Math.max(0, item.profitLoss) / totalProfits) * 100 : 0;
            });

            const filteredBreakdown = breakdown.filter(item => item.profitLoss > 0);

            return reply.status(200).send({
                period: period || 'yearly',
                breakdown: filteredBreakdown,
                totalProfits: parseFloat(totalProfits.toFixed(2)),
            });
        } catch (error) {
            console.error('Error fetching profits breakdown:', error);
            return reply.status(500).send({ error: 'Failed to fetch profits breakdown' });
        }
    }

    async getAllStocksAdmin(request: FastifyRequest, reply: FastifyReply) {
        try {
            const stocks = await this.stockRepository.getAll();

            const stocksData = stocks.map(stock => ({
                id: stock.id,
                symbol: stock.symbol,
                name: stock.name,
                isin: stock.isin,
                currentPrice: stock.currentPrice,
                marketCap: stock.marketCap,
                isActive: stock.isActive,
                createdAt: stock.createdAt,
                updatedAt: stock.updatedAt,
            }));

            return reply.status(200).send(stocksData);
        } catch (error) {
            console.error('Error fetching stocks (admin):', error);
            return reply.status(500).send({ error: 'Échec de la récupération des actions' });
        }
    }

    async createStock(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { symbol, name, currentPrice, marketCap, isActive } = request.body as any;

            const existingStock = await this.stockRepository.getBySymbol(symbol);
            if (existingStock) {
                return reply.status(409).send({
                    error: 'Conflict',
                    message: `Une action avec le symbole "${symbol}" existe déjà`,
                });
            }

            const now = new Date();
            const generatedISIN = this.generateISIN();

            const newStock = new Stock(
                uuidv4(),
                symbol,
                name,
                generatedISIN,
                currentPrice,
                null,
                null,
                marketCap ?? null,
                0,
                isActive,
                [],
                now,
                now
            );

            const createdStock = await this.stockRepository.add(newStock);

            const SYSTEM_USER_ID = 'SYSTEM';
            const INITIAL_LIQUIDITY = 10000;
            const SPREAD_PERCENT = 0.01; // 1% spread

            try {
                const systemUser = await this.userRepository.getById(SYSTEM_USER_ID);
                if (systemUser) {
                    const systemPortfolio = new Portfolio(
                        uuidv4(),
                        systemUser,
                        createdStock,
                        INITIAL_LIQUIDITY,
                        currentPrice,
                        INITIAL_LIQUIDITY * currentPrice,
                        now,
                        now
                    );
                    await this.portfolioRepository.add(systemPortfolio);

                    const askPrice = parseFloat((currentPrice * (1 + SPREAD_PERCENT)).toFixed(2));
                    const liquidityAskOrder = new OrderBook(
                        uuidv4(),
                        createdStock,
                        systemUser,
                        OrderSide.ASK,
                        OrderBookType.LIMIT,
                        INITIAL_LIQUIDITY,
                        INITIAL_LIQUIDITY,
                        askPrice,
                        null,
                        OrderBookState.PENDING,
                        now,
                        now
                    );

                    await this.orderBookRepository.add(liquidityAskOrder);

                    const bidPrice = parseFloat((currentPrice * (1 - SPREAD_PERCENT)).toFixed(2));
                    const liquidityBidOrder = new OrderBook(
                        uuidv4(),
                        createdStock,
                        systemUser,
                        OrderSide.BID,
                        OrderBookType.LIMIT,
                        INITIAL_LIQUIDITY,
                        INITIAL_LIQUIDITY,
                        bidPrice,
                        null,
                        OrderBookState.PENDING,
                        now,
                        now
                    );

                    await this.orderBookRepository.add(liquidityBidOrder);
                }
            } catch (liquidityError) {
                console.error('Erreur création liquidité:', liquidityError);
            }

            return reply.status(201).send({
                success: true,
                message: 'Action créée avec succès',
                stock: {
                    id: createdStock.id,
                    symbol: createdStock.symbol,
                    name: createdStock.name,
                    isin: createdStock.isin,
                    currentPrice: createdStock.currentPrice,
                    marketCap: createdStock.marketCap,
                    isActive: createdStock.isActive,
                },
            });
        } catch (error) {
            console.error('Error creating stock:', error);
            return reply.status(500).send({ error: 'Échec de la création de l\'action' });
        }
    }

    async updateStock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const { symbol, name, isin, currentPrice, marketCap, isActive } = request.body as any;

            const existingStock = await this.stockRepository.getById(id);
            if (!existingStock) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Action introuvable',
                });
            }

            if (symbol && symbol !== existingStock.symbol) {
                const stockWithSymbol = await this.stockRepository.getBySymbol(symbol);
                if (stockWithSymbol) {
                    return reply.status(409).send({
                        error: 'Conflict',
                        message: `Une action avec le symbole "${symbol}" existe déjà`,
                    });
                }
            }

            const updatedStock = new Stock(
                existingStock.id,
                symbol ?? existingStock.symbol,
                name ?? existingStock.name,
                isin !== undefined ? isin : existingStock.isin,
                currentPrice ?? existingStock.currentPrice,
                existingStock.bestBid,
                existingStock.bestAsk,
                marketCap !== undefined ? marketCap : existingStock.marketCap,
                existingStock.volume24h,
                isActive ?? existingStock.isActive,
                existingStock.orders,
                existingStock.createdAt,
                new Date()
            );

            await this.stockRepository.update(updatedStock);

            return reply.status(200).send({
                success: true,
                message: 'Action mise à jour avec succès',
                stock: {
                    id: updatedStock.id,
                    symbol: updatedStock.symbol,
                    name: updatedStock.name,
                    isin: updatedStock.isin,
                    currentPrice: updatedStock.currentPrice,
                    marketCap: updatedStock.marketCap,
                    isActive: updatedStock.isActive,
                },
            });
        } catch (error) {
            console.error('Error updating stock:', error);
            return reply.status(500).send({ error: 'Échec de la mise à jour de l\'action' });
        }
    }

    async deleteStock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            const existingStock = await this.stockRepository.getById(id);
            if (!existingStock) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'Action introuvable',
                });
            }

            const trades = await this.tradeRepository.getByStockId(id);
            if (trades.length > 0) {
                return reply.status(409).send({
                    error: 'Conflict',
                    message: 'Impossible de supprimer une action avec des transactions existantes. Désactivez-la à la place.',
                });
            }

            const bidOrders = await this.orderBookRepository.getByStockIdAndSide(id, OrderSide.BID);
            const askOrders = await this.orderBookRepository.getByStockIdAndSide(id, OrderSide.ASK);
            const activeOrders = [...bidOrders, ...askOrders].filter(
                order => order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL
            );

            if (activeOrders.length > 0) {
                return reply.status(409).send({
                    error: 'Conflict',
                    message: `Impossible de supprimer une action avec ${activeOrders.length} ordre(s) actif(s). Annulez-les d'abord ou désactivez l'action.`,
                });
            }

            await this.stockRepository.remove(id);

            return reply.status(200).send({
                success: true,
                message: 'Action supprimée avec succès',
            });
        } catch (error) {
            console.error('Error deleting stock:', error);
            return reply.status(500).send({ error: 'Échec de la suppression de l\'action' });
        }
    }
}
