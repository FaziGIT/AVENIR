'use client';

import {Chat, Message, UserRole} from '@/types/chat';
import {ChatHeader} from './chat-header';
import {ChatMessage} from './chat-message';
import {ChatInput} from './chat-input';
import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  currentUserId: string;
  currentUserRole: UserRole;
  onBack: () => void;
  onSendMessage: (content: string) => void;
  onClose?: () => void;
  onTransfer?: () => void;
  onAssign?: () => void;
  isLoading?: boolean;
}

export const ChatWindow = ({
  chat,
  messages,
  currentUserId,
  currentUserRole,
  onBack,
  onSendMessage,
  onClose,
  onTransfer,
  onAssign,
  isLoading,
}: ChatWindowProps) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isClosed = chat.status === 'CLOSED';

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
      <ChatHeader
        chat={chat}
        currentUserRole={currentUserRole}
        onBack={onBack}
        onClose={onClose}
        onTransfer={onTransfer}
        onAssign={onAssign}
      />

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
              <p className="text-sm text-gray-500">{t('chat.message.loadingMessages')}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">{t('chat.noMessages')}</p>
              <p className="mt-1 text-sm text-gray-400">{t('chat.sendMessageToStart')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              const isDirector = message.sender?.role === UserRole.DIRECTOR && !isOwnMessage;

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  isDirector={isDirector}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        onSend={onSendMessage}
        disabled={isClosed || isLoading}
        placeholder={
          isClosed
            ? t('chat.status.conversationClosed')
            : t('chat.message.typeMessage')
        }
      />
    </div>
  );
};
