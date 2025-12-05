import { UserRepository } from '../../application/ports/repositories/UserRepository';
import { databaseConfig, DatabaseType } from '../config/database.config';
import { DatabaseContext } from '../database/DatabaseContext';
import { PostgresDatabaseContext } from '../database/postgres/PostgresDatabaseContext';
import { MySQLDatabaseContext } from '../database/mysql/MySQLDatabaseContext';

export class RepositoryFactory {
    static createUserRepository(): UserRepository {
        return this.createDatabaseContext().userRepository;
    }

    static createDatabaseContext(): DatabaseContext {
        const dbType: DatabaseType = databaseConfig.type;
        
        console.log(`Initialisation ${dbType.toUpperCase()}`);
        
        switch (dbType) {
            case 'postgres':
                return new PostgresDatabaseContext();
            case 'mysql':
                return new MySQLDatabaseContext();
            default:
                throw new Error(`Type de base de données non supporté: ${dbType}`);
        }
    }
    
    static async closeConnections(): Promise<void> {
        const ctx = this.createDatabaseContext();
        await ctx.close();
        console.log(`Connexions fermées`);
    }
}

