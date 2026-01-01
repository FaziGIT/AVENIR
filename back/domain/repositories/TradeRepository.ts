import { Trade } from "../entities/Trade";

export interface TradeRepository {
    add(trade: Trade): Promise<Trade>;
    getById(id: string): Promise<Trade | null>;
    getByStockId(stockId: string): Promise<Trade[]>;
    getByBuyerId(buyerId: string): Promise<Trade[]>;
    getBySellerId(sellerId: string): Promise<Trade[]>;
    getByUserId(userId: string): Promise<Trade[]>;
    getRecentTrades(limit: number): Promise<Trade[]>;
    getAll(): Promise<Trade[]>;
}
