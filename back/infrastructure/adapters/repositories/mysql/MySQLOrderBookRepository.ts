import { Pool, RowDataPacket } from 'mysql2/promise';
import { OrderBookRepository } from '@avenir/domain/repositories/OrderBookRepository';
import { OrderBook } from '@avenir/domain/entities/OrderBook';
import { OrderSide } from '@avenir/domain/enumerations/OrderSide';
import { OrderBookType } from '@avenir/domain/enumerations/OrderBookType';
import { OrderBookState } from '@avenir/domain/enumerations/OrderBookState';
import { User } from '@avenir/domain/entities/User';
import { Stock } from '@avenir/domain/entities/Stock';
import { Account } from '@avenir/domain/entities/Account';

interface OrderBookRow extends RowDataPacket {
    id: string;
    stock_id: string;
    user_id: string;
    side: string;
    order_type: string;
    quantity: string;
    remaining_quantity: string;
    limit_price: string | null;
    stop_price: string | null;
    state: string;
    created_at: Date;
    updated_at: Date;
}

export class MySQLOrderBookRepository implements OrderBookRepository {
    constructor(private pool: Pool) {}

    async add(order: OrderBook): Promise<OrderBook> {
        const query = `
            INSERT INTO order_book (id, stock_id, user_id, side, order_type, quantity, remaining_quantity, limit_price, stop_price, state)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await this.pool.execute(query, [
            order.id,
            order.stock.id,
            order.user.id,
            order.side,
            order.orderType,
            order.quantity,
            order.remainingQuantity,
            order.limitPrice,
            order.stopPrice,
            order.state,
        ]);
        return order;
    }

    async update(order: OrderBook): Promise<void> {
        const query = `
            UPDATE order_book
            SET remaining_quantity = ?, state = ?, updated_at = NOW()
            WHERE id = ?
        `;
        await this.pool.execute(query, [order.remainingQuantity, order.state, order.id]);
    }

    async remove(id: string): Promise<void> {
        await this.pool.execute('DELETE FROM order_book WHERE id = ?', [id]);
    }

    async getById(id: string): Promise<OrderBook | null> {
        const [rows] = await this.pool.execute<OrderBookRow[]>('SELECT * FROM order_book WHERE id = ?', [id]);
        return rows.length > 0 ? this.mapRowToOrderBook(rows[0]) : null;
    }

    async getAll(): Promise<OrderBook[]> {
        const [rows] = await this.pool.execute<OrderBookRow[]>('SELECT * FROM order_book ORDER BY created_at DESC');
        return rows.map(row => this.mapRowToOrderBook(row));
    }

    async getByStockId(stockId: string): Promise<OrderBook[]> {
        const [rows] = await this.pool.execute<OrderBookRow[]>('SELECT * FROM order_book WHERE stock_id = ? ORDER BY created_at DESC', [stockId]);
        return rows.map(row => this.mapRowToOrderBook(row));
    }

    async getByUserId(userId: string): Promise<OrderBook[]> {
        const [rows] = await this.pool.execute<OrderBookRow[]>('SELECT * FROM order_book WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        return rows.map(row => this.mapRowToOrderBook(row));
    }

    async getByStockIdAndSide(stockId: string, side: OrderSide): Promise<OrderBook[]> {
        const [rows] = await this.pool.execute<OrderBookRow[]>(
            'SELECT * FROM order_book WHERE stock_id = ? AND side = ? ORDER BY limit_price ASC, created_at ASC',
            [stockId, side]
        );
        return rows.map(row => this.mapRowToOrderBook(row));
    }

    async getActiveOrders(stockId: string): Promise<OrderBook[]> {
        const [rows] = await this.pool.execute<OrderBookRow[]>(
            'SELECT * FROM order_book WHERE stock_id = ? AND state IN (?, ?) ORDER BY created_at DESC',
            [stockId, 'PENDING', 'PARTIAL']
        );
        return rows.map(row => this.mapRowToOrderBook(row));
    }

    async getByState(state: OrderBookState): Promise<OrderBook[]> {
        const [rows] = await this.pool.execute<OrderBookRow[]>('SELECT * FROM order_book WHERE state = ? ORDER BY created_at DESC', [state]);
        return rows.map(row => this.mapRowToOrderBook(row));
    }

    private mapRowToOrderBook(row: OrderBookRow): OrderBook {
        const user = new User(
            row.user_id,
            '',
            '',
            '',
            '',
            '',
            'CLIENT',
            'ACTIVE',
            [],
            [],
            [],
            new Date()
        );

        const stock = new Stock(
            row.stock_id,
            '',
            '',
            null,
            0,
            null,
            null,
            null,
            0,
            true,
            [],
            new Date(),
            new Date()
        );

        return new OrderBook(
            row.id,
            stock,
            user,
            row.side as OrderSide,
            row.order_type as OrderBookType,
            parseFloat(row.quantity),
            parseFloat(row.remaining_quantity),
            row.limit_price ? parseFloat(row.limit_price) : null,
            row.stop_price ? parseFloat(row.stop_price) : null,
            row.state as OrderBookState,
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }
}
