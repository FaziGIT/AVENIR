'use client';

import {useCallback, useEffect, useState} from 'react';
import {useCurrentMockUser} from '@/components/dev-user-switcher';
import {ChatListItem} from '@/components/chat/chat-list-item';
import {ChatWindow} from '@/components/chat/chat-window';
import {NewChatModal} from '@/components/chat/new-chat-modal';
import {TransferChatModal} from '@/components/chat/transfer-chat-modal';
import {AssignAdvisorModal} from '@/components/chat/assign-advisor-modal';
import {Chat, Message, UserRole} from '@/types/chat';
import {motion} from 'framer-motion';
import {MessageCircle, Plus, Search} from 'lucide-react';
import {DashboardHeader} from '@/components/dashboard-header';
import {chatApi} from '@/lib/api/chat.api';
import {useToast} from '@/hooks/use-toast';
import {useWebSocket, WebSocketMessage} from '@/contexts/WebSocketContext';
import {
  ChatApiDto,
  mapChatFromApi,
  mapChatsFromApi,
  mapMessageFromApi,
  mapMessagesFromApi,
  MessageApiDto
} from '@/lib/mapping';
import {ChatStatus, WebSocketMessageType} from "@avenir/shared/enums";
import {useTranslation} from 'react-i18next';

export default function ContactPage() {
  const { t } = useTranslation();
  const currentUser = useCurrentMockUser();
  const { toast } = useToast();
  const { subscribe } = useWebSocket();
  const [activeTab, setActiveTab] = useState('contact');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({});
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const loadChats = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoadingChats(true);
      const response = await chatApi.getChats({
        userId: currentUser.id,
        userRole: currentUser.role,
      });

      const mappedChats = Array.isArray(response) ? mapChatsFromApi(response) : [];
      setChats(mappedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: t('chat.errors.title'),
        description: t('chat.errors.loadingChats'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingChats(false);
    }
  }, [currentUser, toast, t]);

  const loadMessages = useCallback(async (chatId: string) => {
    if (!currentUser) return;

    try {
      setIsLoadingMessages(true);
      const response = await chatApi.getChatMessages(chatId, currentUser.id);

      const mappedMessages = Array.isArray(response) ? mapMessagesFromApi(response) : [];
      setChatMessages((prev) => ({
        ...prev,
        [chatId]: mappedMessages,
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: t('chat.errors.title'),
        description: t('chat.errors.loadingMessages'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentUser, toast, t]);

  const handleNewMessage = useCallback((message: WebSocketMessage) => {
    if (message.type !== WebSocketMessageType.NEW_MESSAGE || !message.chatId || !message.payload) return;

    const newMessage = mapMessageFromApi(message.payload as MessageApiDto);

    setChatMessages((prev) => {
      const existingMessages = prev[message.chatId!] || [];
      const messageExists = existingMessages.some(msg => msg.id === newMessage.id);

      if (messageExists) {
        return prev;
      }

      return {
        ...prev,
        [message.chatId!]: [...existingMessages, newMessage],
      };
    });

    loadChats();

    if (newMessage.senderId !== currentUser?.id) {
      toast({
        title: t('chat.message.newMessage'),
        description: t('chat.message.newMessageFrom', { name: newMessage.sender?.firstName || 'Un utilisateur' }),
      });
    }
  }, [currentUser?.id, loadChats, toast, t]);

  const handleChatCreated = useCallback((message: WebSocketMessage) => {
    if (message.type !== WebSocketMessageType.CHAT_CREATED || !message.chatId || !message.payload) return;

    const chatPayload = message.payload as ChatApiDto;
    const newChat = mapChatFromApi({
      id: chatPayload.id || message.chatId,
      clientId: chatPayload.clientId,
      clientName: chatPayload.clientName,
      advisorId: chatPayload.advisorId,
      advisorName: chatPayload.advisorName,
      status: chatPayload.status,
      lastMessage: chatPayload.lastMessage,
      lastMessageAt: chatPayload.lastMessageAt,
      unreadCount: chatPayload.unreadCount || 0,
      createdAt: chatPayload.createdAt,
      updatedAt: chatPayload.updatedAt,
    });

    setChats((prev) => {
      const chatExists = prev.some(c => c.id === newChat.id);
      if (chatExists) {
        return prev;
      }
      return [newChat, ...prev];
    });

    if (currentUser?.role === UserRole.ADVISOR || currentUser?.role === UserRole.DIRECTOR) {
      toast({
        title: t('chat.notifications.conversationCreated'),
        description: t('chat.notifications.conversationCreatedBy', { name: chatPayload.clientName || 'Un client' }),
      });
    }
  }, [currentUser?.role, toast, t]);

  const handleChatClosed = useCallback((message: WebSocketMessage) => {
    if (message.type !== WebSocketMessageType.CHAT_CLOSED || !message.chatId) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === message.chatId ? { ...chat, status: ChatStatus.CLOSED } : chat
      )
    );

    if (selectedChat?.id === message.chatId) {
      setSelectedChat(null);
      toast({
        title: t('chat.success.title'),
        description: t('chat.success.conversationClosed'),
      });
    }
  }, [selectedChat?.id, toast, t]);

  const handleChatAssigned = useCallback((message: WebSocketMessage) => {
    if (message.type !== WebSocketMessageType.CHAT_ASSIGNED || !message.chatId) return;

    loadChats();
    toast({
      title: t('chat.notifications.advisorAssigned'),
      description: t('chat.notifications.advisorAssignedDescription'),
    });
  }, [loadChats, toast, t]);

  const handleChatTransferred = useCallback((message: WebSocketMessage) => {
    if (message.type !== WebSocketMessageType.CHAT_TRANSFERRED || !message.chatId) return;

    if (currentUser?.role === UserRole.ADVISOR) {
      chatApi.getChats({
        userId: currentUser.id,
        userRole: currentUser.role,
      }).then((updatedChats) => {
        const mappedChats = Array.isArray(updatedChats) ? mapChatsFromApi(updatedChats) : [];
        const stillHasAccess = mappedChats.some((c: Chat) => c.id === message.chatId);

        if (!stillHasAccess) {
          setChats((prev) => prev.filter((c) => c.id !== message.chatId));

          if (selectedChat?.id === message.chatId) {
            setSelectedChat(null);
          }

          toast({
            title: t('chat.notifications.conversationTransferred'),
            description: t('chat.notifications.conversationTransferredDescription'),
          });
        } else {
          setChats(mappedChats);
        }
      }).catch((error) => {
        console.error('Error checking chat access:', error);
      });
    } else {
      loadChats();

      if (currentUser?.role === UserRole.DIRECTOR && selectedChat?.id === message.chatId) {
        chatApi.getChatById(message.chatId, currentUser.id, currentUser.role)
          .then((updatedChatData) => {
            const updatedChat = mapChatFromApi(updatedChatData);
            setSelectedChat(updatedChat);
          })
          .catch((error) => {
            console.error('Error reloading chat:', error);
          });
      }
    }
  }, [currentUser?.id, currentUser?.role, loadChats, selectedChat?.id, toast, t]);

  useEffect(() => {
    if (!currentUser) return;

    loadChats();

    const unsubscribe = subscribe((message) => {
      console.log('[ContactPage] WebSocket message received:', message);

      switch (message.type) {
        case WebSocketMessageType.NEW_MESSAGE:
          handleNewMessage(message);
          break;
        case WebSocketMessageType.CHAT_CREATED:
          handleChatCreated(message);
          break;
        case WebSocketMessageType.CHAT_CLOSED:
          handleChatClosed(message);
          break;
        case WebSocketMessageType.CHAT_ASSIGNED:
          handleChatAssigned(message);
          break;
        case WebSocketMessageType.CHAT_TRANSFERRED:
          handleChatTransferred(message);
          break;
        case WebSocketMessageType.CONNECTED:
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    currentUser,
    loadChats,
    subscribe,
    handleNewMessage,
    handleChatCreated,
    handleChatClosed,
    handleChatAssigned,
    handleChatTransferred,
  ]);

  useEffect(() => {
    if (selectedChat?.id && currentUser) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat?.id, currentUser, loadMessages]);

  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !currentUser) return;

    try {
      await chatApi.sendMessage({
        chatId: selectedChat.id,
        senderId: currentUser.id,
        content,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('chat.errors.title'),
        description: t('chat.errors.sendingMessage'),
        variant: 'destructive',
      });
    }
  };

  const handleCreateChat = async (initialMessage: string) => {
    if (!currentUser) return;

    try {
      setIsCreatingChat(true);

      const response = await chatApi.createChat({
        clientId: currentUser.id,
        initialMessage,
      });

      const newChat = mapChatFromApi(response);

      setChats((prev) => [newChat, ...prev]);

      await loadMessages(newChat.id);

      setSelectedChat(newChat);
      setIsNewChatModalOpen(false);

      toast({
        title: t('chat.success.title'),
        description: t('chat.success.conversationCreated'),
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: t('chat.errors.title'),
        description: t('chat.errors.creatingConversation'),
        variant: 'destructive',
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleCloseChat = async () => {
    if (!selectedChat || !currentUser) return;

    try {
      await chatApi.closeChat({
        chatId: selectedChat.id,
        userId: currentUser.id,
        userRole: currentUser.role,
      });

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id ? { ...chat, status: ChatStatus.CLOSED } : chat
        )
      );

      setSelectedChat(null);

      toast({
        title: t('chat.success.title'),
        description: t('chat.success.conversationClosed'),
      });
    } catch (error) {
      console.error('Error closing chat:', error);
      toast({
        title: t('chat.errors.title'),
        description: t('chat.errors.closingConversation'),
        variant: 'destructive',
      });
    }
  };

  const handleTransferChat = async (newAdvisorId: string) => {
    if (!selectedChat || !currentUser) return;

    try {
      setIsTransferring(true);
      const response = await chatApi.transferChat({
        chatId: selectedChat.id,
        newAdvisorId,
        currentUserId: currentUser.id,
      });

      await loadChats();

      if (currentUser.role === UserRole.ADVISOR) {
        setSelectedChat(null);
      } else {
        const updatedChat = mapChatFromApi(response);
        setSelectedChat(updatedChat);
        await loadMessages(updatedChat.id);
      }

      setIsTransferModalOpen(false);

      toast({
        title: t('chat.success.title'),
        description: t('chat.success.conversationTransferred'),
      });
    } catch (error) {
      console.error('Error transferring chat:', error);
      toast({
        title: t('chat.errors.title'),
        description: t('chat.errors.transferringConversation'),
        variant: 'destructive',
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleAssignAdvisor = async (advisorId: string) => {
    if (!selectedChat || !currentUser) return;

    try {
      setIsAssigning(true);
      const response = await chatApi.assignAdvisor({
        chatId: selectedChat.id,
        advisorId,
      });

      await loadChats();

      const updatedChat = mapChatFromApi(response);
      setSelectedChat(updatedChat);

      await loadMessages(updatedChat.id);

      setIsAssignModalOpen(false);

      toast({
        title: t('chat.success.title'),
        description: t('chat.success.advisorAssigned'),
      });
    } catch (error) {
      console.error('Error assigning advisor:', error);
      toast({
        title: t('chat.errors.title'),
        description: t('chat.errors.assigningAdvisor'),
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };


  const filteredChats = chats;
  const currentMessages = selectedChat ? chatMessages[selectedChat.id] || [] : [];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="mx-auto max-w-[1800px] p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t('chat.conversations')}</h2>
                {currentUser.role === UserRole.CLIENT && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-800"
                  >
                    <Plus className="h-5 w-5" />
                  </motion.button>
                )}
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-none bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {isLoadingChats ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
                    <p className="mt-3 text-sm text-gray-500">{t('common.loading')}</p>
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">{t('chat.noConversations')}</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <ChatListItem
                      key={chat.id}
                      chat={chat}
                      isActive={selectedChat?.id === chat.id}
                      onClick={() => setSelectedChat(chat)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            {selectedChat ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-[calc(100vh-140px)]"
              >
                <ChatWindow
                  chat={selectedChat}
                  messages={currentMessages}
                  currentUserId={currentUser.id}
                  currentUserRole={currentUser.role}
                  onBack={() => setSelectedChat(null)}
                  onSendMessage={handleSendMessage}
                  onClose={currentUser.role === UserRole.ADVISOR ? handleCloseChat : undefined}
                  onTransfer={currentUser.role === UserRole.ADVISOR ? () => setIsTransferModalOpen(true) : undefined}
                  onAssign={currentUser.role === UserRole.DIRECTOR ? () => setIsAssignModalOpen(true) : undefined}
                  isLoading={isLoadingMessages}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-[calc(100vh-140px)] items-center justify-center rounded-2xl border border-gray-200 bg-white"
              >
                <div className="text-center">
                  <MessageCircle className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {t('chat.selectConversation')}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {t('chat.selectConversationDescription')}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de nouvelle conversation */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSubmit={handleCreateChat}
        isLoading={isCreatingChat}
      />

      {/* Modal de transfert de conversation */}
      <TransferChatModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSubmit={handleTransferChat}
        isLoading={isTransferring}
        currentAdvisorId={currentUser.id}
      />

      {/* Modal d'assignation de conseiller */}
      <AssignAdvisorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignAdvisor}
        isLoading={isAssigning}
        currentAdvisorId={selectedChat?.advisorId}
      />
    </div>
  );
}
