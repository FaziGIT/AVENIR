'use client';

import { Message, MessageType } from '@/types/chat';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  isDirector?: boolean;
}

export const ChatMessage = ({ message, isOwnMessage, isDirector }: ChatMessageProps) => {
  if (message.type === MessageType.SYSTEM) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-4 flex justify-center"
      >
        <div className="flex items-center gap-2 rounded-full bg-gray-200/80 px-4 py-2 shadow-sm backdrop-blur-sm">
          <span className="text-xs font-medium text-gray-600">
            {message.content}
          </span>
          <span className="text-xs text-gray-400">
            {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`group relative max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isOwnMessage
            ? 'bg-gray-900 text-white'
            : isDirector
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {!isOwnMessage && message.sender && (
          <div className="mb-1 flex items-center gap-2">
            <span className={`text-xs font-semibold ${isDirector ? 'text-white' : ''}`}>
              {message.sender.firstName} {message.sender.lastName}
            </span>
            {isDirector && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                Directeur
              </span>
            )}
          </div>
        )}

        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
          {message.content}
        </p>

        <div className={`mt-1 flex items-center gap-1 justify-end ${
          isOwnMessage ? 'text-gray-300' : isDirector ? 'text-white/70' : 'text-gray-500'
        }`}>
          <span className="text-xs">
            {format(new Date(message.createdAt), 'HH:mm', { locale: fr })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
