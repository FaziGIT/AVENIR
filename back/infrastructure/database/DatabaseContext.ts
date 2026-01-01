import { UserRepository } from '../../domain/repositories/UserRepository';
import { ChatRepository } from '../../domain/repositories/ChatRepository';
import { MessageRepository } from '../../domain/repositories/MessageRepository';
import { AccountRepository } from '../../domain/repositories/AccountRepository';
import { StockRepository } from '../../domain/repositories/StockRepository';
import { PortfolioRepository } from '../../domain/repositories/PortfolioRepository';
import { OrderBookRepository } from '../../domain/repositories/OrderBookRepository';
import { TradeRepository } from '../../domain/repositories/TradeRepository';

export interface DatabaseContext {
    userRepository: UserRepository;
    chatRepository: ChatRepository;
    messageRepository: MessageRepository;
    accountRepository: AccountRepository;
    stockRepository: StockRepository;
    portfolioRepository: PortfolioRepository;
    orderBookRepository: OrderBookRepository;
    tradeRepository: TradeRepository;
    close(): Promise<void>;
}
