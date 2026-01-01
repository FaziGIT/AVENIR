import { User } from "./User";
import { Stock } from "./Stock";
import { OrderSide } from "../enumerations/OrderSide";
import { OrderBookType } from "../enumerations/OrderBookType";
import { OrderBookState } from "../enumerations/OrderBookState";

export class OrderBook {
    constructor(
        readonly id: string,
        readonly stock: Stock,
        readonly user: User,
        readonly side: OrderSide,
        readonly orderType: OrderBookType,
        readonly quantity: number,
        readonly remainingQuantity: number,
        readonly limitPrice: number | null,
        readonly stopPrice: number | null,
        readonly state: OrderBookState,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    isFilled(): boolean {
        return this.remainingQuantity === 0 || this.state === OrderBookState.FILLED;
    }

    isPartiallyFilled(): boolean {
        return this.remainingQuantity > 0 && this.remainingQuantity < this.quantity && this.state === OrderBookState.PARTIAL;
    }

    getFilledQuantity(): number {
        return this.quantity - this.remainingQuantity;
    }

    getFilledPercentage(): number {
        return (this.getFilledQuantity() / this.quantity) * 100;
    }
}
