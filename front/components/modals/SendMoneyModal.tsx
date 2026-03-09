'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AnimatedFormSection, ModalButton } from '@/components/ui/modal-helpers';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/AuthContext';
import { accountApi, Account } from '@/lib/api/account.api';
import { transactionApi } from '@/lib/api/transaction.api';
import { TransactionType } from '@avenir/shared/enums';
import { formatCurrency } from '@/lib/format';
import { motion } from 'framer-motion';
import { SavingTypeMaxAmount } from '@/types/enums';
import { AccountType } from '@/types/enums';
import { useToast } from '@/hooks/use-toast';

type SendMoneyModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

const createSendMoneySchema = (
    sourceAccountBalance: number | null,
    destinationAccount: Account | null
) => z.object({
    sourceAccount: z.string().min(1, 'Vous devez sélectionner un compte source'),
    destinationType: z.enum(['myAccount', 'iban']),
    destination: z.string().min(1, 'Vous devez sélectionner un destinataire ou entrer un IBAN'),
    amount: z.string()
        .min(1, 'Le montant est requis')
        .refine((val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num > 0;
        }, 'Le montant doit être supérieur à 0')
        .refine((val) => {
            if (sourceAccountBalance === null) return true;
            const num = parseFloat(val.replace(',', '.'));
            return !isNaN(num) && num <= sourceAccountBalance;
        }, {
            message: sourceAccountBalance === null 
                ? 'Solde non disponible' 
                : `Le montant ne peut pas dépasser ${formatCurrency(sourceAccountBalance, 'EUR')}`,
        })
        .refine((val) => {
            // Check if destination account is a savings account with a limit
            if (!destinationAccount || destinationAccount.type !== AccountType.SAVINGS || !destinationAccount.savingType) {
                return true; // No limit for non-savings accounts
            }
            const num = parseFloat(val.replace(',', '.'));
            const maxAmount = SavingTypeMaxAmount[destinationAccount.savingType];
            if (!maxAmount || maxAmount <= 0) {
                return true; // No limit
            }
            const newBalance = destinationAccount.balance + num;
            return newBalance <= maxAmount;
        }, {
            message: destinationAccount && destinationAccount.type === AccountType.SAVINGS && destinationAccount.savingType
                ? (() => {
                    const maxAmount = SavingTypeMaxAmount[destinationAccount.savingType!];
                    const remaining = maxAmount - destinationAccount.balance;
                    return `Le solde du compte d'épargne ne peut pas dépasser ${formatCurrency(maxAmount, destinationAccount.currency || 'EUR')}. Solde actuel: ${formatCurrency(destinationAccount.balance, destinationAccount.currency || 'EUR')}, vous pouvez ajouter au maximum ${formatCurrency(remaining, destinationAccount.currency || 'EUR')}`;
                })()
                : 'Le solde du compte d\'épargne ne peut pas dépasser la limite maximale',
        }),
    description: z.string().optional(),
});

type SendMoneyFormData = z.infer<ReturnType<typeof createSendMoneySchema>>;

export const SendMoneyModal = ({ open, onOpenChange, onSuccess }: SendMoneyModalProps) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    const form = useForm<SendMoneyFormData>({
        resolver: zodResolver(createSendMoneySchema(null, null)),
        defaultValues: {
            sourceAccount: '',
            destinationType: 'myAccount',
            destination: '',
            amount: '',
            description: '',
        },
        mode: 'onChange',
    });

    const sourceAccount = form.watch('sourceAccount');
    const destinationType = form.watch('destinationType');
    const amount = form.watch('amount');
    const destination = form.watch('destination');
    const selectedSourceAccount = accounts.find(acc => acc.id === sourceAccount);
    const sourceAccountBalance = selectedSourceAccount?.balance ?? null;
    const accountsWithBalance = accounts.filter(acc => acc.balance > 0);
    const [isSearchingIban, setIsSearchingIban] = useState(false);
    const [foundAccount, setFoundAccount] = useState<Account | null>(null);
    const ibanSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Get destination account (either from myAccount selection or found IBAN account)
    const selectedDestinationAccount = destinationType === 'myAccount' 
        ? accounts.find(acc => acc.id === destination)
        : foundAccount;

    // Update form validation when source account, destination account, or amount changes
    useEffect(() => {
        if (selectedSourceAccount && amount) {
            const schema = createSendMoneySchema(selectedSourceAccount.balance, selectedDestinationAccount || null);
            const currentValues = form.getValues();
            const result = schema.safeParse(currentValues);
            
            if (!result.success) {
                const amountIssue = result.error.issues.find(issue => issue.path.includes('amount'));
                if (amountIssue) {
                    form.setError('amount', {
                        type: 'manual',
                        message: amountIssue.message,
                    });
                }
            } else {
                form.clearErrors('amount');
            }
        } else if (selectedSourceAccount && !amount) {
            form.clearErrors('amount');
        }
    }, [selectedSourceAccount, selectedDestinationAccount, amount, form]);

    useEffect(() => {
        if (open) {
            form.reset({
                sourceAccount: '',
                destinationType: 'myAccount',
                destination: '',
                amount: '',
                description: '',
            });
            setFoundAccount(null);
            loadAccounts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);


    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (ibanSearchTimeoutRef.current) {
                clearTimeout(ibanSearchTimeoutRef.current);
            }
        };
    }, []);


    const loadAccounts = useCallback(async () => {
        if (!user?.id) {
            setIsLoadingAccounts(false);
            return;
        }

        try {
            setIsLoadingAccounts(true);
            const loadedAccounts = await accountApi.getAccounts();
            setAccounts(loadedAccounts);
        } catch (error) {
        } finally {
            setIsLoadingAccounts(false);
        }
    }, [user?.id, t]);

    const availableDestinations = accounts.filter((acc) => {
        // Exclude source account
        if (acc.id === sourceAccount) return false;
        
        // Exclude savings accounts that have reached their maximum limit
        if (acc.type === AccountType.SAVINGS && acc.savingType) {
            const maxAmount = SavingTypeMaxAmount[acc.savingType];
            if (maxAmount && maxAmount > 0 && acc.balance >= maxAmount) {
                return false; // Account has reached its limit
            }
        }
        
        return true;
    });
    
    const hasAvailableDestinations = availableDestinations.length > 0;

    // Auto-set to IBAN if no available destinations when source account is selected
    useEffect(() => {
        if (sourceAccount && !hasAvailableDestinations) {
            form.setValue('destinationType', 'iban');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceAccount, hasAvailableDestinations]);

    // Clear destination if it becomes invalid (e.g., savings account reached max limit)
    useEffect(() => {
        const currentDestination = form.getValues('destination');
        if (currentDestination && destinationType === 'myAccount') {
            const destinationAccount = accounts.find(acc => acc.id === currentDestination);
            if (destinationAccount) {
                // Check if it's a savings account that has reached its limit
                if (destinationAccount.type === AccountType.SAVINGS && destinationAccount.savingType) {
                    const maxAmount = SavingTypeMaxAmount[destinationAccount.savingType];
                    if (maxAmount && maxAmount > 0 && destinationAccount.balance >= maxAmount) {
                        // Clear the selection if account reached its limit
                        form.setValue('destination', '');
                    }
                }
            } else {
                // Account not found in available destinations, clear it
                form.setValue('destination', '');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accounts, destinationType, form]);

    const handleIbanSearch = useCallback(async (iban: string) => {
        // Clean IBAN (remove spaces)
        const cleanIban = iban.replace(/\s/g, '');
        
        if (!cleanIban || cleanIban.length < 10) {
            setFoundAccount(null);
            return;
        }

        try {
            setIsSearchingIban(true);
            const account = await accountApi.getAccountByIban(cleanIban);
            if (account) {
                if (account.id === sourceAccount) {
                    setFoundAccount(null);
                } else {
                    setFoundAccount(account);
                    // Keep the IBAN text in the field, we'll use foundAccount.id when submitting
                }
            } else {
                setFoundAccount(null);
            }
        } catch (error) {
            setFoundAccount(null);
        } finally {
            setIsSearchingIban(false);
        }
    }, [sourceAccount, form]);

    const debouncedIbanSearch = useCallback((iban: string) => {
        // Clear previous timeout
        if (ibanSearchTimeoutRef.current) {
            clearTimeout(ibanSearchTimeoutRef.current);
        }
        
        // Set new timeout
        ibanSearchTimeoutRef.current = setTimeout(() => {
            handleIbanSearch(iban);
        }, 500); // Wait 500ms after user stops typing
    }, [handleIbanSearch]);


    const handleSubmit = async (data: SendMoneyFormData) => {
        if (!user?.id) {
            return;
        }

        const amount = parseFloat(data.amount.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
            return;
        }

        if (!selectedSourceAccount) {
            return;
        }

        if (selectedSourceAccount.balance < amount) {
            return;
        }

        let toAccountId: string | undefined;
        
        // If destination is an IBAN, use the found account ID
        if (destinationType === 'iban') {
            if (!foundAccount) {
                return;
            }
            toAccountId = foundAccount.id;
        } else {
            // For "myAccount" type, use the destination directly
            toAccountId = data.destination;
        }

        if (!toAccountId) {
            return;
        }

        try {
            await transactionApi.createTransaction({
                fromAccountId: data.sourceAccount,
                toAccountId: toAccountId,
                amount: amount,
                description: data.description || undefined,
                type: TransactionType.TRANSFER,
            });

            toast({
                title: t('common.success'),
                description: 'Virement effectué avec succès',
            });

            form.reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast({
                title: t('common.error'),
                description: error instanceof Error ? error.message : 'Une erreur est survenue lors du virement',
                variant: 'destructive',
            });
        }
    };

    const handleCancel = () => {
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('dashboard.sendMoneyModal.title')}</DialogTitle>
                    <DialogDescription>{t('dashboard.sendMoneyModal.description')}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <AnimatedFormSection delay={0.1}>
                            <div className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="sourceAccount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('dashboard.sendMoneyModal.sourceAccount')}</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    form.setValue('destination', '');
                                                    form.setValue('amount', '');
                                                    form.clearErrors('amount');
                                                }}
                                                defaultValue={field.value}
                                                disabled={form.formState.isSubmitting}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder={t('dashboard.sendMoneyModal.sourceAccountPlaceholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {isLoadingAccounts ? (
                                                        <div className="px-2 py-1.5 text-sm text-gray-500">
                                                            {t('common.loading')}...
                                                        </div>
                                                    ) : accountsWithBalance.length === 0 ? (
                                                        <div className="px-2 py-1.5 text-sm text-gray-500">
                                                            Aucun compte avec solde disponible
                                                        </div>
                                                    ) : (
                                                        accountsWithBalance.map((account) => (
                                                            <SelectItem key={account.id} value={account.id}>
                                                            <div className="flex items-center justify-between gap-4">
                                                                    <span>{account.name || account.iban}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatCurrency(account.balance, account.currency)}
                                                                    </span>
                                                            </div>
                                                        </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {accountsWithBalance.length === 0 && !isLoadingAccounts && (
                                                <p className="text-sm text-red-600 mt-1">
                                                    Vous devez avoir au moins un compte avec un solde supérieur à 0 pour effectuer un virement.
                                                </p>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {sourceAccount && hasAvailableDestinations && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="destinationType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type de destination</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            form.setValue('destination', '');
                                                            setFoundAccount(null);
                                                        }}
                                                        value={field.value}
                                                        disabled={form.formState.isSubmitting}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-11">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="myAccount">Mes comptes</SelectItem>
                                                            <SelectItem value="iban">IBAN externe</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}

                                {sourceAccount && !hasAvailableDestinations && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="rounded-lg bg-blue-50 p-3">
                                            <p className="text-sm text-blue-800">
                                                Vous n'avez pas d'autres comptes disponibles. Utilisez un IBAN externe pour transférer de l'argent.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {sourceAccount && destinationType === 'myAccount' && (
                                    <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <FormField
                                        control={form.control}
                                        name="destination"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('dashboard.sendMoneyModal.destination')}</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={form.formState.isSubmitting}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder={t('dashboard.sendMoneyModal.destinationPlaceholder')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableDestinations.length === 0 ? (
                                                            <div className="px-2 py-1.5 text-sm text-gray-500">
                                                                Aucun compte de destination disponible
                                                            </div>
                                                        ) : (
                                                            <>
                                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                                                            {t('dashboard.sendMoneyModal.myAccounts')}
                                                        </div>
                                                                {availableDestinations.map((account) => (
                                                                    <SelectItem key={account.id} value={account.id}>
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            <span>{account.name || account.iban}</span>
                                                                            <span className="text-xs text-gray-500">
                                                                                {formatCurrency(account.balance, account.currency)}
                                                                            </span>
                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {selectedDestinationAccount && selectedDestinationAccount.type === AccountType.SAVINGS && selectedDestinationAccount.savingType && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-xs text-gray-600">
                                                            Solde actuel : {formatCurrency(selectedDestinationAccount.balance, selectedDestinationAccount.currency)}
                                                        </p>
                                                        {(() => {
                                                            const maxAmount = SavingTypeMaxAmount[selectedDestinationAccount.savingType];
                                                            const remaining = maxAmount - selectedDestinationAccount.balance;
                                                            return (
                                                                <>
                                                                    <p className="text-xs font-medium text-gray-900">
                                                                        Plafond maximum : {formatCurrency(maxAmount, selectedDestinationAccount.currency)}
                                                                    </p>
                                                                    {remaining > 0 ? (
                                                                        <p className="text-xs text-blue-600">
                                                                            Vous pouvez ajouter jusqu'à : {formatCurrency(remaining, selectedDestinationAccount.currency)}
                                                                        </p>
                                                                    ) : (
                                                                        <p className="text-xs text-red-600">
                                                                            Le compte a atteint son plafond maximum
                                                                        </p>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </motion.div>
                                )}

                                {sourceAccount && destinationType === 'iban' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="destination"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>IBAN du destinataire</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                                                                disabled={form.formState.isSubmitting}
                                                                className="h-11"
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    debouncedIbanSearch(e.target.value);
                                                                }}
                                                            />
                                                            {isSearchingIban && (
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                                                                    Recherche...
                                                                </span>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <div className="min-h-[20px] mt-1">
                                                        {foundAccount && (
                                                            <p className="text-sm text-green-600">
                                                                Compte trouvé : {foundAccount.name || foundAccount.iban}
                                                            </p>
                                                        )}
                                                        {!foundAccount && destination && destination.length > 10 && !isSearchingIban && (
                                                            <p className="text-sm text-red-600">
                                                                Compte introuvable
                                                            </p>
                                                        )}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}

                                {sourceAccount && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => {
                                                return (
                                                <FormItem>
                                                    <FormLabel>{t('dashboard.sendMoneyModal.amount')}</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max={selectedSourceAccount?.balance ?? undefined}
                                                                placeholder="0,00"
                                                                disabled={form.formState.isSubmitting}
                                                                className="h-11 pr-8"
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    // Allow empty input
                                                                    if (value === '') {
                                                                        field.onChange('');
                                                                        form.clearErrors('amount');
                                                                        return;
                                                                    }
                                                                    
                                                                    const num = parseFloat(value);
                                                                    if (isNaN(num) || num <= 0) {
                                                                        field.onChange(value);
                                                                        return;
                                                                    }
                                                                    
                                                                    // Prevent entering amount greater than source account balance
                                                                    if (selectedSourceAccount && num > selectedSourceAccount.balance) {
                                                                        // Set to max balance instead
                                                                        field.onChange(selectedSourceAccount.balance.toString());
                                                                        form.setError('amount', {
                                                                            type: 'manual',
                                                                            message: `Le montant ne peut pas dépasser ${formatCurrency(selectedSourceAccount.balance, selectedSourceAccount.currency)}`,
                                                                        });
                                                                        return;
                                                                    }
                                                                    
                                                                    // Check destination account limit for savings accounts
                                                                    if (selectedDestinationAccount && selectedDestinationAccount.type === AccountType.SAVINGS && selectedDestinationAccount.savingType) {
                                                                        const maxAmount = SavingTypeMaxAmount[selectedDestinationAccount.savingType];
                                                                        if (maxAmount && maxAmount > 0) {
                                                                            const newBalance = selectedDestinationAccount.balance + num;
                                                                            if (newBalance > maxAmount) {
                                                                                const remaining = maxAmount - selectedDestinationAccount.balance;
                                                                                if (remaining > 0) {
                                                                                    field.onChange(remaining.toString());
                                                                                    form.setError('amount', {
                                                                                        type: 'manual',
                                                                                        message: `Le solde du compte d'épargne ne peut pas dépasser ${formatCurrency(maxAmount, selectedDestinationAccount.currency || 'EUR')}. Vous pouvez ajouter au maximum ${formatCurrency(remaining, selectedDestinationAccount.currency || 'EUR')}`,
                                                                                    });
                                                                                    return;
                                                                                } else {
                                                                                    form.setError('amount', {
                                                                                        type: 'manual',
                                                                                        message: `Le compte d'épargne a atteint sa limite maximale de ${formatCurrency(maxAmount, selectedDestinationAccount.currency || 'EUR')}`,
                                                                                    });
                                                                                    return;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                    
                                                                    field.onChange(value);
                                                                    form.clearErrors('amount');
                                                                }}
                                                                onBlur={(e) => {
                                                                    field.onBlur();
                                                                    // Validate on blur
                                                                    if (e.target.value) {
                                                                        const num = parseFloat(e.target.value);
                                                                        if (isNaN(num)) return;
                                                                        
                                                                        // Check source account balance
                                                                        if (selectedSourceAccount && num > selectedSourceAccount.balance) {
                                                                            form.setError('amount', {
                                                                                type: 'manual',
                                                                                message: `Le montant ne peut pas dépasser ${formatCurrency(selectedSourceAccount.balance, selectedSourceAccount.currency)}`,
                                                                            });
                                                                            return;
                                                                        }
                                                                        
                                                                        // Check destination account limit for savings accounts
                                                                        if (selectedDestinationAccount && selectedDestinationAccount.type === AccountType.SAVINGS && selectedDestinationAccount.savingType) {
                                                                            const maxAmount = SavingTypeMaxAmount[selectedDestinationAccount.savingType];
                                                                            if (maxAmount && maxAmount > 0) {
                                                                                const newBalance = selectedDestinationAccount.balance + num;
                                                                                if (newBalance > maxAmount) {
                                                                                    const remaining = maxAmount - selectedDestinationAccount.balance;
                                                                                    form.setError('amount', {
                                                                                        type: 'manual',
                                                                                        message: `Le solde du compte d'épargne ne peut pas dépasser ${formatCurrency(maxAmount, selectedDestinationAccount.currency || 'EUR')}. Vous pouvez ajouter au maximum ${formatCurrency(remaining, selectedDestinationAccount.currency || 'EUR')}`,
                                                                                    });
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                                        </div>
                                                    </FormControl>
                                                        {selectedSourceAccount && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Solde disponible : {formatCurrency(selectedSourceAccount.balance, selectedSourceAccount.currency)}
                                                            </p>
                                                        )}
                                                    <FormMessage />
                                                </FormItem>
                                                );
                                            }}
                                        />
                                    </motion.div>
                                )}

                                {sourceAccount && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3, delay: 0.15 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('dashboard.sendMoneyModal.description')} ({t('common.optional')})</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder={t('dashboard.sendMoneyModal.descriptionPlaceholder')}
                                                            disabled={form.formState.isSubmitting}
                                                            className="h-11"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </AnimatedFormSection>

                        <AnimatedFormSection delay={0.15}>
                            <DialogFooter>
                                <ModalButton onClick={handleCancel} disabled={form.formState.isSubmitting}>
                                    {t('common.cancel')}
                                </ModalButton>
                                <ModalButton
                                    type="submit"
                                    variant="primary"
                                    disabled={form.formState.isSubmitting || !form.formState.isValid}
                                >
                                    {form.formState.isSubmitting ? t('common.loading') : t('common.send')}
                                </ModalButton>
                            </DialogFooter>
                        </AnimatedFormSection>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
