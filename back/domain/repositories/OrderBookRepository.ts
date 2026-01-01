import { OrderBook } from "../entities/OrderBook";
import { OrderSide } from "../enumerations/OrderSide";
import { OrderBookState } from "../enumerations/OrderBookState";

export interface OrderBookRepository {
    add(orderBook: OrderBook): Promise<OrderBook>;
    update(orderBook: OrderBook): Promise<void>;
    remove(id: string): Promise<void>;
    getById(id: string): Promise<OrderBook | null>;
    getByUserId(userId: string): Promise<OrderBook[]>;
    getByStockId(stockId: string): Promise<OrderBook[]>;
    getByStockIdAndSide(stockId: string, side: OrderSide): Promise<OrderBook[]>;
    getActiveOrders(stockId: string): Promise<OrderBook[]>;
    getByState(state: OrderBookState): Promise<OrderBook[]>;
    getAll(): Promise<OrderBook[]>;
}
