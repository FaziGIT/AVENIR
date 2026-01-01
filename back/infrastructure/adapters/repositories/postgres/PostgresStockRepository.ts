import { Pool } from 'pg';
import { Stock } from '../../../../domain/entities/Stock';
import { StockRepository } from '../../../../domain/repositories/StockRepository';

export class PostgresStockRepository implements StockRepository {
    constructor(private pool: Pool) {}

    async add(stock: Stock): Promise<Stock> {
        const query = `
            INSERT INTO stocks (id, symbol, name, isin, current_price, best_bid, best_ask, market_cap, volume_24h, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        try {
            const result = await this.pool.query(query, [
                stock.id,
                stock.symbol,
                stock.name,
                stock.isin,
                stock.currentPrice,
                stock.bestBid,
                stock.bestAsk,
                stock.marketCap,
                stock.volume24h,
                stock.isActive,
                stock.createdAt,
                stock.updatedAt
            ]);
            return this.mapRowToStock(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async update(stock: Stock): Promise<void> {
        const query = `
            UPDATE stocks
            SET symbol = $2, name = $3, isin = $4, current_price = $5,
                best_bid = $6, best_ask = $7, market_cap = $8, volume_24h = $9,
                is_active = $10, updated_at = $11
            WHERE id = $1
        `;

        try {
            await this.pool.query(query, [
                stock.id,
                stock.symbol,
                stock.name,
                stock.isin,
                stock.currentPrice,
                stock.bestBid,
                stock.bestAsk,
                stock.marketCap,
                stock.volume24h,
                stock.isActive,
                new Date()
            ]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM stocks WHERE id = $1', [id]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Stock | null> {
        try {
            const result = await this.pool.query('SELECT * FROM stocks WHERE id = $1', [id]);
            return result.rows.length === 0 ? null : this.mapRowToStock(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getBySymbol(symbol: string): Promise<Stock | null> {
        try {
            const result = await this.pool.query('SELECT * FROM stocks WHERE symbol = $1', [symbol]);
            return result.rows.length === 0 ? null : this.mapRowToStock(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getAll(): Promise<Stock[]> {
        try {
            const result = await this.pool.query('SELECT * FROM stocks ORDER BY symbol ASC');
            return result.rows.map(row => this.mapRowToStock(row));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getAllActive(): Promise<Stock[]> {
        try {
            const result = await this.pool.query('SELECT * FROM stocks WHERE is_active = true ORDER BY symbol ASC');
            return result.rows.map(row => this.mapRowToStock(row));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    private mapRowToStock(row: any): Stock {
        return new Stock(
            row.id,
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
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }
}
