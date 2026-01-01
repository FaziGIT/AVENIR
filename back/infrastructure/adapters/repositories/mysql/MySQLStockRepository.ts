import { Pool, RowDataPacket } from 'mysql2/promise';
import { StockRepository } from '@avenir/domain/repositories/StockRepository';
import { Stock } from '@avenir/domain/entities/Stock';

interface StockRow extends RowDataPacket {
    id: string;
    symbol: string;
    name: string;
    isin: string | null;
    current_price: string;
    best_bid: string | null;
    best_ask: string | null;
    market_cap: string | null;
    volume_24h: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
}

export class MySQLStockRepository implements StockRepository {
    constructor(private pool: Pool) {}

    async add(stock: Stock): Promise<Stock> {
        const query = `
            INSERT INTO stocks (id, symbol, name, isin, current_price, best_bid, best_ask, market_cap, volume_24h, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await this.pool.execute(query, [
            stock.id,
            stock.symbol,
            stock.name,
            stock.isin,
            stock.currentPrice,
            stock.bestBid,
            stock.bestAsk,
            stock.marketCap,
            stock.volume24h,
            stock.isActive ? 1 : 0,
        ]);
        return stock;
    }

    async update(stock: Stock): Promise<void> {
        const query = `
            UPDATE stocks
            SET symbol = ?, name = ?, isin = ?, current_price = ?, best_bid = ?, best_ask = ?,
                market_cap = ?, volume_24h = ?, is_active = ?, updated_at = NOW()
            WHERE id = ?
        `;
        await this.pool.execute(query, [
            stock.symbol,
            stock.name,
            stock.isin,
            stock.currentPrice,
            stock.bestBid,
            stock.bestAsk,
            stock.marketCap,
            stock.volume24h,
            stock.isActive ? 1 : 0,
            stock.id,
        ]);
    }

    async remove(id: string): Promise<void> {
        await this.pool.execute('DELETE FROM stocks WHERE id = ?', [id]);
    }

    async getById(id: string): Promise<Stock | null> {
        const [rows] = await this.pool.execute<StockRow[]>('SELECT * FROM stocks WHERE id = ?', [id]);
        return rows.length > 0 ? this.mapRowToStock(rows[0]) : null;
    }

    async getBySymbol(symbol: string): Promise<Stock | null> {
        const [rows] = await this.pool.execute<StockRow[]>('SELECT * FROM stocks WHERE symbol = ?', [symbol]);
        return rows.length > 0 ? this.mapRowToStock(rows[0]) : null;
    }

    async getAll(): Promise<Stock[]> {
        const [rows] = await this.pool.execute<StockRow[]>('SELECT * FROM stocks ORDER BY symbol ASC');
        return rows.map(row => this.mapRowToStock(row));
    }

    async getAllActive(): Promise<Stock[]> {
        const [rows] = await this.pool.execute<StockRow[]>('SELECT * FROM stocks WHERE is_active = 1 ORDER BY symbol ASC');
        return rows.map(row => this.mapRowToStock(row));
    }

    private mapRowToStock(row: StockRow): Stock {
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
            row.is_active === 1,
            [],
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }
}
