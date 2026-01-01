import { Pool } from 'pg';
import { Trade } from '../../../../domain/entities/Trade';
import { TradeRepository } from '../../../../domain/repositories/TradeRepository';
import { User } from '../../../../domain/entities/User';
import { Stock } from '../../../../domain/entities/Stock';
import { OrderBook } from '../../../../domain/entities/OrderBook';
import { UserRole } from '../../../../domain/enumerations/UserRole';
import { UserState } from '../../../../domain/enumerations/UserState';
import { OrderSide } from '../../../../domain/enumerations/OrderSide';
import { OrderBookType } from '../../../../domain/enumerations/OrderBookType';
import { OrderBookState } from '../../../../domain/enumerations/OrderBookState';

export class PostgresTradeRepository implements TradeRepository {
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
            INSERT INTO trades (id, stock_id, buyer_id, seller_id, buy_order_id, sell_order_id, quantity, price, buyer_fee, seller_fee, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        try {
            const result = await this.pool.query(query, [
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
                trade.createdAt
            ]);
            return await this.mapRowToTrade(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Trade | null> {
        try {
            const query = `${this.getBaseQuery()} WHERE t.id = $1`;
            const result = await this.pool.query(query, [id]);
            return result.rows.length === 0 ? null : await this.mapRowToTrade(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByStockId(stockId: string): Promise<Trade[]> {
        try {
            const query = `${this.getBaseQuery()} WHERE t.stock_id = $1 ORDER BY t.created_at DESC`;
            const result = await this.pool.query(query, [stockId]);
            return Promise.all(result.rows.map(row => this.mapRowToTrade(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByBuyerId(buyerId: string): Promise<Trade[]> {
        try {
            const query = `${this.getBaseQuery()} WHERE t.buyer_id = $1 ORDER BY t.created_at DESC`;
            const result = await this.pool.query(query, [buyerId]);
            return Promise.all(result.rows.map(row => this.mapRowToTrade(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getBySellerId(sellerId: string): Promise<Trade[]> {
        try {
            const query = `${this.getBaseQuery()} WHERE t.seller_id = $1 ORDER BY t.created_at DESC`;
            const result = await this.pool.query(query, [sellerId]);
            return Promise.all(result.rows.map(row => this.mapRowToTrade(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByUserId(userId: string): Promise<Trade[]> {
        try {
            const query = `${this.getBaseQuery()} WHERE t.buyer_id = $1 OR t.seller_id = $1 ORDER BY t.created_at DESC`;
            const result = await this.pool.query(query, [userId]);
            return Promise.all(result.rows.map(row => this.mapRowToTrade(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getRecentTrades(limit: number): Promise<Trade[]> {
        try {
            const query = `${this.getBaseQuery()} ORDER BY t.created_at DESC LIMIT $1`;
            const result = await this.pool.query(query, [limit]);
            return Promise.all(result.rows.map(row => this.mapRowToTrade(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getAll(): Promise<Trade[]> {
        try {
            const query = `${this.getBaseQuery()} ORDER BY t.created_at DESC`;
            const result = await this.pool.query(query);
            return Promise.all(result.rows.map(row => this.mapRowToTrade(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    private async mapRowToTrade(row: any): Promise<Trade> {
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
