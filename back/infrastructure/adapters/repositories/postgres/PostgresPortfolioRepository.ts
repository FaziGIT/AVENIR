import { Pool } from 'pg';
import { Portfolio } from '../../../../domain/entities/Portfolio';
import { PortfolioRepository } from '../../../../domain/repositories/PortfolioRepository';
import { User } from '../../../../domain/entities/User';
import { Stock } from '../../../../domain/entities/Stock';
import { UserRole } from '../../../../domain/enumerations/UserRole';
import { UserState } from '../../../../domain/enumerations/UserState';

export class PostgresPortfolioRepository implements PortfolioRepository {
    constructor(private pool: Pool) {}

    async add(portfolio: Portfolio): Promise<Portfolio> {
        const query = `
            INSERT INTO portfolios (id, user_id, stock_id, quantity, average_buy_price, total_invested, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        try {
            const result = await this.pool.query(query, [
                portfolio.id,
                portfolio.user.id,
                portfolio.stock.id,
                portfolio.quantity,
                portfolio.averageBuyPrice,
                portfolio.totalInvested,
                portfolio.createdAt,
                portfolio.updatedAt
            ]);
            return await this.mapRowToPortfolio(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async update(portfolio: Portfolio): Promise<void> {
        const query = `
            UPDATE portfolios
            SET quantity = $2, average_buy_price = $3, total_invested = $4, updated_at = $5
            WHERE id = $1
        `;

        try {
            await this.pool.query(query, [
                portfolio.id,
                portfolio.quantity,
                portfolio.averageBuyPrice,
                portfolio.totalInvested,
                new Date()
            ]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        try {
            await this.pool.query('DELETE FROM portfolios WHERE id = $1', [id]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Portfolio | null> {
        try {
            const query = `
                SELECT p.*, u.*, s.*,
                       p.id as portfolio_id, p.created_at as portfolio_created_at, p.updated_at as portfolio_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM portfolios p
                JOIN users u ON p.user_id = u.id
                JOIN stocks s ON p.stock_id = s.id
                WHERE p.id = $1
            `;
            const result = await this.pool.query(query, [id]);
            return result.rows.length === 0 ? null : await this.mapRowToPortfolio(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByUserId(userId: string): Promise<Portfolio[]> {
        try {
            const query = `
                SELECT p.*, u.*, s.*,
                       p.id as portfolio_id, p.created_at as portfolio_created_at, p.updated_at as portfolio_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM portfolios p
                JOIN users u ON p.user_id = u.id
                JOIN stocks s ON p.stock_id = s.id
                WHERE p.user_id = $1
                ORDER BY p.created_at DESC
            `;
            const result = await this.pool.query(query, [userId]);
            return Promise.all(result.rows.map(row => this.mapRowToPortfolio(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getByUserIdAndStockId(userId: string, stockId: string): Promise<Portfolio | null> {
        try {
            const query = `
                SELECT p.*, u.*, s.*,
                       p.id as portfolio_id, p.created_at as portfolio_created_at, p.updated_at as portfolio_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM portfolios p
                JOIN users u ON p.user_id = u.id
                JOIN stocks s ON p.stock_id = s.id
                WHERE p.user_id = $1 AND p.stock_id = $2
            `;
            const result = await this.pool.query(query, [userId, stockId]);
            return result.rows.length === 0 ? null : await this.mapRowToPortfolio(result.rows[0]);
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    async getAll(): Promise<Portfolio[]> {
        try {
            const query = `
                SELECT p.*, u.*, s.*,
                       p.id as portfolio_id, p.created_at as portfolio_created_at, p.updated_at as portfolio_updated_at,
                       u.id as user_id, u.created_at as user_created_at,
                       s.id as stock_id, s.created_at as stock_created_at, s.updated_at as stock_updated_at
                FROM portfolios p
                JOIN users u ON p.user_id = u.id
                JOIN stocks s ON p.stock_id = s.id
                ORDER BY p.created_at DESC
            `;
            const result = await this.pool.query(query);
            return Promise.all(result.rows.map(row => this.mapRowToPortfolio(row)));
        } catch (error) {
            console.error('PostgreSQL error:', error);
            throw error;
        }
    }

    private async mapRowToPortfolio(row: any): Promise<Portfolio> {
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

        return new Portfolio(
            row.portfolio_id,
            user,
            stock,
            parseFloat(row.quantity),
            parseFloat(row.average_buy_price),
            parseFloat(row.total_invested),
            new Date(row.portfolio_created_at),
            new Date(row.portfolio_updated_at)
        );
    }
}
