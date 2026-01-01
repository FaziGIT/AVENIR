import { OrderBookRepository } from '@avenir/domain/repositories/OrderBookRepository';
import { TradeRepository } from '@avenir/domain/repositories/TradeRepository';
import { PortfolioRepository } from '@avenir/domain/repositories/PortfolioRepository';
import { AccountRepository } from '@avenir/domain/repositories/AccountRepository';
import { StockRepository } from '@avenir/domain/repositories/StockRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { OrderBook } from '@avenir/domain/entities/OrderBook';
import { Trade } from '@avenir/domain/entities/Trade';
import { Portfolio } from '@avenir/domain/entities/Portfolio';
import { Account } from '@avenir/domain/entities/Account';
import { Stock } from '@avenir/domain/entities/Stock';
import { OrderSide } from '@avenir/domain/enumerations/OrderSide';
import { OrderBookState } from '@avenir/domain/enumerations/OrderBookState';
import { v4 as uuidv4 } from 'uuid';

export class OrderMatchingService {
    constructor(
        private orderBookRepository: OrderBookRepository,
        private tradeRepository: TradeRepository,
        private portfolioRepository: PortfolioRepository,
        private accountRepository: AccountRepository,
        private stockRepository: StockRepository,
        private userRepository: UserRepository
    ) {}

    async matchOrders(stockId: string): Promise<void> {
        // Récupérer tous les ordres actifs pour cette action
        const bidOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.BID);
        const askOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.ASK);

        // Filtrer uniquement les ordres PENDING ou PARTIAL, en EXCLUANT les ordres STOP
        // Les ordres STOP ne doivent pas être matchés tant qu'ils ne sont pas déclenchés
        const activeBids = bidOrders
            .filter(order =>
                (order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL) &&
                order.orderType !== 'STOP' // Exclure les ordres STOP
            )
            .sort((a, b) => {
                // MARKET orders (limitPrice = null) doivent avoir la PLUS HAUTE priorité
                // Traiter les MARKET BUY comme Infinity (prix maximum)
                const priceA = a.limitPrice ?? Infinity;
                const priceB = b.limitPrice ?? Infinity;
                return priceB - priceA; // Prix descendant (plus haut en premier)
            });

        const activeAsks = askOrders
            .filter(order =>
                (order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL) &&
                order.orderType !== 'STOP' // Exclure les ordres STOP
            )
            .sort((a, b) => {
                // MARKET orders (limitPrice = null) doivent avoir la PLUS HAUTE priorité
                // Traiter les MARKET SELL comme 0 (prix minimum)
                const priceA = a.limitPrice ?? 0;
                const priceB = b.limitPrice ?? 0;
                return priceA - priceB; // Prix ascendant (plus bas en premier)
            });

        // Tracker si des trades ont été exécutés
        let tradesExecuted = false;

        for (let i = 0; i < activeBids.length; i++) {
            if (activeBids[i].remainingQuantity === 0) continue;

            for (let j = 0; j < activeAsks.length; j++) {
                if (activeAsks[j].remainingQuantity === 0) continue;

                const bidPrice = activeBids[i].limitPrice || Infinity;
                const askPrice = activeAsks[j].limitPrice || 0;

                if (bidPrice >= askPrice) {
                    const executionPrice = askPrice === 0 ? bidPrice : (bidPrice === Infinity ? askPrice : askPrice);
                    const { updatedBidOrder, updatedAskOrder } = await this.executeTrade(activeBids[i], activeAsks[j], executionPrice);
                    activeBids[i] = updatedBidOrder;
                    activeAsks[j] = updatedAskOrder;
                    tradesExecuted = true;
                }

                if (activeBids[i].remainingQuantity === 0) break;
            }
        }

        await this.checkAndTriggerStopOrders(stockId);
        await this.cancelUnfilledMarketOrders(stockId);

        // Mettre à jour le prix de l'action SEULEMENT si des trades ont été exécutés
        if (tradesExecuted) {
            await this.updateStockPrice(stockId);
        } else {
            // Même sans trade, mettre à jour bestBid et bestAsk
            await this.updateBestBidAsk(stockId);
        }
    }

    private async executeTrade(bidOrder: OrderBook, askOrder: OrderBook, price: number): Promise<{ updatedBidOrder: OrderBook; updatedAskOrder: OrderBook }> {
        // Quantité à échanger = min des deux quantités restantes
        const quantity = Math.min(bidOrder.remainingQuantity, askOrder.remainingQuantity);

        const TRANSACTION_FEE = 1;
        const now = new Date();

        // Créer le trade
        const trade = new Trade(
            uuidv4(),
            bidOrder.stock,
            bidOrder.user,
            askOrder.user,
            bidOrder,
            askOrder,
            quantity,
            price,
            TRANSACTION_FEE,
            TRANSACTION_FEE,
            now
        );

        await this.tradeRepository.add(trade);

        // Mettre à jour les quantités restantes
        const newBidRemaining = bidOrder.remainingQuantity - quantity;
        const newAskRemaining = askOrder.remainingQuantity - quantity;

        const updatedBidOrder = new OrderBook(
            bidOrder.id,
            bidOrder.stock,
            bidOrder.user,
            bidOrder.side,
            bidOrder.orderType,
            bidOrder.quantity,
            newBidRemaining,
            bidOrder.limitPrice,
            bidOrder.stopPrice,
            newBidRemaining === 0 ? OrderBookState.FILLED : OrderBookState.PARTIAL,
            bidOrder.createdAt,
            now
        );

        const updatedAskOrder = new OrderBook(
            askOrder.id,
            askOrder.stock,
            askOrder.user,
            askOrder.side,
            askOrder.orderType,
            askOrder.quantity,
            newAskRemaining,
            askOrder.limitPrice,
            askOrder.stopPrice,
            newAskRemaining === 0 ? OrderBookState.FILLED : OrderBookState.PARTIAL,
            askOrder.createdAt,
            now
        );

        await this.orderBookRepository.update(updatedBidOrder);
        await this.orderBookRepository.update(updatedAskOrder);

        // Mettre à jour les portfolios
        await this.updatePortfolio(bidOrder.user.id, bidOrder.stock, quantity, price, TRANSACTION_FEE);
        await this.updatePortfolio(askOrder.user.id, askOrder.stock, -quantity, price, TRANSACTION_FEE);

        // Mettre à jour les comptes (débiter l'acheteur, créditer le vendeur)
        await this.updateAccount(bidOrder.user.id, -(quantity * price + TRANSACTION_FEE));
        await this.updateAccount(askOrder.user.id, quantity * price - TRANSACTION_FEE);

        return { updatedBidOrder, updatedAskOrder };
    }

    private async updatePortfolio(userId: string, stock: Stock, quantity: number, price: number, fee: number): Promise<void> {
        const existingPortfolio = await this.portfolioRepository.getByUserIdAndStockId(userId, stock.id);
        const user = await this.userRepository.getById(userId);
        if (!user) return;

        if (quantity > 0) {
            // Achat - ajouter à la position
            if (existingPortfolio) {
                const newQuantity = existingPortfolio.quantity + quantity;
                const newTotalInvested = existingPortfolio.totalInvested + (price * quantity);
                const newAverageBuyPrice = newTotalInvested / newQuantity;

                const updatedPortfolio = new Portfolio(
                    existingPortfolio.id,
                    user,
                    stock,
                    newQuantity,
                    newAverageBuyPrice,
                    newTotalInvested,
                    existingPortfolio.createdAt,
                    new Date()
                );

                await this.portfolioRepository.update(updatedPortfolio);
            } else {
                const newPortfolio = new Portfolio(
                    uuidv4(),
                    user,
                    stock,
                    quantity,
                    price,
                    price * quantity,
                    new Date(),
                    new Date()
                );

                await this.portfolioRepository.add(newPortfolio);
            }
        } else {
            // Vente - retirer de la position
            if (existingPortfolio) {
                const newQuantity = existingPortfolio.quantity + quantity; // quantity est négatif

                if (newQuantity > 0) {
                    // Position partielle restante
                    const updatedPortfolio = new Portfolio(
                        existingPortfolio.id,
                        user,
                        stock,
                        newQuantity,
                        existingPortfolio.averageBuyPrice,
                        existingPortfolio.averageBuyPrice * newQuantity,
                        existingPortfolio.createdAt,
                        new Date()
                    );

                    await this.portfolioRepository.update(updatedPortfolio);
                } else {
                    // Position complètement vendue
                    await this.portfolioRepository.remove(existingPortfolio.id);
                }
            }
        }
    }

    private async updateAccount(userId: string, amount: number): Promise<void> {
        const accounts = await this.accountRepository.findByUserId(userId);
        const currentAccount = accounts.find(account => account.type === 'CURRENT');

        if (currentAccount) {
            const updatedAccount = new Account(
                currentAccount.id,
                currentAccount.userId,
                currentAccount.iban,
                currentAccount.name,
                currentAccount.type,
                currentAccount.balance + amount,
                currentAccount.currency,
                currentAccount.cardNumber,
                currentAccount.cardHolderName,
                currentAccount.cardExpiryDate,
                currentAccount.cardCvv,
                currentAccount.savingRate,
                currentAccount.transactions,
                currentAccount.createdAt
            );

            await this.accountRepository.update(updatedAccount);
        }
    }

    private async checkAndTriggerStopOrders(stockId: string): Promise<void> {
        // Récupérer le prix actuel de l'action
        const stock = await this.stockRepository.getById(stockId);
        if (!stock || !stock.currentPrice) return;

        const currentPrice = stock.currentPrice;

        // Récupérer tous les ordres STOP actifs pour cette action
        const bidOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.BID);
        const askOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.ASK);

        const stopBids = bidOrders.filter(order =>
            order.orderType === 'STOP' &&
            (order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL) &&
            order.stopPrice !== null
        );

        const stopAsks = askOrders.filter(order =>
            order.orderType === 'STOP' &&
            (order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL) &&
            order.stopPrice !== null
        );

        for (const stopBid of stopBids) {
            if (currentPrice >= stopBid.stopPrice!) {
                // STOP BUY triggered - conversion to MARKET order not implemented yet
            }
        }

        for (const stopAsk of stopAsks) {
            if (currentPrice <= stopAsk.stopPrice!) {
                // STOP SELL triggered - conversion to MARKET order not implemented yet
            }
        }
    }

    private async updateStockPrice(stockId: string): Promise<void> {
        // Récupérer le dernier trade pour cette action
        const trades = await this.tradeRepository.getByStockId(stockId);

        if (trades.length > 0) {
            // Trier par date décroissante et prendre le dernier
            const lastTrade = trades.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

            // Mettre à jour le prix de l'action SEULEMENT si le prix du trade est valide
            if (lastTrade.price && lastTrade.price > 0) {
                const stock = await this.stockRepository.getById(stockId);
                if (stock) {
                    const updatedStock = new Stock(
                        stock.id,
                        stock.symbol,
                        stock.name,
                        stock.isin,
                        lastTrade.price,
                        stock.bestBid,
                        stock.bestAsk,
                        stock.marketCap,
                        stock.volume24h,
                        stock.isActive,
                        stock.orders,
                        stock.createdAt,
                        new Date()
                    );

                    await this.stockRepository.update(updatedStock);
                }
            }
        }

        // Mettre à jour bestBid et bestAsk
        await this.updateBestBidAsk(stockId);
    }

    private async cancelUnfilledMarketOrders(stockId: string): Promise<void> {
        // Récupérer tous les ordres MARKET pour cette action
        const bidOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.BID);
        const askOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.ASK);

        const allOrders = [...bidOrders, ...askOrders];

        // Trouver les ordres MARKET qui sont encore PENDING ou PARTIAL
        const unfilledMarketOrders = allOrders.filter(order =>
            order.orderType === 'MARKET' &&
            (order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL) &&
            order.remainingQuantity > 0
        );

        // Annuler chaque ordre MARKET non rempli
        for (const order of unfilledMarketOrders) {
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
        }
    }

    private async updateBestBidAsk(stockId: string): Promise<void> {
        const bidOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.BID);
        const askOrders = await this.orderBookRepository.getByStockIdAndSide(stockId, OrderSide.ASK);

        // Filter active orders AND exclude MARKET orders (limitPrice = null)
        const activeBids = bidOrders.filter(order =>
            (order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL) &&
            order.remainingQuantity > 0 &&
            order.limitPrice !== null  // Exclude MARKET orders from best bid/ask calculation
        );

        const activeAsks = askOrders.filter(order =>
            (order.state === OrderBookState.PENDING || order.state === OrderBookState.PARTIAL) &&
            order.remainingQuantity > 0 &&
            order.limitPrice !== null  // Exclude MARKET orders from best bid/ask calculation
        );

        const bestBid = activeBids.length > 0
            ? Math.max(...activeBids.map(order => order.limitPrice!))
            : null;

        const bestAsk = activeAsks.length > 0
            ? Math.min(...activeAsks.map(order => order.limitPrice!))
            : null;

        const stock = await this.stockRepository.getById(stockId);
        if (stock) {
            const updatedStock = new Stock(
                stock.id,
                stock.symbol,
                stock.name,
                stock.isin,
                stock.currentPrice,
                bestBid,
                bestAsk,
                stock.marketCap,
                stock.volume24h,
                stock.isActive,
                stock.orders,
                stock.createdAt,
                new Date()
            );

            await this.stockRepository.update(updatedStock);
        }
    }
}
