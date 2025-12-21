'use client';

import { Chat, ChatStatus } from '@/types/chat';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatListItemProps {
  chat: Chat;
  isActive?: boolean;
  onClick: () => void;
}

export const ChatListItem = ({ chat, isActive, onClick }: ChatListItemProps) => {
  const getStatusIcon = (status: ChatStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'ACTIVE':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'CLOSED':
        return <CheckCircle2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: ChatStatus) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'ACTIVE':
        return 'Actif';
      case 'CLOSED':
        return 'Fermé';
    }
  };

  const getStatusColor = (status: ChatStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ACTIVE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CLOSED':
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const formatMessageTime = (date: Date | string | undefined) => {
    if (!date) return '';

    try {
      const dateObj = date instanceof Date ? date : new Date(date);

      if (isNaN(dateObj.getTime())) {
        return '';
      }

      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: fr,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const otherUser = chat.client || chat.advisor;
  const lastMessage = chat.lastMessage;
  const hasUnread = (chat.unreadCount || 0) > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition-all ${
        isActive
          ? 'border-gray-900 bg-gray-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {otherUser?.firstName} {otherUser?.lastName}
            </h4>
            {hasUnread && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {chat.unreadCount}
              </span>
            )}
          </div>

          {lastMessage && (
            <p className="text-sm text-gray-600 truncate mb-2">
              {lastMessage.content}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
                chat.status
              )}`}
            >
              {getStatusIcon(chat.status)}
              {getStatusLabel(chat.status)}
            </span>
            {chat.advisor && (
              <span className="text-xs text-gray-500">
                Conseiller: {chat.advisor.firstName}
              </span>
            )}
          </div>
        </div>

        {lastMessage && (
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatMessageTime(lastMessage.createdAt)}
          </span>
        )}
      </div>
    </motion.div>
  );
};
