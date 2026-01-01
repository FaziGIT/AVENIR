import { DatabaseContext } from '../DatabaseContext';
import { pool } from './connection';
import { MySQLUserRepository } from '../../adapters/repositories/mysql/MySQLUserRepository';
import { MySQLChatRepository } from '../../adapters/repositories/mysql/MySQLChatRepository';
import { MySQLMessageRepository } from '../../adapters/repositories/mysql/MySQLMessageRepository';
import { MySQLAccountRepository } from '../../adapters/repositories/mysql/MySQLAccountRepository';
import { MySQLStockRepository } from '../../adapters/repositories/mysql/MySQLStockRepository';
import { MySQLPortfolioRepository } from '../../adapters/repositories/mysql/MySQLPortfolioRepository';
import { MySQLOrderBookRepository } from '../../adapters/repositories/mysql/MySQLOrderBookRepository';
import { MySQLTradeRepository } from '../../adapters/repositories/mysql/MySQLTradeRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { ChatRepository } from '@avenir/domain/repositories/ChatRepository';
import { MessageRepository } from '@avenir/domain/repositories/MessageRepository';
import { AccountRepository } from '@avenir/domain/repositories/AccountRepository';
import { StockRepository } from '@avenir/domain/repositories/StockRepository';
import { PortfolioRepository } from '@avenir/domain/repositories/PortfolioRepository';
import { OrderBookRepository } from '@avenir/domain/repositories/OrderBookRepository';
import { TradeRepository } from '@avenir/domain/repositories/TradeRepository';

export class MySQLDatabaseContext implements DatabaseContext {
    public readonly userRepository: UserRepository;
    public readonly chatRepository: ChatRepository;
    public readonly messageRepository: MessageRepository;
    public readonly accountRepository: AccountRepository;
    public readonly stockRepository: StockRepository;
    public readonly portfolioRepository: PortfolioRepository;
    public readonly orderBookRepository: OrderBookRepository;
    public readonly tradeRepository: TradeRepository;

    constructor() {
        this.userRepository = new MySQLUserRepository(pool);
        this.chatRepository = new MySQLChatRepository(pool);
        this.messageRepository = new MySQLMessageRepository(pool);
        this.accountRepository = new MySQLAccountRepository(pool);
        this.stockRepository = new MySQLStockRepository(pool);
        this.portfolioRepository = new MySQLPortfolioRepository(pool);
        this.orderBookRepository = new MySQLOrderBookRepository(pool);
        this.tradeRepository = new MySQLTradeRepository(pool);
    }

    async close(): Promise<void> {
        await pool.end();
    }
}
