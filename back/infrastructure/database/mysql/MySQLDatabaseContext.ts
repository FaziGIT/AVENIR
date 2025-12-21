import { DatabaseContext } from '../DatabaseContext';
import { pool } from './connection';
import { MySQLUserRepository } from '../../adapters/repositories/mysql/MySQLUserRepository';
import { MySQLChatRepository } from '../../adapters/repositories/mysql/MySQLChatRepository';
import { MySQLMessageRepository } from '../../adapters/repositories/mysql/MySQLMessageRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { ChatRepository } from '@avenir/domain/repositories/ChatRepository';
import { MessageRepository } from '@avenir/domain/repositories/MessageRepository';

export class MySQLDatabaseContext implements DatabaseContext {
    public readonly userRepository: UserRepository;
    public readonly chatRepository: ChatRepository;
    public readonly messageRepository: MessageRepository;

    constructor() {
        this.userRepository = new MySQLUserRepository(pool);
        this.chatRepository = new MySQLChatRepository(pool);
        this.messageRepository = new MySQLMessageRepository(pool);
    }

    async close(): Promise<void> {
        await pool.end();
    }
}
