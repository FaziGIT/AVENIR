import { Pool } from 'pg';
import { OrderBook } from '../../../../domain/entities/OrderBook';
import { OrderBookRepository } from '../../../../domain/repositories/OrderBookRepository';
import { OrderSide } from '../../../../domain/enumerations/OrderSide';
import { OrderBookType } from '../../../../domain/enumerations/OrderBookType';
import { OrderBookState } from '../../../../domain/enumerations/OrderBookState';
import { User } from '../../../../domain/entities/User';
import { Stock } from '../../../../domain/entities/Stock';
import { UserRole } from '../../../../domain/enumerations/UserRole';
import { UserState } from '../../../../domain/enumerations/UserState';

export class PostgresOrderBookRepository implements OrderBookRepository {
    constructor(private pool: Pool) {}

    async add(orderBook: OrderBook): Promise<OrderBook> {
        const query = `
            INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        try {
            const result = await this.pool.query(query, [
                orderBook.id,
                orderBook.stock.id,
                orderBook.user.id,
                orderBook.side,
                orderBook.orderType,
                orderBook.quantity,
                orderBook.remainingQuantity,
                orderBook.limitPrice,
                orderBook.stopPrice,
                orderBook.state,
                orderBook.createdAt,
                orderBook.updatedAt
            ]);
            return await this.mapRowToOrderBook(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async update(orderBook: OrderBook): Promise<void> {
        const query = `
            UPDATE order_book
            SET remaining_quantity = $2, state = $3, updated_at = $4
            WHERE id = $1
        `;

        try {
            await this.pool.query(query, [
                orderBook.id,
                orderBook.remainingQuantity,
                orderBook.state,
                new Date()
            ]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM order_book WHERE id = $1', [id]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<OrderBook | null> {
        try {
            const query = `
                SELECT ob.*, u.*, s.*,
                       ob.id as order_id, ob.state as order_state, ob.created_at as order_created_at, ob.updated_at as order_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM order_book ob
                JOIN users u ON ob.user_id = u.id
                JOIN stocks s ON ob.stock_id = s.id
                WHERE ob.id = $1
            `;
            const result = await this.pool.query(query, [id]);
            return result.rows.length === 0 ? null : await this.mapRowToOrderBook(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByUserId(userId: string): Promise<OrderBook[]> {
        try {
            const query = `
                SELECT ob.*, u.*, s.*,
                       ob.id as order_id, ob.state as order_state, ob.created_at as order_created_at, ob.updated_at as order_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM order_book ob
                JOIN users u ON ob.user_id = u.id
                JOIN stocks s ON ob.stock_id = s.id
                WHERE ob.user_id = $1
                ORDER BY ob.created_at DESC
            `;
            const result = await this.pool.query(query, [userId]);
            return Promise.all(result.rows.map(row => this.mapRowToOrderBook(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByStockId(stockId: string): Promise<OrderBook[]> {
        try {
            const query = `
                SELECT ob.*, u.*, s.*,
                       ob.id as order_id, ob.state as order_state, ob.created_at as order_created_at, ob.updated_at as order_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM order_book ob
                JOIN users u ON ob.user_id = u.id
                JOIN stocks s ON ob.stock_id = s.id
                WHERE ob.stock_id = $1
                ORDER BY ob.created_at DESC
            `;
            const result = await this.pool.query(query, [stockId]);
            return Promise.all(result.rows.map(row => this.mapRowToOrderBook(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByStockIdAndSide(stockId: string, side: OrderSide): Promise<OrderBook[]> {
        try {
            const query = `
                SELECT ob.*, u.*, s.*,
                       ob.id as order_id, ob.state as order_state, ob.created_at as order_created_at, ob.updated_at as order_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM order_book ob
                JOIN users u ON ob.user_id = u.id
                JOIN stocks s ON ob.stock_id = s.id
                WHERE ob.stock_id = $1 AND ob.side = $2
                ORDER BY ob.limit_price ASC, ob.created_at ASC
            `;
            const result = await this.pool.query(query, [stockId, side]);
            return Promise.all(result.rows.map(row => this.mapRowToOrderBook(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getActiveOrders(stockId: string): Promise<OrderBook[]> {
        try {
            const query = `
                SELECT ob.*, u.*, s.*,
                       ob.id as order_id, ob.state as order_state, ob.created_at as order_created_at, ob.updated_at as order_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM order_book ob
                JOIN users u ON ob.user_id = u.id
                JOIN stocks s ON ob.stock_id = s.id
                WHERE ob.stock_id = $1 AND ob.state IN ('PENDING', 'PARTIAL')
                ORDER BY ob.created_at DESC
            `;
            const result = await this.pool.query(query, [stockId]);
            return Promise.all(result.rows.map(row => this.mapRowToOrderBook(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByState(state: OrderBookState): Promise<OrderBook[]> {
        try {
            const query = `
                SELECT ob.*, u.*, s.*,
                       ob.id as order_id, ob.state as order_state, ob.created_at as order_created_at, ob.updated_at as order_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM order_book ob
                JOIN users u ON ob.user_id = u.id
                JOIN stocks s ON ob.stock_id = s.id
                WHERE ob.state = $1
                ORDER BY ob.created_at DESC
            `;
            const result = await this.pool.query(query, [state]);
            return Promise.all(result.rows.map(row => this.mapRowToOrderBook(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getAll(): Promise<OrderBook[]> {
        try {
            const query = `
                SELECT ob.*, u.*, s.*,
                       ob.id as order_id, ob.state as order_state, ob.created_at as order_created_at, ob.updated_at as order_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM order_book ob
                JOIN users u ON ob.user_id = u.id
                JOIN stocks s ON ob.stock_id = s.id
                ORDER BY ob.created_at DESC
            `;
            const result = await this.pool.query(query);
            return Promise.all(result.rows.map(row => this.mapRowToOrderBook(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    private async mapRowToOrderBook(row: any): Promise<OrderBook> {
        const user = new User(
            row.user_id,
            row.first_name,
            row.last_name,
            row.email,
            row.identity_number,
            row.passcode,
            row.role as UserRole,
            row.state as UserState,
            [],
            [],
            [],
            new Date(row.user_created_at),
            row.verification_token,
            row.verified_at ? new Date(row.verified_at) : undefined
        );

        const stock = new Stock(
            row.stock_id,
            row.symbol,
            row.name,
            row.isin,
            parseFloat(row.current_price),
            row.best_bid ? parseFloat(row.best_bid) : null,
            row.best_ask ? parseFloat(row.best_ask) : null,
            row.market_cap ? parseInt(row.market_cap) : null,
            parseInt(row.volume_24h),
            row.is_active,
            [],
            new Date(row.stock_created_at),
            new Date(row.stock_updated_at)
        );

        return new OrderBook(
            row.order_id,
            stock,
            user,
            row.side as OrderSide,
            row.order_type as OrderBookType,
            parseFloat(row.quantity),
            parseFloat(row.remaining_quantity),
            row.limit_price ? parseFloat(row.limit_price) : null,
            row.stop_price ? parseFloat(row.stop_price) : null,
            (row.order_state || row.state) as OrderBookState,
            new Date(row.order_created_at),
            new Date(row.order_updated_at)
        );
    }
}
