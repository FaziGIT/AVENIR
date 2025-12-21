export enum WebSocketMessageType {
    CONNECTED = 'connected',
    NEW_MESSAGE = 'new_message',
    MESSAGE_READ = 'message_read',
    CHAT_CREATED = 'chat_created',
    CHAT_ASSIGNED = 'chat_assigned',
    CHAT_TRANSFERRED = 'chat_transferred',
    CHAT_CLOSED = 'chat_closed',
    USER_TYPING = 'user_typing',
    PONG = 'pong'
}
