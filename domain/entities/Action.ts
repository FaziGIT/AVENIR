import { User } from "./User";

export class Action {
    public constructor(
        public readonly id: string,
        public readonly director: User,
        public readonly name: string,
        public readonly symbol: string,
        public readonly currentPrice: number,
        public readonly isActive: boolean,

        public readonly createdAt: Date,
    ) {}
}