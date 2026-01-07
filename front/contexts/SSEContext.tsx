'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SSEEventType } from '@avenir/shared/enums';

export { SSEEventType };

export interface SSENewsCreatedPayload {
    id: string;
    title: string;
    description: string;
    authorId: string;
    authorName: string;
    createdAt: string;
}

export interface SSENewsDeletedPayload {
    newsId: string
}

export interface SSENotificationCreatedPayload {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    advisorName: string | null;
    isRead: boolean;
    createdAt: string;
    newsId: string | null;
}

export interface SSELoanCreatedPayload {
    id: string;
    name: string;
    advisorId: string;
    clientId: string;
    amount: number;
    duration: number;
    annualInterestRate: number;
    insuranceRate: number;
    monthlyPayment: number;
    totalCost: number;
    totalInterest: number;
    insuranceCost: number;
    paidAmount: number;
    status: string;
    nextPaymentDate?: string;
    createdAt: string;
    updatedAt: string;
}

export type SSEEventPayload =
    | SSENewsCreatedPayload
    | SSENewsDeletedPayload
    | SSENotificationCreatedPayload
    | SSELoanCreatedPayload
    | { userId: string; userRole: string; message: string; timestamp: string };

export interface SSEEvent {
    type: SSEEventType;
    data: SSEEventPayload;
}

// Type guards pour vérifier les types SSE
export function isNewsCreatedPayload(data: SSEEventPayload): data is SSENewsCreatedPayload {
    return 'title' in data && 'description' in data && 'authorId' in data;
}

export function isNewsDeletedPayload(data: SSEEventPayload): data is SSENewsDeletedPayload {
    return 'newsId' in data;
}

export function isNotificationCreatedPayload(data: SSEEventPayload): data is SSENotificationCreatedPayload {
    return 'id' in data && 'title' in data && 'message' in data && 'type' in data && 'read' in data;
}

export function isLoanCreatedPayload(data: SSEEventPayload): data is SSELoanCreatedPayload {
    return 'name' in data && 'clientId' in data && 'amount' in data && 'duration' in data && 'monthlyPayment' in data;
}

interface SSEContextType {
    isConnected: boolean;
    subscribe: (callback: (event: SSEEvent) => void) => () => void;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const SSEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: authUser } = useAuth();
    const currentUser = useMemo(() =>
        authUser ? { id: authUser.id, role: authUser.role } : null,
        [authUser]
    );
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const subscribersRef = useRef<Set<(event: SSEEvent) => void>>(new Set());
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const currentUserIdRef = useRef<string | null>(null);
    const connectFnRef = useRef<(() => void) | null>(null);

    const connect = useCallback(() => {
        if (!currentUser) {
            console.log('[SSE] Pas d\'utilisateur connecté, connexion annulée');
            return;
        }

        if (eventSourceRef.current?.readyState === EventSource.OPEN) {
            console.log('[SSE] Déjà connecté');
            return;
        }

        try {
            const url = `${API_BASE_URL}/api/sse`;
            console.log('[SSE] Tentative de connexion à:', url);

            const eventSource = new EventSource(url, {
                withCredentials: true
            });

            eventSource.onopen = () => {
                console.log('[SSE] Connecté avec succès');
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
            };

            const eventTypes: SSEEventType[] = [
                SSEEventType.CONNECTED,
                SSEEventType.NEWS_CREATED,
                SSEEventType.NEWS_DELETED,
                SSEEventType.NOTIFICATION_CREATED,
                SSEEventType.LOAN_CREATED,
                SSEEventType.USER_BANNED
            ];

            eventTypes.forEach(eventType => {
                eventSource.addEventListener(eventType, (event: MessageEvent) => {
                    try {
                        const data = JSON.parse(event.data);
                        const sseEvent: SSEEvent = { type: eventType, data };
                        console.log(`[SSE] Événement reçu: ${eventType}`, data);

                        if (eventType === SSEEventType.USER_BANNED) {

                            // Fermer la connexion SSE
                            if (eventSourceRef.current) {
                                eventSourceRef.current.close();
                                eventSourceRef.current = null;
                            }

                            fetch(`${API_BASE_URL}/api/auth/logout`, {
                                method: 'POST',
                                credentials: 'include',
                            }).finally(() => {
                                // Nettoyer les cookies
                                document.cookie.split(";").forEach((c) => {
                                    document.cookie = c
                                        .replace(/^ +/, "")
                                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                                });

                                window.location.href = '/banned';
                            });

                            return;
                        }

                        if (eventType === SSEEventType.USER_DELETED) {

                            // Fermer la connexion SSE
                            if (eventSourceRef.current) {
                                eventSourceRef.current.close();
                                eventSourceRef.current = null;
                            }

                            fetch(`${API_BASE_URL}/api/auth/logout`, {
                                method: 'POST',
                                credentials: 'include',
                            }).finally(() => {
                                // Nettoyer les cookies
                                document.cookie.split(";").forEach((c) => {
                                    document.cookie = c
                                        .replace(/^ +/, "")
                                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                                });
                                window.location.href = '/login';
                            });

                            return;
                        }

                        let callbackIndex = 0;
                        subscribersRef.current.forEach(callback => {
                            try {
                                callback(sseEvent);
                            } catch (error) {
                                console.error(`[SSE] Error in subscriber callback #${callbackIndex}:`, error);
                            }
                            callbackIndex++;
                        });
                    } catch (error) {
                        console.error(`[SSE] Erreur lors du parsing de l'événement ${eventType}:`, error);
                    }
                });
            });

            eventSource.onerror = (error) => {
                console.error('[SSE] Erreur de connexion', error);
                setIsConnected(false);
                eventSource.close();
                eventSourceRef.current = null;

                if (reconnectAttemptsRef.current < 5) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    console.log(`[SSE] Reconnexion dans ${delay}ms... (tentative ${reconnectAttemptsRef.current + 1}/5)`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        if (connectFnRef.current) {
                            connectFnRef.current();
                        }
                    }, delay);
                } else {
                    console.error('[SSE] Échec de reconnexion après 5 tentatives');
                }
            };

            eventSourceRef.current = eventSource;
        } catch (error) {
            console.error('[SSE] Erreur de connexion:', error);
        }
    }, [currentUser]);

    useEffect(() => {
        connectFnRef.current = connect;
    }, [connect]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        reconnectAttemptsRef.current = 0;
    }, []);

    const subscribe = useCallback((callback: (event: SSEEvent) => void) => {
        subscribersRef.current.add(callback);
        return () => {
            subscribersRef.current.delete(callback);
        };
    }, []);

    useEffect(() => {
        const userId = currentUser?.id || null;

        if (currentUserIdRef.current === userId) {
            console.log('[SSE] Même utilisateur, pas de reconnexion');
            return;
        }
        currentUserIdRef.current = userId;

        if (currentUser) {
            console.log('[SSE] Connecting with user');
            connect();
        } else {
            console.log('[SSE] No current user, disconnecting');
            disconnect();
            queueMicrotask(() => {
                setIsConnected(false);
            });
        }

        return () => {
            disconnect();
        };
    }, [currentUser, connect, disconnect]);

    return (
        <SSEContext.Provider value={{ isConnected, subscribe }}>
            {children}
        </SSEContext.Provider>
    );
};

export const useSSE = (): SSEContextType => {
    const context = useContext(SSEContext);
    if (context === undefined) {
        throw new Error('useSSE must be used within a SSEProvider');
    }
    return context;
};
