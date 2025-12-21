import { DatabaseContext } from '../DatabaseContext';
import { pool } from './connection';
import { PostgresUserRepository } from '../../adapters/repositories/postgres/PostgresUserRepository';
import { PostgresChatRepository } from '../../adapters/repositories/postgres/PostgresChatRepository';
import { PostgresMessageRepository } from '../../adapters/repositories/postgres/PostgresMessageRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { ChatRepository } from '@avenir/domain/repositories/ChatRepository';
import { MessageRepository } from '@avenir/domain/repositories/MessageRepository';

export class PostgresDatabaseContext implements DatabaseContext {
    public readonly userRepository: UserRepository;
    public readonly chatRepository: ChatRepository;
    public readonly messageRepository: MessageRepository;

    constructor() {
        this.userRepository = new PostgresUserRepository(pool);
        this.chatRepository = new PostgresChatRepository(pool);
        this.messageRepository = new PostgresMessageRepository(pool);
    }

    async close(): Promise<void> {
        await pool.end();
    }
}
