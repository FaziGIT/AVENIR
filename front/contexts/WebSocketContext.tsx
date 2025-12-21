'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useCurrentMockUser } from '@/components/dev-user-switcher';
import { MessageApiDto } from '@/lib/mapping/chat.mapper';
import { WebSocketMessageType } from '@avenir/shared/enums';

export { WebSocketMessageType };

export interface ConnectedPayload {
    userId: string;
    userRole: string;
    message: string;
    timestamp: string;
}

export interface ChatAssignedPayload {
    advisorId: string;
}

export interface ChatCreatedPayload {
    chatId: string;
    clientId: string;
    clientName: string;
    status: string;
    createdAt: string;
}

export interface ChatTransferredPayload {
    newAdvisorId: string;
}

export interface ChatClosedPayload {
    closedAt: string;
}

export interface PongPayload {
    timestamp: string;
}

export type WebSocketMessage =
    | { type: WebSocketMessageType.CONNECTED; chatId?: string; payload?: ConnectedPayload }
    | { type: WebSocketMessageType.NEW_MESSAGE; chatId: string; payload: MessageApiDto }
    | { type: WebSocketMessageType.CHAT_CREATED; chatId: string; payload: ChatCreatedPayload }
    | { type: WebSocketMessageType.CHAT_ASSIGNED; chatId: string; payload?: ChatAssignedPayload }
    | { type: WebSocketMessageType.CHAT_TRANSFERRED; chatId: string; payload?: ChatTransferredPayload }
    | { type: WebSocketMessageType.CHAT_CLOSED; chatId: string; payload?: ChatClosedPayload }
    | { type: WebSocketMessageType.PONG; chatId?: string; payload?: PongPayload }
    | { type: string; chatId?: string; payload?: unknown };

interface WebSocketContextType {
    isConnected: boolean;
    sendMessage: (message: WebSocketMessage) => void;
    subscribe: (callback: (message: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/api/ws';

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const currentUser = useCurrentMockUser();
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const subscribersRef = useRef<Set<(message: WebSocketMessage) => void>>(new Set());
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const currentUserIdRef = useRef<string | null>(null);

    const connect = useCallback(() => {
        if (!currentUser) {
            console.log('[WebSocket] Pas d\'utilisateur connecté, connexion annulée');
            return;
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log('[WebSocket] Déjà connecté');
            return;
        }

        try {
            const url = `${WS_URL}?userId=${currentUser.id}&userRole=${currentUser.role}`;
            console.log('[WebSocket] Tentative de connexion à:', url);
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('[WebSocket] Connecté avec succès');
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    console.log('[WebSocket] Message reçu:', message);

                    // Notifier tous les abonnés
                    subscribersRef.current.forEach(callback => callback(message));
                } catch (error) {
                    console.error('[WebSocket] Erreur lors du parsing du message:', error);
                }
            };

            ws.onerror = (error: Event) => {
                console.error('[WebSocket] Erreur de connexion');
                console.error('[WebSocket] URL:', url);
                console.error('[WebSocket] Event:', error);
                console.error('[WebSocket] Type:', error.type);
            };

            ws.onclose = (event) => {
                console.log('[WebSocket] Déconnecté - Code:', event.code, 'Raison:', event.reason);
                setIsConnected(false);
                wsRef.current = null;

                // Tentative de reconnexion
                if (reconnectAttemptsRef.current < 5) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    console.log(`[WebSocket] Reconnexion dans ${delay}ms... (tentative ${reconnectAttemptsRef.current + 1}/5)`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, delay);
                } else {
                    console.error('[WebSocket] Échec de reconnexion après 5 tentatives');
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('[WebSocket] Erreur de connexion:', error);
        }
    }, [currentUser]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        reconnectAttemptsRef.current = 0;
    }, []);

    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('[WebSocket] Impossible d\'envoyer le message, WebSocket non connecté');
        }
    }, []);

    const subscribe = useCallback((callback: (message: WebSocketMessage) => void) => {
        subscribersRef.current.add(callback);
        return () => {
            subscribersRef.current.delete(callback);
        };
    }, []);

    useEffect(() => {
        const userId = currentUser?.id || null;

        if (currentUserIdRef.current === userId) {
            return;
        }
        currentUserIdRef.current = userId;

        if (currentUser) {
            console.log('[WebSocket] Connecting with user');
            connect();
        } else {
            console.log('[WebSocket] No current user, disconnecting');
            disconnect();
        }

        return () => {
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    return (
        <WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
