import { Stock } from "../entities/Stock";

export interface StockRepository {
    add(stock: Stock): Promise<Stock>;
    update(stock: Stock): Promise<void>;
    remove(id: string): Promise<void>;
    getById(id: string): Promise<Stock | null>;
    getBySymbol(symbol: string): Promise<Stock | null>;
    getAll(): Promise<Stock[]>;
    getAllActive(): Promise<Stock[]>;
}
