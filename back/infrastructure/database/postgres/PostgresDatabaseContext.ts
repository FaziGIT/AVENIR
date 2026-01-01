import { DatabaseContext } from '../DatabaseContext';
import { pool } from './connection';
import { PostgresUserRepository } from '../../adapters/repositories/postgres/PostgresUserRepository';
import { PostgresChatRepository } from '../../adapters/repositories/postgres/PostgresChatRepository';
import { PostgresMessageRepository } from '../../adapters/repositories/postgres/PostgresMessageRepository';
import { PostgresAccountRepository } from '../../adapters/repositories/postgres/PostgresAccountRepository';
import { PostgresStockRepository } from '../../adapters/repositories/postgres/PostgresStockRepository';
import { PostgresPortfolioRepository } from '../../adapters/repositories/postgres/PostgresPortfolioRepository';
import { PostgresOrderBookRepository } from '../../adapters/repositories/postgres/PostgresOrderBookRepository';
import { PostgresTradeRepository } from '../../adapters/repositories/postgres/PostgresTradeRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { ChatRepository } from '@avenir/domain/repositories/ChatRepository';
import { MessageRepository } from '@avenir/domain/repositories/MessageRepository';
import { AccountRepository } from '@avenir/domain/repositories/AccountRepository';
import { StockRepository } from '@avenir/domain/repositories/StockRepository';
import { PortfolioRepository } from '@avenir/domain/repositories/PortfolioRepository';
import { OrderBookRepository } from '@avenir/domain/repositories/OrderBookRepository';
import { TradeRepository } from '@avenir/domain/repositories/TradeRepository';

export class PostgresDatabaseContext implements DatabaseContext {
    public readonly userRepository: UserRepository;
    public readonly chatRepository: ChatRepository;
    public readonly messageRepository: MessageRepository;
    public readonly accountRepository: AccountRepository;
    public readonly stockRepository: StockRepository;
    public readonly portfolioRepository: PortfolioRepository;
    public readonly orderBookRepository: OrderBookRepository;
    public readonly tradeRepository: TradeRepository;

    constructor() {
        this.userRepository = new PostgresUserRepository(pool);
        this.chatRepository = new PostgresChatRepository(pool);
        this.messageRepository = new PostgresMessageRepository(pool);
        this.accountRepository = new PostgresAccountRepository(pool);
        this.stockRepository = new PostgresStockRepository(pool);
        this.portfolioRepository = new PostgresPortfolioRepository(pool);
        this.orderBookRepository = new PostgresOrderBookRepository(pool);
        this.tradeRepository = new PostgresTradeRepository(pool);
    }

    async close(): Promise<void> {
        await pool.end();
    }
}
