'use client';

import {Chat, ChatStatus, UserRole} from '@/types/chat';
import {motion} from 'framer-motion';
import {ArrowLeft, CheckCircle2, MoreVertical, UserPlus, Users} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface ChatHeaderProps {
  chat: Chat;
  currentUserRole: UserRole;
  onBack: () => void;
  onClose?: () => void;
  onTransfer?: () => void;
  onAssign?: () => void;
}

export const ChatHeader = ({ chat, currentUserRole, onBack, onClose, onTransfer, onAssign }: ChatHeaderProps) => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const otherUser = currentUserRole === UserRole.CLIENT ? chat.advisor : chat.client;
  const canManageChat = currentUserRole !== UserRole.CLIENT && chat.status !== ChatStatus.CLOSED;
  const canShowMenu = canManageChat && chat.status !== ChatStatus.PENDING;

  const getStatusText = () => {
    switch (chat.status) {
      case ChatStatus.ACTIVE:
        return t('chat.activeDiscussion');
      case ChatStatus.CLOSED:
        return t('chat.status.closedDiscussion');
      default:
        return t('chat.status.pending');
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white font-semibold">
              {otherUser?.firstName?.[0]}
              {otherUser?.lastName?.[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {otherUser
                    ? `${otherUser.firstName} ${otherUser.lastName}`
                    : t('chat.noAdvisorAvailable')
                }
              </h3>
              <p className="text-xs text-gray-500">
                {getStatusText()}
              </p>
            </div>
          </div>
        </div>

        {canShowMenu && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-xl z-10"
              >
                {/* Options pour ADVISOR */}
                {currentUserRole === UserRole.ADVISOR && (
                  <>
                    {onTransfer && (
                      <button
                        onClick={() => {
                          onTransfer();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <Users className="h-4 w-4" />
                        {t('chat.actions.transferConversation')}
                      </button>
                    )}
                    {onClose && chat.status === ChatStatus.ACTIVE && (
                      <button
                        onClick={() => {
                          onClose();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {t('chat.actions.closeConversation')}
                      </button>
                    )}
                  </>
                )}

                {/* Options pour DIRECTOR */}
                {currentUserRole === UserRole.DIRECTOR && (
                  <>
                    {onAssign && (
                      <button
                        onClick={() => {
                          onAssign();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <UserPlus className="h-4 w-4" />
                        {t('chat.actions.assignAdvisor')}
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {chat.status === ChatStatus.CLOSED && (
        <div className="mt-3 rounded-lg bg-gray-100 px-3 py-2 text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t('chat.status.conversationClosed')}
          </p>
        </div>
      )}
    </div>
  );
};
