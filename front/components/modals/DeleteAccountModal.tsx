'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AnimatedFormSection, ModalButton } from '@/components/ui/modal-helpers';
import { useLanguage } from '@/hooks/use-language';
import { motion } from 'framer-motion';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { accountApi, Account } from '@/lib/api/account.api';
import { useToast } from '@/hooks/use-toast';
import { AccountType } from '@/types/enums';

type DeleteAccountModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
    onSuccess?: () => void;
};

const deleteAccountSchema = z.object({
    selectedAccount: z.string().min(1, 'Vous devez sélectionner un compte'),
    verificationText: z.string().min(1, 'Le texte de vérification est requis'),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

export const DeleteAccountModal = ({ open, onOpenChange, accounts, onSuccess }: DeleteAccountModalProps) => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const form = useForm<DeleteAccountFormData>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: {
            selectedAccount: '',
            verificationText: '',
        },
    });

    useEffect(() => {
        if (open) {
            form.reset();
            setCopied(false);
        }
    }, [open, form]);

    const selectedAccount = form.watch('selectedAccount');
    const verificationText = form.watch('verificationText');

    const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);
    const selectedAccountLabel = selectedAccountData?.name || selectedAccountData?.iban || '';
    const confirmationText = selectedAccount
        ? `${t('dashboard.deleteAccountModal.confirmationText')} : ${selectedAccountLabel}`
        : t('dashboard.deleteAccountModal.confirmationText');
    const isVerified = verificationText === confirmationText;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(confirmationText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (data: DeleteAccountFormData) => {
        if (!isVerified) return;

        const selectedAccountData = accounts.find(acc => acc.id === data.selectedAccount);
        if (selectedAccountData?.type === AccountType.CURRENT) {
            const currentAccountsCount = accounts.filter(acc => acc.type === AccountType.CURRENT).length;
            if (currentAccountsCount <= 1) {
                toast({
                    title: t('common.error'),
                    description: t('dashboard.deleteAccountModal.cannotDeleteLastCurrent'),
                    variant: 'destructive',
                });
                return;
            }
        }

        try {
            await accountApi.deleteAccount(data.selectedAccount);

            toast({
                title: 'Succès',
                description: 'Compte supprimé avec succès',
            });

            form.reset();
            setCopied(false);
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast({
                title: t('common.error'),
                description: error instanceof Error ? error.message : 'Une erreur est survenue',
                variant: 'destructive',
            });
        }
    };

    const handleCancel = () => {
        form.reset();
        setCopied(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-red-600">{t('dashboard.deleteAccountModal.title')}</DialogTitle>
                            <DialogDescription className="mt-1">{t('dashboard.deleteAccountModal.description')}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <AnimatedFormSection delay={0.1}>
                            <div className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="selectedAccount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('dashboard.deleteAccountModal.selectAccount')}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={form.formState.isSubmitting}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder={t('dashboard.deleteAccountModal.selectAccountPlaceholder')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(() => {
                                                        const currentAccounts = accounts.filter(account => account.type === AccountType.CURRENT);
                                                        const isLastCurrentAccount = currentAccounts.length === 1;
                                                        return currentAccounts.map((account) => (
                                                            <SelectItem 
                                                                key={account.id} 
                                                                value={account.id}
                                                                disabled={isLastCurrentAccount}
                                                            >
                                                                {account.name || account.iban}
                                                                {isLastCurrentAccount && ` ${t('dashboard.deleteAccountModal.cannotDeleteLastCurrentSuffix')}`}
                                                            </SelectItem>
                                                        ));
                                                    })()}
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
                                className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4"
                            >
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-red-900">
                                        {t('dashboard.deleteAccountModal.verificationLabel')}
                                    </Label>
                                    <div className="flex items-center gap-2 rounded-lg bg-white p-3 border border-red-200">
                                        <span className="flex-1 text-red-600">{confirmationText}</span>
                                        <motion.button
                                            type="button"
                                            onClick={handleCopy}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 transition-colors hover:bg-gray-200"
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4 text-gray-600" />
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="verificationText"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('dashboard.deleteAccountModal.verificationInput')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t('dashboard.deleteAccountModal.verificationPlaceholder')}
                                                    disabled={form.formState.isSubmitting}
                                                    className={`h-11 ${
                                                        verificationText && !isVerified
                                                            ? 'border-red-500 focus:ring-red-500'
                                                            : verificationText && isVerified
                                                            ? 'border-green-500 focus:ring-green-500'
                                                            : ''
                                                    }`}
                                                />
                                            </FormControl>
                                            {verificationText && !isVerified && (
                                                <p className="text-xs text-red-600">{t('dashboard.deleteAccountModal.verificationError')}</p>
                                            )}
                                            {isVerified && (
                                                <p className="text-xs text-green-600">{t('dashboard.deleteAccountModal.verificationSuccess')}</p>
                                            )}
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
                                    variant="danger"
                                    disabled={form.formState.isSubmitting || !isVerified}
                                >
                                    {form.formState.isSubmitting ? t('common.loading') : t('common.delete')}
                                </ModalButton>
                            </DialogFooter>
                        </AnimatedFormSection>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
