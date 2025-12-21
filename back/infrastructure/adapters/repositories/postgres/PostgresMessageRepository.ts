import { Pool } from 'pg';
import { Message } from '@avenir/domain/entities/Message';
import { MessageRepository } from '@avenir/domain/repositories/MessageRepository';
import { User } from '@avenir/domain/entities/User';
import { UserRole } from '@avenir/domain/enumerations/UserRole';
import { UserState } from '@avenir/domain/enumerations/UserState';

export class PostgresMessageRepository implements MessageRepository {
    constructor(private pool: Pool) {}

    async getById(id: string): Promise<Message | null> {
        const query = `
            SELECT m.*, 
                   u.id as sender_id, u.first_name, u.last_name, u.email, 
                   u.identity_number, u.passcode, u.role, u.state, u.created_at as user_created_at
            FROM messages m
            INNER JOIN users u ON m.sender_id = u.id
            WHERE m.id = $1
        `;

        const result = await this.pool.query(query, [id]);
        return result.rows.length === 0 ? null : this.mapRowToMessage(result.rows[0]);
    }

    async getByChatId(chatId: string): Promise<Message[]> {
        const query = `
            SELECT m.*, 
                   u.id as sender_id, u.first_name, u.last_name, u.email, 
                   u.identity_number, u.passcode, u.role, u.state, u.created_at as user_created_at
            FROM messages m
            INNER JOIN users u ON m.sender_id = u.id
            WHERE m.chat_id = $1
            ORDER BY m.created_at ASC
        `;

        const result = await this.pool.query(query, [chatId]);
        return result.rows.map(row => this.mapRowToMessage(row));
    }

    async add(message: Message): Promise<Message> {
        const query = `
            INSERT INTO messages (id, chat_id, sender_id, content, is_read, type, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await this.pool.query(query, [
            message.id,
            message.chatId,
            message.sender.id,
            message.content,
            message.isRead,
            message.type,
            message.createdAt
        ]);

        return new Message(
            result.rows[0].id,
            result.rows[0].chat_id,
            message.sender,
            result.rows[0].content,
            result.rows[0].is_read,
            result.rows[0].created_at,
            result.rows[0].type
        );
    }

    async update(message: Message): Promise<void> {
        const query = `
            UPDATE messages
            SET content = $2, is_read = $3
            WHERE id = $1
        `;

        await this.pool.query(query, [
            message.id,
            message.content,
            message.isRead
        ]);
    }

    async remove(id: string): Promise<void> {
        await this.pool.query('DELETE FROM messages WHERE id = $1', [id]);
    }

    async markAsRead(messageId: string): Promise<void> {
        const query = `
            UPDATE messages
            SET is_read = TRUE
            WHERE id = $1
        `;

        await this.pool.query(query, [messageId]);
    }

    async markChatMessagesAsRead(chatId: string, userId: string): Promise<void> {
        const query = `
            UPDATE messages
            SET is_read = TRUE
            WHERE chat_id = $1 AND sender_id != $2 AND is_read = FALSE
        `;

        await this.pool.query(query, [chatId, userId]);
    }

    async getAll(): Promise<Message[]> {
        const query = `
            SELECT m.*, 
                   u.id as sender_id, u.first_name, u.last_name, u.email, 
                   u.identity_number, u.passcode, u.role, u.state, u.created_at as user_created_at
            FROM messages m
            INNER JOIN users u ON m.sender_id = u.id
            ORDER BY m.created_at DESC
        `;

        const result = await this.pool.query(query);
        return result.rows.map(row => this.mapRowToMessage(row));
    }

    private mapRowToMessage(row: any): Message {
        const sender = new User(
            row.sender_id,
            row.first_name,
            row.last_name,
            row.email,
            row.identity_number,
            row.passcode,
            row.role as UserRole,
            row.state as UserState,
            [],
            [],
            [],
            row.user_created_at
        );

        return new Message(
            row.id,
            row.chat_id,
            sender,
            row.content,
            row.is_read,
            row.created_at,
            row.type || 'NORMAL'
        );
    }
}
