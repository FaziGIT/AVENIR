'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSSE, SSEEventType, isNewsCreatedPayload, isNewsDeletedPayload } from '@/contexts/SSEContext';
import { mapSSENewsToNews } from '@/lib/mapping/sse.mapping';
import { DashboardHeader } from '@/components/dashboard-header';
import { CreateNewsModal } from '@/components/news/create-news-modal';
import { NewsDetailModal } from '@/components/news/news-detail-modal';
import { DeleteNewsModal } from '@/components/news/delete-news-modal';
import { News } from '@/types/news';
import { createNews, getAllNews, deleteNews } from '@/lib/api/news.api';
import { motion } from 'framer-motion';
import { Newspaper, Plus, Trash2, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function NewsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { subscribe } = useSSE();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState<News[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/not-found');
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (!user) return;

    const loadNews = async () => {
      try {
        setIsLoading(true);
        const newsData = await getAllNews();
        setNews(newsData);
      } catch (error) {
        toast({
          title: t('news.errors.loadingError'),
          description: t('news.errors.loadingNews'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [toast, user, t]);

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      // Écouter les événements SSE de création de news
      if (event.type === SSEEventType.NEWS_CREATED && isNewsCreatedPayload(event.data)) {
        const newNews = mapSSENewsToNews(event.data);

        setNews((prev) => {
          if (prev.some((n) => n.id === newNews.id)) {
            return prev;
          }
          return [newNews, ...prev];
        });

        if (event.data.authorId !== user?.id) {
          toast({
            title: t('news.toast.newNewsCreated'),
            description: t('news.toast.newNewsCreatedDescription', { authorName: event.data.authorName }),
          });
        }
      }
      else if (event.type === SSEEventType.NEWS_DELETED && isNewsDeletedPayload(event.data)) {
        const deletedNewsId = event.data.newsId;
        setNews((prev) => prev.filter((n) => n.id !== deletedNewsId));

        toast({
          title: t('news.toast.newsDeleted'),
          description: t('news.toast.newsDeletedDescription'),
        });
      }
    });

    return () => unsubscribe();
  }, [subscribe, toast, user?.id, t]);

  const handleCreateNews = async (title: string, description: string) => {
    try {
      setIsLoadingNews(true);

      await createNews({
        title,
        description,
      });

      toast({
        title: t('news.modal.success'),
        description: t('news.modal.successDescription', { title }),
      });

      setIsCreateModalOpen(false);
    } catch (error) {
      toast({
        title: t('news.modal.error'),
        description: error instanceof Error ? error.message : t('news.modal.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingNews(false);
    }
  };

  const handleDeleteNews = async (newsId: string, newsTitle: string) => {
    setNewsToDelete({ id: newsId, title: newsTitle });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!newsToDelete) return;

    try {
      setIsDeleting(true);

      await deleteNews(newsToDelete.id);

      toast({
        title: t('news.delete.success'),
        description: t('news.delete.successDescription', { title: newsToDelete.title }),
      });

      setIsDeleteModalOpen(false);
      setNewsToDelete(null);
    } catch (error) {
      toast({
        title: t('news.delete.errorTitle'),
        description: error instanceof Error ? error.message : t('news.delete.error'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNewsClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedNews(null), 300);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="mx-auto max-w-450 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Newspaper className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('news.title')}
                </h1>
                <p className="mt-1 text-gray-600">
                  {news.length} actualité{news.length > 1 ? 's' : ''} publiée{news.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              {t('news.createNews')}
            </button>
          </div>
        </motion.div>

        {/* Liste des actualités */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">{t('common.loading')}</p>
          </motion.div>
        ) : news.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12"
          >
            <Newspaper className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {t('news.noNews')}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {t('news.noNewsDescription')}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              {t('news.createNews')}
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                {/* Card Header */}
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <Newspaper className="h-6 w-6 text-blue-600" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNews(item.id, item.title);
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-red-600 opacity-0 transition-all hover:bg-red-100 group-hover:opacity-100"
                      aria-label="Supprimer l'actualité"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div
                  onClick={() => handleNewsClick(item)}
                  className="cursor-pointer p-6"
                >
                  <h3 className="mb-3 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                    {item.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                    {item.description}
                  </p>
                  <div className="space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{item.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <CreateNewsModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNews}
        isLoading={isLoadingNews}
      />

      <NewsDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        news={selectedNews}
      />

      <DeleteNewsModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setNewsToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        newsTitle={newsToDelete?.title || ''}
        isLoading={isDeleting}
      />
    </div>
  );
}
