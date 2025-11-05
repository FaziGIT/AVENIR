import { User } from "./User";
import { OrderType } from "../enum/Order/Type";
import { Action } from "./Action";
import { OrderState } from "../enum/Order/State";

export class Order {
    public constructor(
        public readonly id: string,
        public readonly client: User,
        public readonly action: Action,
        public readonly type: OrderType,
        public readonly numberOfActions: number,
        public readonly purchasePrice: number,
        public readonly salePrice: number,
        public readonly state: OrderState,
        public readonly fees: number = 1,

        public readonly createdAt: Date,
    ) {}
}