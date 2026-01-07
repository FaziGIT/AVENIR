'use client';

import React, {useState, useEffect} from 'react';
import {ClientWithDetails} from '@/types/client';
import {AnimatePresence, motion} from 'framer-motion';
import {Bell, Calendar, ChevronDown, Edit, MessageCircle, Shield, Trash2, TrendingUp, X, RefreshCw} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useRouter} from 'next/navigation';
import {ChatStatus, LoanStatus, UserState} from "@avenir/shared/enums";
import {useSSE, SSEEventType, isLoanCreatedPayload} from '@/contexts/SSEContext';
import {mapSSELoanToLoanApiResponse} from '@/lib/mapping/sse.mapping';
import {mapLoansApiResponseToClientLoans} from '@/lib/mapping/loan.mapping';
import {processManualPayment} from '@/lib/api/loan.api';
import {useToast} from '@/hooks/use-toast';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails | null;
  onSendNotification?: () => void;
  onGrantLoan?: () => void;
  onClientUpdate?: (updatedClient: ClientWithDetails) => void;
  onEditClient?: () => void;
  onBanClient?: () => void;
  onDeleteClient?: () => void;
  isDirector?: boolean;
}

export const ClientDetailsModal = ({
  isOpen,
  onClose,
  client,
  onSendNotification,
  onGrantLoan,
  onClientUpdate,
  onEditClient,
  onBanClient,
  onDeleteClient,
  isDirector = false,
}: ClientDetailsModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { subscribe } = useSSE();
  const { toast } = useToast();
  const [isLoansOpen, setIsLoansOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [showCompletedLoans, setShowCompletedLoans] = useState(false);
  const [showClosedChats, setShowClosedChats] = useState(false);
  const [loanSearchQuery, setLoanSearchQuery] = useState('');
  const [displayedClient, setDisplayedClient] = useState<ClientWithDetails | null>(client);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleManualPayment = async () => {
    try {
      setIsProcessingPayment(true);
      await processManualPayment();

      toast({
        title: t('clients.loan.manualPaymentSuccess'),
        description: t('clients.loan.manualPaymentSuccessDescription'),
      });
    } catch (error) {
      toast({
        title: t('clients.loan.manualPaymentError'),
        description: error instanceof Error ? error.message : t('clients.loan.manualPaymentErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    // Synchroniser avec la prop client
    if (client) {
      queueMicrotask(() => {
        setDisplayedClient(client);
      });
    }

    if (!client?.id) {
      return;
    }

    const clientId = client.id;

    const callback = (event: { type: string; data: unknown }) => {
      if (event.type === SSEEventType.LOAN_CREATED && isLoanCreatedPayload(event.data as never)) {
        const loanPayload = mapSSELoanToLoanApiResponse(event.data as never);

        if (loanPayload.clientId !== clientId) {
          return;
        }

        const updatedLoan = mapLoansApiResponseToClientLoans([loanPayload], clientId)[0];
        setDisplayedClient(prevClient => {
          if (!prevClient) {
            return null;
          }

          const existingLoanIndex = prevClient.loans.findIndex(loan => loan.id === updatedLoan.id);
          let updatedLoans;

          if (existingLoanIndex >= 0) {
            updatedLoans = [...prevClient.loans];
            updatedLoans[existingLoanIndex] = updatedLoan;
          } else {
            updatedLoans = [updatedLoan, ...prevClient.loans];
          }

          // Trier par date de création
          updatedLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          const updatedClient = {
            ...prevClient,
            loans: updatedLoans
          };

          if (onClientUpdate) {
            queueMicrotask(() => {
              onClientUpdate(updatedClient);
            });
          }

          return updatedClient;
        });
      }
    };

    const unsubscribe = subscribe(callback);
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id, subscribe]);

  if (!displayedClient) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const handleOpenChat = (chatId: string) => {
    // Stocker le chatId dans sessionStorage pour l'ouvrir après navigation
    sessionStorage.setItem('openChatId', chatId);
    onClose();
    router.push('/dashboard/contact');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                      <span className="text-2xl font-bold">
                        {displayedClient.firstName[0]}
                        {displayedClient.lastName[0]}
                      </span>
                    </div>

                    {/* Informations */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {displayedClient.firstName} {displayedClient.lastName}
                        </h2>
                        {/* Badge d'état du client */}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            displayedClient.state === UserState.ACTIVE
                              ? 'bg-green-100 text-green-700'
                              : displayedClient.state === UserState.INACTIVE
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {displayedClient.state === UserState.ACTIVE
                            ? t('clients.state.active')
                            : displayedClient.state === UserState.INACTIVE
                            ? t('clients.state.inactive')
                            : t('clients.state.banned')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{displayedClient.email}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {t('clients.clientSince')} {formatDate(displayedClient.clientSince)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  {/* Boutons pour le conseiller */}
                  {onSendNotification && onGrantLoan && (
                    <>
                      <button
                        onClick={onSendNotification}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Bell className="h-4 w-4" />
                        {t('clients.sendNotification')}
                      </button>
                      <button
                        onClick={onGrantLoan}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700"
                      >
                        <TrendingUp className="h-4 w-4" />
                        {t('clients.grantLoan')}
                      </button>
                    </>
                  )}

                  {/* Boutons pour le directeur */}
                  {onEditClient && onBanClient && onDeleteClient && (
                    <>
                      <button
                        onClick={onEditClient}
                        disabled={displayedClient?.state === UserState.BANNED}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                        title={displayedClient?.state === UserState.BANNED ? t('director.editClient.bannedTooltip') : ''}
                      >
                        <Edit className="h-4 w-4" />
                        {t('director.editClient.button')}
                      </button>
                      <button
                        onClick={onBanClient}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-orange-300 bg-white px-4 py-2.5 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50"
                      >
                        <Shield className="h-4 w-4" />
                        {displayedClient?.state === UserState.BANNED
                          ? t('director.activateClient.button')
                          : t('director.banClient.button')}
                      </button>
                      <button
                        onClick={onDeleteClient}
                        disabled={displayedClient?.state === UserState.BANNED}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                        title={displayedClient?.state === UserState.BANNED ? t('director.deleteClient.bannedTooltip') : ''}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('director.deleteClient.button')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Section Crédits */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      onClick={() => setIsLoansOpen(!isLoansOpen)}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('clients.loansTitle')}
                      </h3>
                      {displayedClient.loans.filter(loan => showCompletedLoans || loan.status !== LoanStatus.COMPLETED).length > 0 && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {displayedClient.loans.filter(loan => showCompletedLoans || loan.status !== LoanStatus.COMPLETED).length}{' '}
                          {displayedClient.loans.filter(loan => showCompletedLoans || loan.status !== LoanStatus.COMPLETED).length > 1
                            ? t('clients.loanPlural')
                            : t('clients.loanSingular')}
                        </span>
                      )}
                      <motion.div
                        animate={{ rotate: isLoansOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      </motion.div>
                    </button>

                    {/* Checkbox pour afficher les crédits terminés */}
                    {displayedClient.loans.some(loan => loan.status === LoanStatus.COMPLETED) && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCompletedLoans}
                          onChange={(e) => setShowCompletedLoans(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">{t('clients.loan.showCompleted')}</span>
                      </label>
                    )}
                  </div>

                  <AnimatePresence>
                    {isLoansOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        {/* Search bar pour filtrer les crédits */}
                        {displayedClient.loans.length > 0 && (
                          <div className="mb-4">
                            <input
                              type="text"
                              placeholder={t('clients.loan.searchPlaceholder')}
                              value={loanSearchQuery}
                              onChange={(e) => setLoanSearchQuery(e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                  {displayedClient.loans.filter(loan => showCompletedLoans || loan.status !== LoanStatus.COMPLETED).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-3 text-sm font-medium text-gray-900">
                        {t('clients.noLoans')}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {t('clients.noLoansDescription')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayedClient.loans
                        .filter(loan => showCompletedLoans || loan.status !== LoanStatus.COMPLETED)
                        .filter(loan => loan.name.toLowerCase().includes(loanSearchQuery.toLowerCase()))
                        .sort((a, b) => {
                          // Trier avec COMPLETED en dernier
                          if (a.status === LoanStatus.COMPLETED && b.status !== LoanStatus.COMPLETED) return 1;
                          if (a.status !== LoanStatus.COMPLETED && b.status === LoanStatus.COMPLETED) return -1;
                          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        })
                        .map((loan) => {
                        const progress = loan.progressPercentage || 0;
                        return (
                          <motion.div
                            key={loan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                          >
                            {/* En-tête du crédit */}
                            <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-base font-bold text-gray-900">
                                      {loan.name}
                                    </h4>
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        loan.status === LoanStatus.ACTIVE
                                          ? 'bg-green-100 text-green-700'
                                          : loan.status === LoanStatus.COMPLETED
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    >
                                      {loan.status === LoanStatus.ACTIVE
                                        ? t('clients.loan.status.active')
                                        : loan.status === LoanStatus.COMPLETED
                                        ? t('clients.loan.status.completed')
                                        : t('clients.loan.status.defaulted')}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-600">
                                    {t('clients.since')} {formatDate(loan.createdAt)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">{t('clients.loan.monthlyPayment')}</p>
                                  <p className="financial-amount text-2xl font-bold text-gray-900">
                                    {formatCurrency(loan.monthlyPayment)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Corps du crédit */}
                            <div className="p-4">
                              {/* Informations principales */}
                              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div>
                                  <p className="text-xs text-gray-500">{t('clients.loan.initialAmount')}</p>
                                  <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {formatCurrency(loan.amount)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">{t('clients.loan.remainingBalance')}</p>
                                  <p className="mt-1 text-sm font-semibold text-red-700">
                                    {formatCurrency(loan.remainingPayment)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">{t('clients.loan.totalDuration')}</p>
                                  <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {loan.duration} {t('clients.loan.months')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">{t('clients.loan.interestRate')}</p>
                                  <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {loan.interestRate}%
                                  </p>
                                </div>
                              </div>

                              {/* Barre de progression */}
                              <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">
                                    {t('clients.repayment')}
                                  </span>
                                  <span className="text-xs font-bold text-gray-900">
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${
                                      loan.status === LoanStatus.COMPLETED
                                        ? 'bg-linear-to-r from-blue-500 to-blue-600'
                                        : loan.status === LoanStatus.DEFAULTED
                                        ? 'bg-linear-to-r from-red-500 to-red-600'
                                        : 'bg-linear-to-r from-green-500 to-emerald-500'
                                    }`}
                                  />
                                </div>

                                {/* Prochaine échéance */}
                                {loan.nextPaymentDate && loan.status !== LoanStatus.COMPLETED && (
                                  <div className={`mt-3 rounded-lg border p-3 ${
                                    loan.status === LoanStatus.DEFAULTED 
                                      ? 'border-red-200 bg-red-50' 
                                      : 'border-blue-200 bg-blue-50'
                                  }`}>
                                    <p className={`text-xs ${
                                      loan.status === LoanStatus.DEFAULTED 
                                        ? 'text-red-600' 
                                        : 'text-blue-600'
                                    }`}>
                                      {t('clients.loan.nextPaymentDate')}
                                    </p>
                                    <p className={`mt-1 text-sm font-semibold ${
                                      loan.status === LoanStatus.DEFAULTED 
                                        ? 'text-red-900' 
                                        : 'text-blue-900'
                                    }`}>
                                      {formatDate(loan.nextPaymentDate)}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Détails supplémentaires */}
                              <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <div>
                                    <span className="font-medium">{t('clients.loan.totalCost')}:</span>{' '}
                                    {formatCurrency(loan.totalCost)}
                                  </div>
                                  <div>
                                    <span className="font-medium">{t('clients.loan.totalInterest')}:</span>{' '}
                                    {formatCurrency(loan.totalInterest)}
                                  </div>
                                  <div>
                                    <span className="font-medium">{t('clients.loan.insurance')}:</span>{' '}
                                    {formatCurrency(loan.insuranceCost)}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {t('clients.end')}: {new Date(loan.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                </div>
                              </div>

                              {/* Bouton de prélèvement manuel pour les crédits en défaut (conseiller uniquement) */}
                              {loan.status === LoanStatus.DEFAULTED && !isDirector && (
                                <div className="mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleManualPayment();
                                    }}
                                    disabled={isProcessingPayment}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <RefreshCw className={`h-4 w-4 ${isProcessingPayment ? 'animate-spin' : ''}`} />
                                    {isProcessingPayment
                                      ? t('clients.loan.processingPayment')
                                      : t('clients.loan.processManualPayment')}
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

                {/* Discussions actives */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      onClick={() => setIsChatsOpen(!isChatsOpen)}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('clients.activeChats')}
                      </h3>
                      {displayedClient.activeChats.filter(chat => showClosedChats || chat.status !== ChatStatus.CLOSED).length > 0 && (
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                          {displayedClient.activeChats.filter(chat => showClosedChats || chat.status !== ChatStatus.CLOSED).length}{' '}
                          {displayedClient.activeChats.filter(chat => showClosedChats || chat.status !== ChatStatus.CLOSED).length > 1
                            ? t('clients.chatPlural')
                            : t('clients.chatSingular')}
                        </span>
                      )}
                      <motion.div
                        animate={{ rotate: isChatsOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      </motion.div>
                    </button>

                    {/* Checkbox pour afficher les chats fermés */}
                    {displayedClient.activeChats.some(chat => chat.status === ChatStatus.CLOSED) && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showClosedChats}
                          onChange={(e) => setShowClosedChats(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">{t('chat.showClosed')}</span>
                      </label>
                    )}
                  </div>

                  <AnimatePresence>
                    {isChatsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                  {displayedClient.activeChats.filter(chat => showClosedChats || chat.status !== ChatStatus.CLOSED).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                      <MessageCircle className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-3 text-sm text-gray-500">
                        {t('clients.noActiveChats')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedClient.activeChats
                        .filter(chat => showClosedChats || chat.status !== ChatStatus.CLOSED)
                        .map((chat) => (
                        <motion.div
                          key={chat.id}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => handleOpenChat(chat.id)}
                          className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-gray-900 block truncate">
                                    {chat.firstMessage?.content || t('clients.conversation')}
                                  </span>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ml-2 ${
                                    chat.status === ChatStatus.PENDING
                                      ? 'bg-amber-100 text-amber-700'
                                      : chat.status === ChatStatus.ACTIVE
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {chat.status === ChatStatus.PENDING
                                    ? t('chat.status.pending')
                                    : chat.status === ChatStatus.ACTIVE
                                    ? t('chat.status.active')
                                    : t('chat.status.closed')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 text-sm text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                              {t('clients.openChat')} →
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
