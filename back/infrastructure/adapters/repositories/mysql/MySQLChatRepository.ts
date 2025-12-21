import { Connection } from 'mysql2/promise';
import { Chat } from '@avenir/domain/entities/Chat';
import { ChatRepository } from '@avenir/domain/repositories/ChatRepository';
import { ChatStatus } from '@avenir/domain/enumerations/ChatStatus';
import { User } from '@avenir/domain/entities/User';
import { UserRole } from '@avenir/domain/enumerations/UserRole';
import { UserState } from '@avenir/domain/enumerations/UserState';

export class MySQLChatRepository implements ChatRepository {
    constructor(private connection: Connection) {}

    async getById(id: string): Promise<Chat | null> {
        const query = `
            SELECT c.*, 
                   cl.id as client_id, cl.first_name as client_first_name, cl.last_name as client_last_name,
                   cl.email as client_email, cl.identity_number as client_identity_number, cl.passcode as client_passcode,
                   cl.role as client_role, cl.state as client_state, cl.created_at as client_created_at,
                   adv.id as advisor_id, adv.first_name as advisor_first_name, adv.last_name as advisor_last_name,
                   adv.email as advisor_email, adv.identity_number as advisor_identity_number, adv.passcode as advisor_passcode,
                   adv.role as advisor_role, adv.state as advisor_state, adv.created_at as advisor_created_at
            FROM chats c
            INNER JOIN users cl ON c.client_id = cl.id
            LEFT JOIN users adv ON c.advisor_id = adv.id
            WHERE c.id = ?
        `;

        const [rows]: any = await this.connection.execute(query, [id]);
        return rows.length === 0 ? null : this.mapRowToChat(rows[0]);
    }

    async getByClientId(clientId: string): Promise<Chat[]> {
        const query = `
            SELECT c.*, 
                   cl.id as client_id, cl.first_name as client_first_name, cl.last_name as client_last_name,
                   cl.email as client_email, cl.identity_number as client_identity_number, cl.passcode as client_passcode,
                   cl.role as client_role, cl.state as client_state, cl.created_at as client_created_at,
                   adv.id as advisor_id, adv.first_name as advisor_first_name, adv.last_name as advisor_last_name,
                   adv.email as advisor_email, adv.identity_number as advisor_identity_number, adv.passcode as advisor_passcode,
                   adv.role as advisor_role, adv.state as advisor_state, adv.created_at as advisor_created_at
            FROM chats c
            INNER JOIN users cl ON c.client_id = cl.id
            LEFT JOIN users adv ON c.advisor_id = adv.id
            WHERE c.client_id = ?
            ORDER BY c.updated_at DESC
        `;

        const [rows]: any = await this.connection.execute(query, [clientId]);
        return rows.map((row: any) => this.mapRowToChat(row));
    }

    async getByAdvisorId(advisorId: string): Promise<Chat[]> {
        const query = `
            SELECT c.*, 
                   cl.id as client_id, cl.first_name as client_first_name, cl.last_name as client_last_name,
                   cl.email as client_email, cl.identity_number as client_identity_number, cl.passcode as client_passcode,
                   cl.role as client_role, cl.state as client_state, cl.created_at as client_created_at,
                   adv.id as advisor_id, adv.first_name as advisor_first_name, adv.last_name as advisor_last_name,
                   adv.email as advisor_email, adv.identity_number as advisor_identity_number, adv.passcode as advisor_passcode,
                   adv.role as advisor_role, adv.state as advisor_state, adv.created_at as advisor_created_at
            FROM chats c
            INNER JOIN users cl ON c.client_id = cl.id
            LEFT JOIN users adv ON c.advisor_id = adv.id
            WHERE c.advisor_id = ?
            ORDER BY c.updated_at DESC
        `;

        const [rows]: any = await this.connection.execute(query, [advisorId]);
        return rows.map((row: any) => this.mapRowToChat(row));
    }

    async getPendingChats(): Promise<Chat[]> {
        const query = `
            SELECT c.*, 
                   cl.id as client_id, cl.first_name as client_first_name, cl.last_name as client_last_name,
                   cl.email as client_email, cl.identity_number as client_identity_number, cl.passcode as client_passcode,
                   cl.role as client_role, cl.state as client_state, cl.created_at as client_created_at,
                   adv.id as advisor_id, adv.first_name as advisor_first_name, adv.last_name as advisor_last_name,
                   adv.email as advisor_email, adv.identity_number as advisor_identity_number, adv.passcode as advisor_passcode,
                   adv.role as advisor_role, adv.state as advisor_state, adv.created_at as advisor_created_at
            FROM chats c
            INNER JOIN users cl ON c.client_id = cl.id
            LEFT JOIN users adv ON c.advisor_id = adv.id
            WHERE c.status = 'PENDING'
            ORDER BY c.created_at ASC
        `;

        const [rows]: any = await this.connection.execute(query);
        return rows.map((row: any) => this.mapRowToChat(row));
    }

    async getByStatus(status: ChatStatus): Promise<Chat[]> {
        const query = `
            SELECT c.*, 
                   cl.id as client_id, cl.first_name as client_first_name, cl.last_name as client_last_name,
                   cl.email as client_email, cl.identity_number as client_identity_number, cl.passcode as client_passcode,
                   cl.role as client_role, cl.state as client_state, cl.created_at as client_created_at,
                   adv.id as advisor_id, adv.first_name as advisor_first_name, adv.last_name as advisor_last_name,
                   adv.email as advisor_email, adv.identity_number as advisor_identity_number, adv.passcode as advisor_passcode,
                   adv.role as advisor_role, adv.state as advisor_state, adv.created_at as advisor_created_at
            FROM chats c
            INNER JOIN users cl ON c.client_id = cl.id
            LEFT JOIN users adv ON c.advisor_id = adv.id
            WHERE c.status = ?
            ORDER BY c.updated_at DESC
        `;

        const [rows]: any = await this.connection.execute(query, [status]);
        return rows.map((row: any) => this.mapRowToChat(row));
    }

    async add(chat: Chat): Promise<Chat> {
        const query = `
            INSERT INTO chats (id, client_id, advisor_id, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await this.connection.execute(query, [
            chat.id,
            chat.client.id,
            chat.advisor?.id || null,
            chat.status,
            chat.createdAt,
            chat.updatedAt
        ]);

        return new Chat(
            chat.id,
            chat.client,
            chat.advisor,
            chat.status as ChatStatus,
            [],
            chat.createdAt,
            chat.updatedAt
        );
    }

    async update(chat: Chat): Promise<void> {
        const query = `
            UPDATE chats
            SET advisor_id = ?, status = ?, updated_at = ?
            WHERE id = ?
        `;

        await this.connection.execute(query, [
            chat.advisor?.id || null,
            chat.status,
            new Date(),
            chat.id
        ]);
    }

    async remove(id: string): Promise<void> {
        await this.connection.execute('DELETE FROM chats WHERE id = ?', [id]);
    }

    async getAll(): Promise<Chat[]> {
        const query = `
            SELECT c.*, 
                   cl.id as client_id, cl.first_name as client_first_name, cl.last_name as client_last_name,
                   cl.email as client_email, cl.identity_number as client_identity_number, cl.passcode as client_passcode,
                   cl.role as client_role, cl.state as client_state, cl.created_at as client_created_at,
                   adv.id as advisor_id, adv.first_name as advisor_first_name, adv.last_name as advisor_last_name,
                   adv.email as advisor_email, adv.identity_number as advisor_identity_number, adv.passcode as advisor_passcode,
                   adv.role as advisor_role, adv.state as advisor_state, adv.created_at as advisor_created_at
            FROM chats c
            INNER JOIN users cl ON c.client_id = cl.id
            LEFT JOIN users adv ON c.advisor_id = adv.id
            ORDER BY c.updated_at DESC
        `;

        const [rows]: any = await this.connection.execute(query);
        return rows.map((row: any) => this.mapRowToChat(row));
    }

    private mapRowToChat(row: any): Chat {
        const client = new User(
            row.client_id,
            row.client_first_name,
            row.client_last_name,
            row.client_email,
            row.client_identity_number,
            row.client_passcode,
            row.client_role as UserRole,
            row.client_state as UserState,
            [],
            [],
            [],
            row.client_created_at
        );

        let advisor = null;
        if (row.advisor_id) {
            advisor = new User(
                row.advisor_id,
                row.advisor_first_name,
                row.advisor_last_name,
                row.advisor_email,
                row.advisor_identity_number,
                row.advisor_passcode,
                row.advisor_role as UserRole,
                row.advisor_state as UserState,
                [],
                [],
                [],
                row.advisor_created_at
            );
        }

        return new Chat(
            row.id,
            client,
            advisor,
            row.status as ChatStatus,
            [],
            row.created_at,
            row.updated_at
        );
    }
}
