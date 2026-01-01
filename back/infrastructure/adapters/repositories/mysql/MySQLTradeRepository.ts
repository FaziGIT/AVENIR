import { Pool, RowDataPacket } from 'mysql2/promise';
import { TradeRepository } from '@avenir/domain/repositories/TradeRepository';
import { Trade } from '@avenir/domain/entities/Trade';
import { User } from '@avenir/domain/entities/User';
import { Stock } from '@avenir/domain/entities/Stock';
import { OrderBook } from '@avenir/domain/entities/OrderBook';
import { OrderSide } from '@avenir/domain/enumerations/OrderSide';
import { OrderBookType } from '@avenir/domain/enumerations/OrderBookType';
import { OrderBookState } from '@avenir/domain/enumerations/OrderBookState';
import { UserRole } from '@avenir/domain/enumerations/UserRole';
import { UserState } from '@avenir/domain/enumerations/UserState';

interface TradeRow extends RowDataPacket {
    id: string;
    stock_id: string;
    buyer_id: string;
    seller_id: string;
    buy_order_id: string;
    sell_order_id: string;
    quantity: string;
    price: string;
    buyer_fee: string;
    seller_fee: string;
    created_at: Date;
    symbol: string;
    name: string;
    current_price: string;
    buyer_first_name: string;
    buyer_last_name: string;
    buyer_email: string;
    buyer_identity_number: string;
    buyer_passcode: string;
    buyer_role: string;
    buyer_state: string;
    buyer_created_at: Date;
    seller_first_name: string;
    seller_last_name: string;
    seller_email: string;
    seller_identity_number: string;
    seller_passcode: string;
    seller_role: string;
    seller_state: string;
    seller_created_at: Date;
    buy_order_side: string;
    buy_order_type: string;
    buy_order_quantity: string;
    buy_order_remaining_quantity: string;
    buy_order_limit_price: string | null;
    buy_order_stop_price: string | null;
    buy_order_state: string;
    buy_order_created_at: Date;
    buy_order_updated_at: Date;
    sell_order_side: string;
    sell_order_type: string;
    sell_order_quantity: string;
    sell_order_remaining_quantity: string;
    sell_order_limit_price: string | null;
    sell_order_stop_price: string | null;
    sell_order_state: string;
    sell_order_created_at: Date;
    sell_order_updated_at: Date;
}

export class MySQLTradeRepository implements TradeRepository {
    constructor(private pool: Pool) {}

    private getBaseQuery(): string {
        return `
            SELECT
                t.*,
                s.symbol, s.name, s.current_price,
                buyer.id as buyer_id, buyer.first_name as buyer_first_name, buyer.last_name as buyer_last_name,
                buyer.email as buyer_email, buyer.identity_number as buyer_identity_number,
                buyer.passcode as buyer_passcode, buyer.role as buyer_role, buyer.state as buyer_state,
                buyer.created_at as buyer_created_at,
                seller.id as seller_id, seller.first_name as seller_first_name, seller.last_name as seller_last_name,
                seller.email as seller_email, seller.identity_number as seller_identity_number,
                seller.passcode as seller_passcode, seller.role as seller_role, seller.state as seller_state,
                seller.created_at as seller_created_at,
                bo.id as buy_order_id, bo.side as buy_order_side, bo.order_type as buy_order_type,
                bo.quantity as buy_order_quantity, bo.remaining_quantity as buy_order_remaining_quantity,
                bo.limit_price as buy_order_limit_price, bo.stop_price as buy_order_stop_price,
                bo.state as buy_order_state, bo.created_at as buy_order_created_at, bo.updated_at as buy_order_updated_at,
                so.id as sell_order_id, so.side as sell_order_side, so.order_type as sell_order_type,
                so.quantity as sell_order_quantity, so.remaining_quantity as sell_order_remaining_quantity,
                so.limit_price as sell_order_limit_price, so.stop_price as sell_order_stop_price,
                so.state as sell_order_state, so.created_at as sell_order_created_at, so.updated_at as sell_order_updated_at
            FROM trades t
            JOIN stocks s ON t.stock_id = s.id
            JOIN users buyer ON t.buyer_id = buyer.id
            JOIN users seller ON t.seller_id = seller.id
            JOIN order_book bo ON t.buy_order_id = bo.id
            JOIN order_book so ON t.sell_order_id = so.id
        `;
    }

    async add(trade: Trade): Promise<Trade> {
        const query = `
            INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await this.pool.execute(query, [
            trade.id,
            trade.stock.id,
            trade.buyer.id,
            trade.seller.id,
            trade.buyOrder.id,
            trade.sellOrder.id,
            trade.quantity,
            trade.price,
            trade.buyerFee,
            trade.sellerFee,
        ]);
        return trade;
    }

    async getById(id: string): Promise<Trade | null> {
        const query = `${this.getBaseQuery()} WHERE t.id = ?`;
        const [rows] = await this.pool.execute<TradeRow[]>(query, [id]);
        return rows.length > 0 ? this.mapRowToTrade(rows[0]) : null;
    }

    async getAll(): Promise<Trade[]> {
        const query = `${this.getBaseQuery()} ORDER BY t.created_at DESC`;
        const [rows] = await this.pool.execute<TradeRow[]>(query);
        return rows.map(row => this.mapRowToTrade(row));
    }

    async getByStockId(stockId: string): Promise<Trade[]> {
        const query = `${this.getBaseQuery()} WHERE t.stock_id = ? ORDER BY t.created_at DESC`;
        const [rows] = await this.pool.execute<TradeRow[]>(query, [stockId]);
        return rows.map(row => this.mapRowToTrade(row));
    }

    async getByBuyerId(buyerId: string): Promise<Trade[]> {
        const query = `${this.getBaseQuery()} WHERE t.buyer_id = ? ORDER BY t.created_at DESC`;
        const [rows] = await this.pool.execute<TradeRow[]>(query, [buyerId]);
        return rows.map(row => this.mapRowToTrade(row));
    }

    async getBySellerId(sellerId: string): Promise<Trade[]> {
        const query = `${this.getBaseQuery()} WHERE t.seller_id = ? ORDER BY t.created_at DESC`;
        const [rows] = await this.pool.execute<TradeRow[]>(query, [sellerId]);
        return rows.map(row => this.mapRowToTrade(row));
    }

    async getByUserId(userId: string): Promise<Trade[]> {
        const query = `${this.getBaseQuery()} WHERE t.buyer_id = ? OR t.seller_id = ? ORDER BY t.created_at DESC`;
        const [rows] = await this.pool.execute<TradeRow[]>(query, [userId, userId]);
        return rows.map(row => this.mapRowToTrade(row));
    }

    async getRecentTrades(limit: number): Promise<Trade[]> {
        const query = `${this.getBaseQuery()} ORDER BY t.created_at DESC LIMIT ?`;
        const [rows] = await this.pool.execute<TradeRow[]>(query, [limit]);
        return rows.map(row => this.mapRowToTrade(row));
    }

    private mapRowToTrade(row: TradeRow): Trade {
        const stock = new Stock(
            row.stock_id,
            row.symbol,
            row.name,
            null,
            parseFloat(row.current_price),
            null,
            null,
            null,
            0,
            true,
            [],
            new Date(),
            new Date()
        );

        const buyer = new User(
            row.buyer_id,
            row.buyer_first_name,
            row.buyer_last_name,
            row.buyer_email,
            row.buyer_identity_number,
            row.buyer_passcode,
            row.buyer_role as UserRole,
            row.buyer_state as UserState,
            [],
            [],
            [],
            new Date(row.buyer_created_at)
        );

        const seller = new User(
            row.seller_id,
            row.seller_first_name,
            row.seller_last_name,
            row.seller_email,
            row.seller_identity_number,
            row.seller_passcode,
            row.seller_role as UserRole,
            row.seller_state as UserState,
            [],
            [],
            [],
            new Date(row.seller_created_at)
        );

        const buyOrder = new OrderBook(
            row.buy_order_id,
            stock,
            buyer,
            row.buy_order_side as OrderSide,
            row.buy_order_type as OrderBookType,
            parseFloat(row.buy_order_quantity),
            parseFloat(row.buy_order_remaining_quantity),
            row.buy_order_limit_price ? parseFloat(row.buy_order_limit_price) : null,
            row.buy_order_stop_price ? parseFloat(row.buy_order_stop_price) : null,
            row.buy_order_state as OrderBookState,
            new Date(row.buy_order_created_at),
            new Date(row.buy_order_updated_at)
        );

        const sellOrder = new OrderBook(
            row.sell_order_id,
            stock,
            seller,
            row.sell_order_side as OrderSide,
            row.sell_order_type as OrderBookType,
            parseFloat(row.sell_order_quantity),
            parseFloat(row.sell_order_remaining_quantity),
            row.sell_order_limit_price ? parseFloat(row.sell_order_limit_price) : null,
            row.sell_order_stop_price ? parseFloat(row.sell_order_stop_price) : null,
            row.sell_order_state as OrderBookState,
            new Date(row.sell_order_created_at),
            new Date(row.sell_order_updated_at)
        );

        return new Trade(
            row.id,
            stock,
            buyer,
            seller,
            buyOrder,
            sellOrder,
            parseFloat(row.quantity),
            parseFloat(row.price),
            parseFloat(row.buyer_fee),
            parseFloat(row.seller_fee),
            new Date(row.created_at)
        );
    }
}
