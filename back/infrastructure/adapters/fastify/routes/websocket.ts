import { FastifyPluginAsync } from 'fastify';
import { webSocketService } from '../../services/WebSocketService';

export const websocketRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/ws', { websocket: true }, (socket, request) => {
        const { userId, userRole } = request.query as { userId?: string; userRole?: string };

        if (!userId || !userRole) {
            socket.close(1008, 'userId et userRole sont requis');
            return;
        }

        console.log(`[WebSocket] Nouvelle connexion`);

        // Enregistrer le client
        webSocketService.registerClient(userId, userRole, socket);

        // Envoyer un message de confirmation
        socket.send(JSON.stringify({
            type: 'connected',
            data: {
                userId,
                userRole,
                message: 'Connexion WebSocket établie avec succès',
                timestamp: new Date().toISOString(),
            },
        }));

        // Gérer les messages entrants
        socket.on('message', async (rawMessage: Buffer) => {
            try {
                const message = JSON.parse(rawMessage.toString());

                // Ping/Pong pour maintenir la connexion
                if (message.type === 'ping') {
                    socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
                }
            } catch (error) {
                console.error('[WebSocket] Erreur lors du traitement du message:', error);
            }
        });

        socket.on('error', (error: Error) => {
            console.error(error.message);
        });

        socket.on('close', () => {
            console.log(`[WebSocket] Connexion fermée`);
        });
    });

    fastify.get('/ws/status', async () => {
        const connectedCount = webSocketService.getConnectedClientsCount();
        const connectedUsers = webSocketService.getConnectedClients();
        return {
            connected: connectedCount,
            users: connectedUsers,
            timestamp: new Date().toISOString(),
        };
    });
};

