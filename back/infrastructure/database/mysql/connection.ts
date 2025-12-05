import mysql from 'mysql2/promise';
import { databaseConfig } from '../../config/database.config';

export const pool = mysql.createPool({
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.database,
    user: databaseConfig.username,
    password: databaseConfig.password,
    connectionLimit: 20,
    queueLimit: 0,
});
