import { Pool, RowDataPacket } from 'mysql2/promise';
import { PortfolioRepository } from '@avenir/domain/repositories/PortfolioRepository';
import { Portfolio } from '@avenir/domain/entities/Portfolio';
import { User } from '@avenir/domain/entities/User';
import { Stock } from '@avenir/domain/entities/Stock';
import { UserRole } from '@avenir/domain/enumerations/UserRole';
import { UserState } from '@avenir/domain/enumerations/UserState';
import { Account } from '@avenir/domain/entities/Account';

interface PortfolioRow extends RowDataPacket {
    portfolio_id: string;
    user_id: string;
    stock_id: string;
    quantity: string;
    average_buy_price: string;
    total_invested: string;
    portfolio_created_at: Date;
    portfolio_updated_at: Date;
    email: string;
    name: string;
    firstname: string;
    phone_number: string;
    is_verified: number;
    role: string;
    user_created_at: Date;
    symbol: string;
    stock_name: string;
    isin: string | null;
    current_price: string;
    best_bid: string | null;
    best_ask: string | null;
    market_cap: string | null;
    volume_24h: string;
    is_active: number;
    stock_created_at: Date;
    stock_updated_at: Date;
}

export class MySQLPortfolioRepository implements PortfolioRepository {
    constructor(private pool: Pool) {}

    async add(portfolio: Portfolio): Promise<Portfolio> {
        const query = `
            INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await this.pool.execute(query, [
            portfolio.id,
            portfolio.user.id,
            portfolio.stock.id,
            portfolio.quantity,
            portfolio.averageBuyPrice,
            portfolio.totalInvested,
        ]);
        return portfolio;
    }

    async update(portfolio: Portfolio): Promise<void> {
        const query = `
            UPDATE portfolios
            SET quantity = ?, average_buy_price = ?, total_invested = ?, updated_at = NOW()
            WHERE id = ?
        `;
        await this.pool.execute(query, [
            portfolio.quantity,
            portfolio.averageBuyPrice,
            portfolio.totalInvested,
            portfolio.id,
        ]);
    }

    async remove(id: string): Promise<void> {
        await this.pool.execute('DELETE FROM portfolios WHERE id = ?', [id]);
    }

    async getById(id: string): Promise<Portfolio | null> {
        const query = `
            SELECT p.id as portfolio_id, p.user_id, p.stock_id, p.quantity, p.average_buy_price, p.total_invested,
                   p.created_at as portfolio_created_at, p.updated_at as portfolio_updated_at,
                   u.email, u.name, u.firstname, u.phone_number, u.is_verified, u.role, u.created_at as user_created_at,
                   s.symbol, s.name as stock_name, s.isin, s.current_price, s.best_bid, s.best_ask,
                   s.market_cap, s.volume_24h, s.is_active, s.created_at as stock_created_at, s.updated_at as stock_updated_at
            FROM portfolios p
            JOIN users u ON p.user_id = u.id
            JOIN stocks s ON p.stock_id = s.id
            WHERE p.id = ?
        `;
        const [rows] = await this.pool.execute<PortfolioRow[]>(query, [id]);
        return rows.length > 0 ? this.mapRowToPortfolio(rows[0]) : null;
    }

    async getByUserId(userId: string): Promise<Portfolio[]> {
        const query = `
            SELECT p.id as portfolio_id, p.user_id, p.stock_id, p.quantity, p.average_buy_price, p.total_invested,
                   p.created_at as portfolio_created_at, p.updated_at as portfolio_updated_at,
                   u.email, u.name, u.firstname, u.phone_number, u.is_verified, u.role, u.created_at as user_created_at,
                   s.symbol, s.name as stock_name, s.isin, s.current_price, s.best_bid, s.best_ask,
                   s.market_cap, s.volume_24h, s.is_active, s.created_at as stock_created_at, s.updated_at as stock_updated_at
            FROM portfolios p
            JOIN users u ON p.user_id = u.id
            JOIN stocks s ON p.stock_id = s.id
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
        `;
        const [rows] = await this.pool.execute<PortfolioRow[]>(query, [userId]);
        return rows.map(row => this.mapRowToPortfolio(row));
    }

    async getByUserIdAndStockId(userId: string, stockId: string): Promise<Portfolio | null> {
        const query = `
            SELECT p.id as portfolio_id, p.user_id, p.stock_id, p.quantity, p.average_buy_price, p.total_invested,
                   p.created_at as portfolio_created_at, p.updated_at as portfolio_updated_at,
                   u.email, u.name, u.firstname, u.phone_number, u.is_verified, u.role, u.created_at as user_created_at,
                   s.symbol, s.name as stock_name, s.isin, s.current_price, s.best_bid, s.best_ask,
                   s.market_cap, s.volume_24h, s.is_active, s.created_at as stock_created_at, s.updated_at as stock_updated_at
            FROM portfolios p
            JOIN users u ON p.user_id = u.id
            JOIN stocks s ON p.stock_id = s.id
            WHERE p.user_id = ? AND p.stock_id = ?
        `;
        const [rows] = await this.pool.execute<PortfolioRow[]>(query, [userId, stockId]);
        return rows.length > 0 ? this.mapRowToPortfolio(rows[0]) : null;
    }

    async getAll(): Promise<Portfolio[]> {
        const query = `
            SELECT p.id as portfolio_id, p.user_id, p.stock_id, p.quantity, p.average_buy_price, p.total_invested,
                   p.created_at as portfolio_created_at, p.updated_at as portfolio_updated_at,
                   u.email, u.name, u.firstname, u.phone_number, u.is_verified, u.role, u.created_at as user_created_at,
                   s.symbol, s.name as stock_name, s.isin, s.current_price, s.best_bid, s.best_ask,
                   s.market_cap, s.volume_24h, s.is_active, s.created_at as stock_created_at, s.updated_at as stock_updated_at
            FROM portfolios p
            JOIN users u ON p.user_id = u.id
            JOIN stocks s ON p.stock_id = s.id
            ORDER BY p.created_at DESC
        `;
        const [rows] = await this.pool.execute<PortfolioRow[]>(query);
        return rows.map(row => this.mapRowToPortfolio(row));
    }

    private mapRowToPortfolio(row: PortfolioRow): Portfolio {
        const user = new User(
            row.user_id,
            row.firstname,
            row.name,
            row.email,
            '',
            '',
            row.role as UserRole,
            UserState.ACTIVE,
            [],
            [],
            [],
            new Date(row.user_created_at)
        );

        const stock = new Stock(
            row.stock_id,
            row.symbol,
            row.stock_name,
            row.isin,
            parseFloat(row.current_price),
            row.best_bid ? parseFloat(row.best_bid) : null,
            row.best_ask ? parseFloat(row.best_ask) : null,
            row.market_cap ? parseInt(row.market_cap) : null,
            parseInt(row.volume_24h),
            row.is_active === 1,
            [],
            new Date(row.stock_created_at),
            new Date(row.stock_updated_at)
        );

        return new Portfolio(
            row.portfolio_id,
            user,
            stock,
            parseInt(row.quantity),
            parseFloat(row.average_buy_price),
            parseFloat(row.total_invested),
            new Date(row.portfolio_created_at),
            new Date(row.portfolio_updated_at)
        );
    }
}
