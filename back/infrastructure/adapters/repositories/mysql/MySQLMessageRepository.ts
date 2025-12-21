import { Connection } from 'mysql2/promise';
import { Message } from '@avenir/domain/entities/Message';
import { MessageRepository } from '@avenir/domain/repositories/MessageRepository';
import { User } from '@avenir/domain/entities/User';
import { UserRole } from '@avenir/domain/enumerations/UserRole';
import { UserState } from '@avenir/domain/enumerations/UserState';

export class MySQLMessageRepository implements MessageRepository {
    constructor(private connection: Connection) {}

    async getById(id: string): Promise<Message | null> {
        const query = `
            SELECT m.*, 
                   u.id as sender_id, u.first_name, u.last_name, u.email, 
                   u.identity_number, u.passcode, u.role, u.state, u.created_at as user_created_at
            FROM messages m
            INNER JOIN users u ON m.sender_id = u.id
            WHERE m.id = ?
        `;

        const [rows]: any = await this.connection.execute(query, [id]);
        return rows.length === 0 ? null : this.mapRowToMessage(rows[0]);
    }

    async getByChatId(chatId: string): Promise<Message[]> {
        const query = `
            SELECT m.*, 
                   u.id as sender_id, u.first_name, u.last_name, u.email, 
                   u.identity_number, u.passcode, u.role, u.state, u.created_at as user_created_at
            FROM messages m
            INNER JOIN users u ON m.sender_id = u.id
            WHERE m.chat_id = ?
            ORDER BY m.created_at ASC
        `;

        const [rows]: any = await this.connection.execute(query, [chatId]);
        return rows.map((row: any) => this.mapRowToMessage(row));
    }

    async add(message: Message): Promise<Message> {
        const query = `
            INSERT INTO messages (id, chat_id, sender_id, content, is_read, type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await this.connection.execute(query, [
            message.id,
            message.chatId,
            message.sender.id,
            message.content,
            message.isRead,
            message.type,
            message.createdAt
        ]);

        return new Message(
            message.id,
            message.chatId,
            message.sender,
            message.content,
            message.isRead,
            message.createdAt,
            message.type
        );
    }

    async update(message: Message): Promise<void> {
        const query = `
            UPDATE messages
            SET content = ?, is_read = ?
            WHERE id = ?
        `;

        await this.connection.execute(query, [
            message.content,
            message.isRead,
            message.id
        ]);
    }

    async remove(id: string): Promise<void> {
        await this.connection.execute('DELETE FROM messages WHERE id = ?', [id]);
    }

    async markAsRead(messageId: string): Promise<void> {
        const query = `
            UPDATE messages
            SET is_read = TRUE
            WHERE id = ?
        `;

        await this.connection.execute(query, [messageId]);
    }

    async markChatMessagesAsRead(chatId: string, userId: string): Promise<void> {
        const query = `
            UPDATE messages
            SET is_read = TRUE
            WHERE chat_id = ? AND sender_id != ? AND is_read = FALSE
        `;

        await this.connection.execute(query, [chatId, userId]);
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

        const [rows]: any = await this.connection.execute(query);
        return rows.map((row: any) => this.mapRowToMessage(row));
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
