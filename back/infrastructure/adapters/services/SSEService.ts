import { FastifyReply } from 'fastify';
import { Response } from 'express';
import { UserRole, SSEEventType } from '@avenir/shared/enums';

type SSEReply = FastifyReply | Response;

export interface SSEClient {
    userId: string;
    userRole: string;
    reply: SSEReply;
}

export interface SSEMessage {
    type: SSEEventType;
    data: any;
}

export class SSEService {
    private clients: Map<string, SSEClient[]> = new Map();

    registerClient(userId: string, userRole: string, reply: SSEReply): void {
        // Configuration SSE headers
        let origin: string;

        if ('raw' in reply) {
            // Fastify
            const fastifyReply = reply as FastifyReply;
            origin = (fastifyReply.request.headers.origin as string) || 'http://localhost:3000';

            fastifyReply.raw.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'X-Accel-Buffering': 'no',
            });
        } else {
            // Express
            const expressRes = reply as Response;
            origin = (expressRes.req.headers.origin as string) || 'http://localhost:3000';

            expressRes.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'X-Accel-Buffering': 'no',
            });
        }

        const client: SSEClient = { userId, userRole, reply };

        if (!this.clients.has(userId)) {
            this.clients.set(userId, []);
        }

        this.clients.get(userId)!.push(client);

        console.log(`[SSE] Total clients connectés: ${this.getConnectedClientsCount()}`);
        this.sendToClient(client, {
            type: SSEEventType.CONNECTED,
            data: { userId, userRole, message: 'Connected to SSE', timestamp: new Date().toISOString() }
        });

        // Heartbeat pour garder la connexion active
        const heartbeatInterval = setInterval(() => {
            try {
                if ('raw' in reply) {
                    (reply as FastifyReply).raw.write(': heartbeat\n\n');
                } else {
                    (reply as Response).write(': heartbeat\n\n');
                }
            } catch (error) {
                clearInterval(heartbeatInterval);
            }
        }, 30000);

        // Gérer la fermeture de connexion
        if ('raw' in reply) {
            (reply as FastifyReply).raw.on('close', () => {
                clearInterval(heartbeatInterval);
                this.unregisterClient(userId, reply);
            });
        } else {
            (reply as Response).on('close', () => {
                clearInterval(heartbeatInterval);
                this.unregisterClient(userId, reply);
            });
        }
    }

    private unregisterClient(userId: string, reply: SSEReply): void {
        const userClients = this.clients.get(userId);
        if (userClients) {
            const index = userClients.findIndex(c => c.reply === reply);
            if (index !== -1) {
                userClients.splice(index, 1);
            }
            if (userClients.length === 0) {
                this.clients.delete(userId);
            }
        }

        console.log(`[SSE] Total clients connectés: ${this.getConnectedClientsCount()}`);
    }

    private sendToClient(client: SSEClient, message: SSEMessage): void {
        try {
            const data = `event: ${message.type}\ndata: ${JSON.stringify(message.data)}\n\n`;
            if ('raw' in client.reply) {
                (client.reply as FastifyReply).raw.write(data);
            } else {
                (client.reply as Response).write(data);
            }
        } catch (error) {
            console.error(`[SSE] Erreur lors de l'envoi du message au client :`, error);
        }
    }

    sendMessageToUser(userId: string, message: SSEMessage): void {
        const userClients = this.clients.get(userId);
        if (userClients && userClients.length > 0) {
            userClients.forEach(client => {
                this.sendToClient(client, message);
            });
        }
    }

    sendToAll(message: SSEMessage): void {
        this.clients.forEach((clients) => {
            clients.forEach(client => {
                this.sendToClient(client, message);
            });
        });
    }

    sendToAllByRole(role: UserRole, message: SSEMessage): void {
        this.clients.forEach((clients) => {
            clients.forEach(client => {
                if (client.userRole === role) {
                    this.sendToClient(client, message);
                }
            });
        });
    }

    notifyNewsCreated(newsData: any): void {
        this.sendToAll({
            type: SSEEventType.NEWS_CREATED,
            data: newsData,
        });
    }

    notifyNewsDeleted(newsId: string): void {
        this.sendToAll({
            type: SSEEventType.NEWS_DELETED,
            data: { newsId },
        });
    }

    notifyNotificationCreated(userId: string, notificationData: any): void {
        this.sendMessageToUser(userId, {
            type: SSEEventType.NOTIFICATION_CREATED,
            data: notificationData,
        });
    }

    notifyLoanCreated(clientId: string, loanData: any, advisorId?: string): void {
        this.sendMessageToUser(clientId, {
            type: SSEEventType.LOAN_CREATED,
            data: loanData,
        });

        if (advisorId && advisorId !== clientId) {
            this.sendMessageToUser(advisorId, {
                type: SSEEventType.LOAN_CREATED,
                data: loanData,
            });
        }
    }

    getConnectedClientsCount(): number {
        let count = 0;
        this.clients.forEach(clients => {
            count += clients.length;
        });
        return count;
    }

    getConnectedUserIds(): string[] {
        return Array.from(this.clients.keys());
    }
}
