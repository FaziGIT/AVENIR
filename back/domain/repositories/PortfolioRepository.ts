import { Portfolio } from "../entities/Portfolio";

export interface PortfolioRepository {
    add(portfolio: Portfolio): Promise<Portfolio>;
    update(portfolio: Portfolio): Promise<void>;
    remove(id: string): Promise<void>;
    getById(id: string): Promise<Portfolio | null>;
    getByUserId(userId: string): Promise<Portfolio[]>;
    getByUserIdAndStockId(userId: string, stockId: string): Promise<Portfolio | null>;
    getAll(): Promise<Portfolio[]>;
}
