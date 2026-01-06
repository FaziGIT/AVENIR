import { Router, Request } from 'express';
import expressWs from 'express-ws';
import { webSocketService } from '../../services/WebSocketService';

export const websocketRoutes = () => {
  const router = Router();

  // Initialiser express-ws sur ce router
  const wsInstance = expressWs(router as any);

  // Route WebSocket
  wsInstance.app.ws('/ws', (ws, req: Request) => {
    const { userId, userRole } = req.query as { userId?: string; userRole?: string };

    if (!userId || !userRole) {
      ws.close(1008, 'userId et userRole sont requis');
      return;
    }

    console.log(`[WebSocket] Nouvelle connexion`);

    // Enregistrer le client
    webSocketService.registerClient(userId, userRole, ws);

    // Envoyer un message de confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      data: {
        userId,
        userRole,
        message: 'Connexion WebSocket établie avec succès',
        timestamp: new Date().toISOString(),
      },
    }));

    // Gérer les messages entrants
    ws.on('message', async (rawMessage: Buffer | string) => {
      try {
        const messageStr = typeof rawMessage === 'string' ? rawMessage : rawMessage.toString();
        const message = JSON.parse(messageStr);

        // Ping/Pong pour maintenir la connexion
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (error) {
        console.error('[WebSocket] Erreur lors du traitement du message:', error);
      }
    });

    ws.on('error', (error: Error) => {
      console.error(error.message);
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Connexion fermée`);
    });
  });

  // Route de status
  router.get('/ws/status', async (req, res) => {
    const connectedCount = webSocketService.getConnectedClientsCount();
    const connectedUsers = webSocketService.getConnectedClients();
    return res.status(200).json({
      connected: connectedCount,
      users: connectedUsers,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
};
