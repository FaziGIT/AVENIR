import { DatabaseContext } from '../DatabaseContext';
import { pool } from './connection';
import { MySQLUserRepository } from '../../adapters/repositories/mysql/MySQLUserRepository';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class MySQLDatabaseContext implements DatabaseContext {
    public readonly userRepository: UserRepository;

    constructor() {
        this.userRepository = new MySQLUserRepository(pool);
    }

    async close(): Promise<void> {
        await pool.end();
    }
}
