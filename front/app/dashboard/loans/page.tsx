'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ClientLoan } from '@/types/client';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Euro, Percent, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoanStatus } from "@avenir/shared/enums";
import { useAuth } from '@/contexts/AuthContext';
import { getClientLoans } from '@/lib/api/loan.api';
import { useToast } from '@/hooks/use-toast';
import { mapLoansApiResponseToClientLoans } from '@/lib/mapping/loan.mapping';
import { useSSE, SSEEventType, isLoanCreatedPayload } from '@/contexts/SSEContext';
import { mapSSELoanToLoanApiResponse } from '@/lib/mapping/sse.mapping';
import { DeleteAccountModal } from '@/components/modals/delete-account-modal';
import { useRouter } from 'next/navigation';
import {userApi} from "@/lib/api/user.api";

export default function LoansPage() {
  const { t } = useTranslation();
  const { user: currentUser, logout } = useAuth();
  const { toast } = useToast();
  const { subscribe } = useSSE();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('loans');
  const [loans, setLoans] = useState<ClientLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletedLoans, setShowCompletedLoans] = useState(false);
  const [loanSearchQuery, setLoanSearchQuery] = useState('');
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const loansIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadLoans = async () => {
      if (!currentUser) return;

      setIsLoading(true);
      try {
        const clientLoans = await getClientLoans(currentUser.id);
        const mappedLoans = mapLoansApiResponseToClientLoans(clientLoans, currentUser.id);
        // Trier par date de création
        const sortedLoans = mappedLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLoans(sortedLoans);
        loansIdsRef.current = new Set(sortedLoans.map(loan => loan.id));
      } catch {
        toast({
          title: t('clients.loan.error'),
          description: 'Impossible de charger vos crédits',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLoans();

    // Écouter les événements SSE pour les nouveaux/mise à jour crédits
    const unsubscribe = subscribe((event) => {
      if (event.type === SSEEventType.LOAN_CREATED && currentUser && isLoanCreatedPayload(event.data)) {
        try {
          const loanPayload = mapSSELoanToLoanApiResponse(event.data);
          const updatedLoan = mapLoansApiResponseToClientLoans([loanPayload], currentUser.id)[0];

          setLoans(prevLoans => {
            const existingIndex = prevLoans.findIndex(loan => loan.id === updatedLoan.id);

            if (existingIndex >= 0) {
              // Mettre à jour le prêt existant
              const newLoans = [...prevLoans];
              newLoans[existingIndex] = updatedLoan;
              return newLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            } else {
              loansIdsRef.current.add(updatedLoan.id);
              return [updatedLoan, ...prevLoans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            }
          });
        } catch (error) {
          console.error('Erreur lors du traitement du nouveau crédit:', error);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, t, toast, subscribe]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMonthYear = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.ACTIVE:
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            {t('clients.loan.status.active')}
          </span>
        );
      case LoanStatus.COMPLETED:
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            {t('clients.loan.status.completed')}
          </span>
        );
      case LoanStatus.DEFAULTED:
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            {t('clients.loan.status.defaulted')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <DashboardHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDeleteAccount={() => setIsDeleteAccountModalOpen(true)}
      />

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
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('dashboard.loans')}
                </h1>
                <p className="mt-1 text-gray-600">
                  {loans.filter(l => l.status !== LoanStatus.COMPLETED).length}{' '}
                  {loans.filter(l => l.status !== LoanStatus.COMPLETED).length > 1
                    ? t('clients.loan.loansCountPlural')
                    : t('clients.loan.loansCount')}{' '}
                  {t('clients.loan.inProgress')}
                </p>
              </div>
            </div>

            {/* Checkbox pour afficher les crédits terminés */}
            {loans.some(l => l.status === LoanStatus.COMPLETED) && (
              <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-white px-4 py-2.5 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
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

          {/* Search bar pour filtrer les crédits */}
          {loans.length > 0 && (
            <div className="mt-6">
              <input
                type="text"
                placeholder={t('clients.loan.searchPlaceholder')}
                value={loanSearchQuery}
                onChange={(e) => setLoanSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </motion.div>

        {/* Liste des crédits */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">{t('common.loading')}</p>
          </motion.div>
        ) : loans
            .filter(loan => showCompletedLoans || loan.status !== LoanStatus.COMPLETED)
            .filter(loan => loan.name.toLowerCase().includes(loanSearchQuery.toLowerCase())).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12"
          >
            <TrendingUp className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {loanSearchQuery ? t('clients.loan.noResults') : t('clients.loan.noLoans')}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {loanSearchQuery ? t('clients.loan.noResultsDescription') : t('clients.loan.noLoansDescription')}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {loans
              .filter(loan => showCompletedLoans || loan.status !== LoanStatus.COMPLETED)
              .filter(loan => loan.name.toLowerCase().includes(loanSearchQuery.toLowerCase()))
              .sort((a, b) => {
                // Trier avec COMPLETED en dernier
                if (a.status === LoanStatus.COMPLETED && b.status !== LoanStatus.COMPLETED) return 1;
                if (a.status !== LoanStatus.COMPLETED && b.status === LoanStatus.COMPLETED) return -1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((loan, index) => {
              const progress = loan.progressPercentage || 0;
              const monthsPaid = loan.monthsPaid || 0;

              return (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  {/* En-tête du crédit */}
                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-gray-900">
                            {loan.name}
                          </h2>
                          {getStatusBadge(loan.status)}
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {t('clients.loan.grantedOn')} {formatDate(loan.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{t('clients.loan.monthlyPayment')}</p>
                        <p className="financial-amount text-3xl font-bold text-gray-900">
                          {formatCurrency(loan.monthlyPayment)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Corps du crédit */}
                  <div className="p-6">
                    {/* Grille d'informations principales */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Euro className="h-5 w-5" />
                          <p className="text-sm font-medium">{t('clients.loan.initialAmount')}</p>
                        </div>
                        <p className="financial-amount mt-2 text-2xl font-bold text-gray-900">
                          {formatCurrency(loan.amount)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-red-700 bg-red-50 p-4">
                        <div className="flex items-center gap-2 text-red-600">
                          <Euro className="h-5 w-5" />
                          <p className="text-sm font-medium">{t('clients.loan.remainingBalance')}</p>
                        </div>
                        <p className="financial-amount mt-2 text-2xl font-bold text-red-700">
                          {formatCurrency(loan.remainingPayment)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-5 w-5" />
                          <p className="text-sm font-medium">{t('clients.loan.totalDuration')}</p>
                        </div>
                        <p className="financial-amount mt-2 text-2xl font-bold text-gray-900">
                          {loan.duration} {t('clients.loan.months')}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Percent className="h-5 w-5" />
                          <p className="text-sm font-medium">{t('clients.loan.interestRate')}</p>
                        </div>
                        <p className="financial-amount mt-2 text-2xl font-bold text-gray-900">
                          {loan.interestRate}%
                        </p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-6">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                          {t('clients.loan.progressTitle')}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
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
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {monthsPaid} / {loan.duration} {t('clients.loan.monthsPaid')}
                        </span>
                        <span>{t('clients.loan.end')}: {formatMonthYear(loan.endDate)}</span>
                      </div>

                      {/* Prochaine échéance */}
                      {loan.nextPaymentDate && loan.status !== LoanStatus.COMPLETED && (
                        <div className={`mt-3 flex items-center gap-2 rounded-lg border p-3 ${
                          loan.status === LoanStatus.DEFAULTED
                            ? 'border-red-200 bg-red-50'
                            : 'border-blue-200 bg-blue-50'
                        }`}>
                          <Calendar className={`h-4 w-4 ${
                            loan.status === LoanStatus.DEFAULTED ? 'text-red-600' : 'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <p className={`text-xs font-medium ${
                              loan.status === LoanStatus.DEFAULTED ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {t('clients.loan.nextPaymentDate')}
                            </p>
                            <p className={`text-sm font-semibold ${
                              loan.status === LoanStatus.DEFAULTED ? 'text-red-900' : 'text-blue-900'
                            }`}>
                              {formatDate(loan.nextPaymentDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Détails financiers */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="mb-3 flex items-center gap-2 text-gray-700">
                        <FileText className="h-5 w-5" />
                        <h3 className="font-semibold">{t('clients.loan.financialDetails')}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-xs text-gray-500">{t('clients.loan.totalCost')}</p>
                          <p className="mt-1 font-semibold text-gray-900">
                            {formatCurrency(loan.totalCost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('clients.loan.totalInterest')}</p>
                          <p className="mt-1 font-semibold text-red-700">
                            {formatCurrency(loan.totalInterest)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('clients.loan.insurance')}</p>
                          <p className="mt-1 font-semibold text-gray-900">
                            {formatCurrency(loan.insuranceCost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t('clients.loan.insuranceRate')}</p>
                          <p className="mt-1 font-semibold text-gray-900">
                            {loan.insuranceRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de suppression de compte */}
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={async (iban: string) => {
          await userApi.deleteMyAccount(iban);
          toast({
            title: t('account.deleteAccount.success'),
            description: t('account.deleteAccount.successDescription', { iban }),
          });
          await logout();
          router.push('/login');
        }}
      />
    </div>
  );
}
