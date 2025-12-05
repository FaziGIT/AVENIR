import { DatabaseContext } from '../DatabaseContext';
import { pool } from './connection';
import { MySQLUserRepository } from '../../repositories/mysql/MySQLUserRepository';

export class MySQLDatabaseContext implements DatabaseContext {
    public readonly userRepository: MySQLUserRepository;

    constructor() {
        this.userRepository = new MySQLUserRepository(pool);
    }

    async close(): Promise<void> {
        await pool.end();
    }
}
