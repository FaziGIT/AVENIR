'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { useToast } from '@/hooks/use-toast';

type AddMoneyModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

const addMoneySchema = z.object({
    account: z.string().min(1, 'Vous devez sélectionner un compte'),
    amount: z.string()
        .min(1, 'Le montant est requis')
        .refine((val) => {
            const num = parseFloat(val.replace(',', '.'));
            return !isNaN(num) && num > 0;
        }, 'Le montant doit être supérieur à 0'),
    description: z.string().optional(),
});

type AddMoneyFormData = z.infer<typeof addMoneySchema>;

export const AddMoneyModal = ({ open, onOpenChange, onSuccess }: AddMoneyModalProps) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { toast } = useToast();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    const form = useForm<AddMoneyFormData>({
        resolver: zodResolver(addMoneySchema),
        defaultValues: {
            account: '',
            amount: '',
            description: '',
        },
        mode: 'onChange',
    });

    const selectedAccount = accounts.find(acc => acc.id === form.watch('account'));

    useEffect(() => {
        if (open) {
            form.reset();
            loadAccounts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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

    const handleSubmit = async (data: AddMoneyFormData) => {
        if (!user?.id) {
            return;
        }

        const amount = parseFloat(data.amount.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
            return;
        }

        try {
            await transactionApi.createTransaction({
                fromAccountId: data.account,
                toAccountId: data.account,
                amount: amount,
                description: data.description || undefined,
                type: TransactionType.DEPOSIT,
            });

            toast({
                title: t('common.success'),
                description: 'Argent ajouté avec succès',
            });

            form.reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast({
                title: t('common.error'),
                description: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'ajout d\'argent',
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
                    <DialogTitle>Ajouter de l'argent</DialogTitle>
                    <DialogDescription>Sélectionnez un compte et entrez le montant à ajouter</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <AnimatedFormSection delay={0.1}>
                            <div className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="account"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Compte</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={form.formState.isSubmitting}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Sélectionnez un compte" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {isLoadingAccounts ? (
                                                        <div className="px-2 py-1.5 text-sm text-gray-500">
                                                            {t('common.loading')}...
                                                        </div>
                                                    ) : accounts.length === 0 ? (
                                                        <div className="px-2 py-1.5 text-sm text-gray-500">
                                                            Aucun compte disponible
                                                        </div>
                                                    ) : (
                                                        accounts.map((account) => (
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {selectedAccount && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Montant</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                placeholder="0,00"
                                                                disabled={form.formState.isSubmitting}
                                                                className="h-11 pr-8"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}

                                {selectedAccount && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description ({t('common.optional')})</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Description de la transaction"
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
                                    {form.formState.isSubmitting ? t('common.loading') : 'Ajouter'}
                                </ModalButton>
                            </DialogFooter>
                        </AnimatedFormSection>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

