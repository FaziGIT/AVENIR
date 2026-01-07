'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard-header';
import { ClientCard } from '@/components/clients/client-card';
import { ClientDetailsModal } from '@/components/clients/client-details-modal';
import { SendNotificationModal } from '@/components/clients/send-notification-modal';
import { GrantLoanModal, LoanCalculation } from '@/components/clients/grant-loan-modal';
import { CreateClientModal, CreateClientData } from '@/components/clients/create-client-modal';
import { EditClientModal, EditClientData } from '@/components/clients/edit-client-modal';
import { ConfirmDialog } from '@/components/modals/confirm-dialog';
import { DeleteAccountModal } from '@/components/modals/delete-account-modal';
import { ClientWithDetails } from '@/types/client';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useSSE, SSEEventType, isLoanCreatedPayload } from '@/contexts/SSEContext';
import { getAdvisorClients } from '@/lib/api/advisor.api';
import { getAllClients, banClient, activateClient, deleteClient, updateClient, createClient } from '@/lib/api/director.api';
import { createNotification } from '@/lib/api/notification.api';
import { createLoan } from '@/lib/api/loan.api';
import { mapAdvisorClientsToClientDetails } from '@/lib/mapping/client.mapping';
import { CustomNotificationType, UserRole, UserState } from '@avenir/shared/enums';
import { mapLoansApiResponseToClientLoans } from '@/lib/mapping/loan.mapping';
import { mapSSELoanToLoanApiResponse } from '@/lib/mapping/sse.mapping';

export default function ClientsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { subscribe } = useSSE();
  const [activeTab, setActiveTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isLoadingNotification, setIsLoadingNotification] = useState(false);
  const [isLoadingLoan, setIsLoadingLoan] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingClientAction, setIsLoadingClientAction] = useState(false);
  const [showBanned, setShowBanned] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isBanConfirmOpen, setIsBanConfirmOpen] = useState(false);
  const [isLoadingDeleteAccount, setIsLoadingDeleteAccount] = useState(false);

  const isDirector = currentUser?.role === UserRole.DIRECTOR;

  const loadClients = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoadingClients(true);

      let clientsList: ClientWithDetails[];

      if (isDirector) {
        // Directeur : récupère tous les clients
        const allClients = await getAllClients(currentUser.id);
        clientsList = mapAdvisorClientsToClientDetails(allClients, currentUser.id);
      } else {
        // Conseiller : récupère que ses clients
        const advisorClients = await getAdvisorClients(currentUser.id);
        clientsList = mapAdvisorClientsToClientDetails(advisorClients, currentUser.id);
      }

      setClients(clientsList);
    } catch {
      toast({
        title: t('clients.errors.loadingClients'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingClients(false);
    }
  }, [currentUser, isDirector, toast, t]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  // Gestion de l'ouverture automatique d'un client depuis sessionStorage
  useEffect(() => {
    const clientIdFromStorage = sessionStorage.getItem('openClientId');
    if (clientIdFromStorage && clients.length > 0) {
      const clientToOpen = clients.find(c => c.id === clientIdFromStorage);
      if (clientToOpen) {
        setSelectedClient(clientToOpen);
        setIsDetailsModalOpen(true);
        sessionStorage.removeItem('openClientId');
      }
    }
  }, [clients]);

  // Écoute des événements SSE pour les mises à jour de crédits en temps réel
  useEffect(() => {
    const unsubscribeFromSSE = subscribe((event) => {
      if (event.type === SSEEventType.LOAN_CREATED && currentUser && isLoanCreatedPayload(event.data)) {
        try {
          const loanPayload = mapSSELoanToLoanApiResponse(event.data);
          const updatedLoan = mapLoansApiResponseToClientLoans([loanPayload], currentUser.id)[0];

          setClients(prevClients => {
            return prevClients.map(client => {
              if (client.id === loanPayload.clientId) {
                const existingLoanIndex = client.loans.findIndex(loan => loan.id === updatedLoan.id);

                if (existingLoanIndex >= 0) {
                  // Mettre à jour le crédit existant
                  const updatedLoans = [...client.loans];
                  updatedLoans[existingLoanIndex] = updatedLoan;
                  return {
                    ...client,
                    loans: updatedLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  };
                } else {
                  return {
                    ...client,
                    loans: [updatedLoan, ...client.loans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  };
                }
              }
              return client;
            });
          });

          // Mettre à jour le client sélectionné
          setSelectedClient(prevSelected => {
            if (prevSelected && prevSelected.id === loanPayload.clientId) {
              const existingLoanIndex = prevSelected.loans.findIndex(loan => loan.id === updatedLoan.id);

              if (existingLoanIndex >= 0) {
                const updatedLoans = [...prevSelected.loans];
                updatedLoans[existingLoanIndex] = updatedLoan;
                return {
                  ...prevSelected,
                  loans: updatedLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                };
              } else {
                return {
                  ...prevSelected,
                  loans: [updatedLoan, ...prevSelected.loans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                };
              }
            }
            return prevSelected;
          });
        } catch (error) {
          console.error('Erreur lors du traitement de la mise à jour du crédit:', error);
        }
      }
    });

    return () => unsubscribeFromSSE();
  }, [subscribe, currentUser]);

  const handleClientClick = (client: ClientWithDetails) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const handleSendNotification = async (title: string, message: string, type: CustomNotificationType) => {
    if (!selectedClient || !currentUser) return;

    try {
      setIsLoadingNotification(true);

      await createNotification({
        userId: selectedClient.id,
        title,
        message,
        type,
        advisorName: `${currentUser.firstName} ${currentUser.lastName}`,
      });

      toast({
        title: t('clients.notification.success'),
        description: `Notification envoyée à ${selectedClient.firstName} ${selectedClient.lastName}`,
      });

      setIsNotificationModalOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: t('clients.notification.error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingNotification(false);
    }
  };

  const handleGrantLoan = async (loanData: LoanCalculation) => {
    if (!selectedClient) return;

    try {
      setIsLoadingLoan(true);

      const createdLoan = await createLoan({
        name: loanData.name,
        clientId: selectedClient.id,
        amount: loanData.amount,
        duration: loanData.duration,
        interestRate: loanData.interestRate,
        insuranceRate: loanData.insuranceRate,
      });

      const formatCurrency = (value: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

      toast({
        title: t('clients.loan.success'),
        description: (
          <div className="mt-2 space-y-1">
            <p className="font-semibold">
              {t('clients.loan.monthlyPayment')}: {formatCurrency(createdLoan.monthlyPayment)}
            </p>
            <p className="text-sm">
              {t('clients.loan.totalCost')}: {formatCurrency(createdLoan.totalCost)}
            </p>
            <p className="text-sm">
              {t('clients.loan.totalInterest')}: {formatCurrency(createdLoan.totalInterest)}
            </p>
            <p className="text-sm">
              {t('clients.loan.insuranceCost')}: {formatCurrency(createdLoan.insuranceCost)}
            </p>
          </div>
        ),
      });

      await loadClients();
      setIsLoanModalOpen(false);
      setIsDetailsModalOpen(false);
    } catch {
      toast({
        title: t('clients.loan.error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLoan(false);
    }
  };

  // Handlers pour le directeur
  const handleCreateClient = async (data: CreateClientData) => {
    try {
      setIsLoadingClientAction(true);
      await createClient(data);

      toast({
        title: t('director.createClient.success'),
        description: t('director.createClient.successDescription', {
          name: `${data.firstName} ${data.lastName}`,
        }),
      });

      await loadClients();
      setIsCreateClientModalOpen(false);
    } catch (error) {
      toast({
        title: t('director.createClient.error'),
        description: error instanceof Error ? error.message : t('director.createClient.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingClientAction(false);
    }
  };

  const handleEditClient = async (data: EditClientData) => {
    if (!selectedClient) return;

    try {
      setIsLoadingClientAction(true);
      await updateClient(selectedClient.id, data);

      toast({
        title: t('director.editClient.success'),
        description: t('director.editClient.successDescription'),
      });

      await loadClients();
      setIsEditClientModalOpen(false);
      setIsDetailsModalOpen(false);
    } catch (error) {
      toast({
        title: t('director.editClient.error'),
        description: error instanceof Error ? error.message : t('director.editClient.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingClientAction(false);
    }
  };

  const handleBanToggleClient = async () => {
    if (!selectedClient) return;
    setIsBanConfirmOpen(true);
  };

  const confirmBanToggleClient = async () => {
    if (!selectedClient) return;

    const isBanned = selectedClient.state === UserState.BANNED;

    try {
      setIsLoadingClientAction(true);

      if (isBanned) {
        await activateClient(selectedClient.id);
        toast({
          title: t('director.activateClient.success'),
          description: t('director.activateClient.successDescription', {
            name: `${selectedClient.firstName} ${selectedClient.lastName}`,
          }),
        });
      } else {
        await banClient(selectedClient.id);
        toast({
          title: t('director.banClient.success'),
          description: t('director.banClient.successDescription', {
            name: `${selectedClient.firstName} ${selectedClient.lastName}`,
          }),
        });
      }

      await loadClients();
      setIsDetailsModalOpen(false);
      setIsBanConfirmOpen(false);
    } catch (error) {
      toast({
        title: isBanned ? t('director.activateClient.error') : t('director.banClient.error'),
        description: error instanceof Error ? error.message : t('director.clientAction.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoadingClientAction(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteClient = async (iban: string) => {
    if (!selectedClient) return;

    try {
      setIsLoadingDeleteAccount(true);
      await deleteClient(selectedClient.id, iban);

      toast({
        title: t('director.deleteClient.success'),
        description: t('director.deleteClient.successDescription', {
          name: `${selectedClient.firstName} ${selectedClient.lastName}`,
        }),
      });

      await loadClients();
      setIsDetailsModalOpen(false);
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: t('director.deleteClient.error'),
        description: error instanceof Error ? error.message : t('director.deleteClient.errorDescription'),
        variant: 'destructive',
      });
      throw error; // Relancer l'erreur pour que la modal puisse l'afficher
    } finally {
      setIsLoadingDeleteAccount(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    // Filtre pour afficher/masquer les clients inactifs/bannis (directeur uniquement)
    if (isDirector && !showBanned) {
      if (client.state === UserState.BANNED || client.state === UserState.INACTIVE) {
        return false;
      }
    }

    // Filtre de recherche
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const email = client.email.toLowerCase();
    const state = client.state.toLowerCase();

    return fullName.includes(query) || email.includes(query) || state.includes(query);
  });


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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isDirector ? t('director.allClients') : t('clients.myClients')}
              </h1>
              <p className="mt-2 text-gray-600">
                {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Checkbox pour afficher les clients bannis/inactifs (directeur uniquement) */}
              {isDirector && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBanned}
                    onChange={(e) => setShowBanned(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {t('director.showBanned')}
                  </span>
                </label>
              )}

              {/* Barre de recherche */}
              <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 border-none bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
                />
              </div>

              {/* Bouton créer client (directeur uniquement) */}
              {isDirector && (
                <button
                  onClick={() => setIsCreateClientModalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                >
                  <UserPlus className="h-5 w-5" />
                  {t('director.createClient.button')}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Liste des clients */}
        {isLoadingClients ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">{t('common.loading')}</p>
          </motion.div>
        ) : filteredClients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12"
          >
            <Users className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {searchQuery ? t('clients.noClients') : t('clients.noClients')}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery
                ? `Aucun client ne correspond à "${searchQuery}"`
                : t('clients.noClientsDescription')}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ClientCard client={client} onClick={() => handleClientClick(client)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSendNotification={!isDirector ? () => setIsNotificationModalOpen(true) : undefined}
        onGrantLoan={!isDirector ? () => setIsLoanModalOpen(true) : undefined}
        onClientUpdate={(updatedClient) => {
          setClients(prevClients =>
            prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
          );
          setSelectedClient(updatedClient);
        }}
        onEditClient={isDirector ? () => setIsEditClientModalOpen(true) : undefined}
        onBanClient={isDirector ? handleBanToggleClient : undefined}
        onDeleteClient={isDirector ? handleDeleteClient : undefined}
        isDirector={isDirector}
      />

      {/* Modales conseiller */}
      {!isDirector && (
        <>
          <SendNotificationModal
            isOpen={isNotificationModalOpen}
            onClose={() => setIsNotificationModalOpen(false)}
            onSubmit={handleSendNotification}
            clientName={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ''}
            isLoading={isLoadingNotification}
          />

          <GrantLoanModal
            isOpen={isLoanModalOpen}
            onClose={() => setIsLoanModalOpen(false)}
            onSubmit={handleGrantLoan}
            clientName={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ''}
            isLoading={isLoadingLoan}
          />
        </>
      )}

      {/* Modales directeur */}
      {isDirector && (
        <>
          <CreateClientModal
            isOpen={isCreateClientModalOpen}
            onClose={() => setIsCreateClientModalOpen(false)}
            onSubmit={handleCreateClient}
            isLoading={isLoadingClientAction}
          />

          <EditClientModal
            isOpen={isEditClientModalOpen}
            onClose={() => setIsEditClientModalOpen(false)}
            onSubmit={handleEditClient}
            isLoading={isLoadingClientAction}
            client={selectedClient ? {
              email: selectedClient.email,
              firstName: selectedClient.firstName,
              lastName: selectedClient.lastName,
            } : null}
          />

          {/* Confirmation pour bannir/activer */}
          <ConfirmDialog
            isOpen={isBanConfirmOpen}
            onClose={() => setIsBanConfirmOpen(false)}
            onConfirm={confirmBanToggleClient}
            title={
              selectedClient?.state === UserState.BANNED
                ? t('director.activateClient.confirmTitle')
                : t('director.banClient.confirmTitle')
            }
            message={
              selectedClient?.state === UserState.BANNED
                ? t('director.activateClient.confirm', {
                    name: selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : '',
                  })
                : t('director.banClient.confirm', {
                    name: selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : '',
                  })
            }
            confirmText={
              selectedClient?.state === UserState.BANNED
                ? t('director.activateClient.button')
                : t('director.banClient.button')
            }
            isLoading={isLoadingClientAction}
            variant={selectedClient?.state === UserState.BANNED ? 'warning' : 'warning'}
          />

          {/* Modal de suppression avec IBAN */}
          <DeleteAccountModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={confirmDeleteClient}
            isLoading={isLoadingDeleteAccount}
          />
        </>
      )}
    </div>
  );
}
