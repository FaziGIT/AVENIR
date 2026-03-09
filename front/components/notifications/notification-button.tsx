'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, TrendingUp, Info, CheckCircle, AlertTriangle, Newspaper } from 'lucide-react';
import { Notification } from '@/types/notification';
import { NotificationType } from '@avenir/shared/enums';
import { useAuth } from '@/contexts/AuthContext';
import { useSSE, SSEEventType, isNotificationCreatedPayload } from '@/contexts/SSEContext';
import { mapSSENotificationToNotification } from '@/lib/mapping/sse.mapping';
import { useToast } from '@/hooks/use-toast';
import { NotificationDetailModal } from './notification-detail-modal';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
} from '@/lib/api/notification.api';
import { useTranslation } from "react-i18next";
import { translateNotification } from '@/lib/notification-translator';

export const NotificationButton = () => {
  const { user: currentUser } = useAuth();
  const { subscribe } = useSSE();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const checkSpace = () => {
      const windowWidth = window.innerWidth;
      setOpenUpwards(windowWidth < 768);
    };

    checkSpace();
    window.addEventListener('resize', checkSpace);

    const loadNotifications = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Cleanup
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', checkSpace);
    };
  }, [isOpen, currentUser]);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {

      if (event.type === SSEEventType.NOTIFICATION_CREATED && isNotificationCreatedPayload(event.data)) {
        const newNotification = mapSSENotificationToNotification(event.data);

        setNotifications((prev) => {
          // Vérifier si la notification n'existe pas déjà
          if (prev.some((n) => n.id === newNotification.id)) {
            return prev;
          }
          return [newNotification, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, [subscribe]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationApi(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      const notificationExists = notifications.find((n) => n.id === notification.id);

      if (!notificationExists) {
        toast({
          variant: 'destructive',
          title: t('errors.notFound'),
          description: t('notifications.notAvailable'),
        });
        return;
      }

      if (!notification.read) {
        await handleMarkAsRead(notification.id);
      }

      setIsOpen(false);
      setSelectedNotification(notification);
      setIsModalOpen(true);
    } catch {
      toast({
        variant: 'destructive',
        title: t('errors.error'),
        description: t('notifications.errorOpening'),
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedNotification(null), 300);
  };

  const handleNewsNotFound = () => {
    toast({
      variant: 'destructive',
      title: t('errors.notFound'),
      description: t('notifications.notAvailable'),
    });
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LOAN:
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case NotificationType.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case NotificationType.NEWS:
        return <Newspaper className="h-5 w-5 text-purple-600" />;
      case NotificationType.INFO:
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    } else if (days > 0) {
      return (t('notifications.time.daysAgo', { count: days }));
    } else if (hours > 0) {
      return (t('notifications.time.hoursAgo', { count: hours }));
    } else if (minutes > 0) {
      return (t('notifications.time.minutesAgo', { count: minutes }));
    } else {
      return t('notifications.time.now');
    }
  };

  const getTranslatedNotification = (notification: Notification) => {
    return translateNotification(notification.title, notification.message, t);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`fixed md:absolute left-4 right-4 md:left-auto md:right-0 z-60 mt-2 md:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl max-w-md mx-auto md:mx-0 ${
                openUpwards ? 'bottom-16 md:bottom-auto md:top-full' : 'top-16 md:top-full'
              }`}
            >
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('notifications.title')}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                      {t('notifications.markAllAsRead')}
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-125 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">{t('common.loading')}</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-3 text-sm font-medium text-gray-900">
                      {t('notifications.noNotifications')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('notifications.upToDate')}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => {
                      const translated = getTranslatedNotification(notification);
                      return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleNotificationClick(notification)}
                        className={`group relative cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">
                                {translated.title}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                              </button>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                              {translated.message}
                            </p>
                            {notification.advisorName && (
                              <p className="mt-1 text-xs text-gray-500">
                                {t('notifications.from')}: {notification.advisorName}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-gray-400">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>

                          {!notification.read && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                          )}
                        </div>
                      </motion.div>
                    );})}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <NotificationDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notification={selectedNotification}
        onNewsNotFound={handleNewsNotFound}
      />
    </div>
  );
};
