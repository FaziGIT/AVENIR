import { WebSocket } from '@fastify/websocket';
import { WebSocket as WSWebSocket } from 'ws';
import { WebSocketMessageType, UserRole } from '@avenir/shared/enums';

export interface WebSocketClient {
    userId: string;
    userRole: string;
    socket: WebSocket;
}

export interface ChatMessage {
    type: WebSocketMessageType;
    chatId: string;
    payload: any;
}

export class WebSocketService {
    private clients: Map<string, WebSocketClient[]> = new Map();

    registerClient(userId: string, userRole: string, socket: WebSocket): void {
        const client: WebSocketClient = { userId, userRole, socket };

        if (!this.clients.has(userId)) {
            this.clients.set(userId, []);
        }

        this.clients.get(userId)!.push(client);

        console.log(`[WebSocket] Client connecté: ${userId} (${userRole})`);
        console.log(`[WebSocket] Total clients connectés: ${this.getConnectedClientsCount()}`);

        socket.on('close', () => {
            this.unregisterClient(userId, socket);
        });
    }

    private unregisterClient(userId: string, socket: WebSocket): void {
        const userClients = this.clients.get(userId);
        if (userClients) {
            const index = userClients.findIndex(c => c.socket === socket);
            if (index !== -1) {
                userClients.splice(index, 1);
            }
            if (userClients.length === 0) {
                this.clients.delete(userId);
            }
        }
        console.log(`[WebSocket] Client déconnecté: ${userId}`);
        console.log(`[WebSocket] Total clients connectés: ${this.getConnectedClientsCount()}`);
    }

    sendMessageToUser(userId: string, message: ChatMessage): void {
        const userClients = this.clients.get(userId);
        if (userClients) {
            const payload = JSON.stringify(message);
            console.log(`[WebSocket] Envoi du message`, message);

            let sentCount = 0;
            userClients.forEach(client => {
                if (client.socket.readyState === WSWebSocket.OPEN) {
                    client.socket.send(payload);
                    sentCount++;
                } else {
                    console.log(`[WebSocket] Utilisateur non connecté, message non envoyé, state: ${client.socket.readyState}`);
                }
            });
        } else {
            console.log(`[WebSocket] Utilisateur non connecté, message non envoyé`);
        }
    }

    sendMessageToChatParticipants(participantIds: string[], message: ChatMessage): void {
        participantIds.forEach(userId => {
            this.sendMessageToUser(userId, message);
        });
    }

    sendToAllAdvisors(message: ChatMessage): void {
        this.clients.forEach((clients, userId) => {
            const isAdvisor = clients.some(c => c.userRole === UserRole.ADVISOR);
            if (isAdvisor) {
                this.sendMessageToUser(userId, message);
            }
        });
    }

    getConnectedDirectors(): string[] {
        const directors: string[] = [];
        this.clients.forEach((clients, userId) => {
            const isDirector = clients.some(c => c.userRole === UserRole.DIRECTOR);
            if (isDirector) {
                directors.push(userId);
            }
        });
        return directors;
    }

    getConnectedAdvisors(): string[] {
        const advisors: string[] = [];
        this.clients.forEach((clients, userId) => {
            const isAdvisor = clients.some(c => c.userRole === UserRole.ADVISOR);
            if (isAdvisor) {
                advisors.push(userId);
            }
        });
        return advisors;
    }

    notifyNewMessage(chatId: string, participantIds: string[], messageData: any): void {
        this.sendMessageToChatParticipants(participantIds, {
            type: WebSocketMessageType.NEW_MESSAGE,
            chatId,
            payload: messageData,
        });
    }

    notifyChatCreated(chatId: string, recipientIds: string[], chatData: any): void {
        this.sendMessageToChatParticipants(recipientIds, {
            type: WebSocketMessageType.CHAT_CREATED,
            chatId,
            payload: chatData,
        });
    }

    notifyChatAssigned(chatId: string, clientId: string, advisorId: string): void {
        this.sendMessageToChatParticipants([clientId, advisorId], {
            type: WebSocketMessageType.CHAT_ASSIGNED,
            chatId,
            payload: { advisorId },
        });
    }

    notifyChatTransferred(chatId: string, participantIds: string[], payload: { newAdvisorId: string; newAdvisorName: string }): void {
        this.sendMessageToChatParticipants(participantIds, {
            type: WebSocketMessageType.CHAT_TRANSFERRED,
            chatId,
            payload,
        });
    }

    notifyChatClosed(chatId: string, participantIds: string[]): void {
        this.sendMessageToChatParticipants(participantIds, {
            type: WebSocketMessageType.CHAT_CLOSED,
            chatId,
            payload: { closedAt: new Date().toISOString() },
        });
    }

    getConnectedClientsCount(): number {
        let count = 0;
        this.clients.forEach(clients => {
            count += clients.length;
        });
        return count;
    }

    isUserConnected(userId: string): boolean {
        return this.clients.has(userId);
    }

    getConnectedClients(): string[] {
        return Array.from(this.clients.keys());
    }
}

export const webSocketService = new WebSocketService();
