import * as dotenv from 'dotenv';

dotenv.config();

export type DatabaseType = 'postgres' | 'mysql';

export interface DatabaseConfig {
    type: DatabaseType;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}

const getDefaultPort = (dbType: DatabaseType): number => {
    return dbType === 'mysql' ? 3306 : 5432;
};

const dbType = process.env.DB_TYPE as DatabaseType;
if (!dbType) {
    throw new Error('DB_TYPE is not set');
}

export const databaseConfig: DatabaseConfig = {
    type: dbType,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : getDefaultPort(dbType),
    database: process.env.DB_NAME || 'avenir_db',
    username: process.env.DB_USER || 'avenir_user',
    password: process.env.DB_PASSWORD || 'avenir_password',
};
