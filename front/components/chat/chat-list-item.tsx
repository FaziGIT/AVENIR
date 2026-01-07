'use client';

import { Chat, ChatStatus, UserRole } from '@/types/chat';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fr, enUS } from 'date-fns/locale';
import {formatDistanceToNow} from "date-fns";
import React from "react";

interface ChatListItemProps {
  chat: Chat;
  isActive?: boolean;
  onClick: () => void;
  currentUserRole?: UserRole;
  onClientClick?: (clientId: string) => void;
}

export const ChatListItem = ({ chat, isActive, onClick, currentUserRole, onClientClick }: ChatListItemProps) => {
  const { t, i18n } = useTranslation();

  const handleClientNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if ((currentUserRole === UserRole.ADVISOR || currentUserRole === UserRole.DIRECTOR) && onClientClick && chat.client) {
      onClientClick(chat.client.id);
    }
  };

  const getStatusIcon = (status: ChatStatus) => {
    switch (status) {
      case ChatStatus.PENDING:
        return <Clock className="h-4 w-4 text-amber-500" />;
      case ChatStatus.ACTIVE:
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case ChatStatus.CLOSED:
        return <CheckCircle2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: ChatStatus) => {
    switch (status) {
      case ChatStatus.PENDING:
        return t('chat.status.pending');
      case ChatStatus.ACTIVE:
        return t('chat.status.active');
      case ChatStatus.CLOSED:
        return t('chat.status.closed');
    }
  };

  const getStatusColor = (status: ChatStatus) => {
    switch (status) {
      case ChatStatus.PENDING:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case ChatStatus.ACTIVE:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case ChatStatus.CLOSED:
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

      const locale = i18n.language === 'fr' ? fr : enUS;

      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const otherUser = currentUserRole === UserRole.CLIENT ? chat.advisor : chat.client;
  const lastMessage = chat.lastMessage;
  const hasUnread = (chat.unreadCount || 0) > 0;
  const isPending = chat.status === ChatStatus.PENDING;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition-all ${
        isActive
          ? 'border-gray-900 bg-gray-50 shadow-sm'
          : isPending
          ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400 hover:shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={`font-semibold text-gray-900 truncate ${
                (currentUserRole === UserRole.ADVISOR || currentUserRole === UserRole.DIRECTOR) && otherUser 
                  ? 'cursor-pointer hover:text-blue-600 hover:underline transition-colors' 
                  : ''
              }`}
              onClick={(currentUserRole === UserRole.ADVISOR || currentUserRole === UserRole.DIRECTOR) ? handleClientNameClick : undefined}
              title={(currentUserRole === UserRole.ADVISOR || currentUserRole === UserRole.DIRECTOR) && otherUser ? t('chat.viewClientDetails') : undefined}
            >
              {otherUser
                ? `${otherUser.firstName} ${otherUser.lastName}`
                : t('chat.noAdvisorAvailable')
              }
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

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
                chat.status
              )}`}
            >
              {getStatusIcon(chat.status)}
              {getStatusLabel(chat.status)}
            </span>

            {/* Tag si c'est un client de l'advisor connecté */}
            {chat.isMyClient && currentUserRole === UserRole.ADVISOR && (
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                {t('chat.status.myClient')}
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
