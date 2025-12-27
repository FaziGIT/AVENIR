'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AnimatedFormSection, ModalButton } from '@/components/ui/modal-helpers';
import { useLanguage } from '@/hooks/use-language';
import { accountApi } from '@/lib/api/account.api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AccountType } from '@/types/enums';

type AddAccountModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

const addAccountSchema = z.object({
    accountName: z.string().min(1, 'Le nom du compte est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
});

type AddAccountFormData = z.infer<typeof addAccountSchema>;

export const AddAccountModal = ({ open, onOpenChange, onSuccess }: AddAccountModalProps) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { toast } = useToast();

    const form = useForm<AddAccountFormData>({
        resolver: zodResolver(addAccountSchema),
        defaultValues: {
            accountName: '',
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                accountName: '',
            });
        }
    }, [open, form]);

    const handleSubmit = async (data: AddAccountFormData) => {
        if (!user?.id) {
            toast({
                title: t('common.error'),
                description: 'Vous devez être connecté pour créer un compte',
                variant: 'destructive',
            });
            return;
        }

        try {
            await accountApi.addAccount({
                name: data.accountName,
                type: AccountType.CURRENT,
            });

            toast({
                title: 'Succès',
                description: 'Compte créé avec succès',
            });

            form.reset();
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
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('dashboard.addAccountModal.title')}</DialogTitle>
                    <DialogDescription>{t('dashboard.addAccountModal.description')}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <AnimatedFormSection delay={0.1}>
                            <div className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="accountName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('dashboard.addAccountModal.accountName')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t('dashboard.addAccountModal.accountNamePlaceholder')}
                                                    disabled={form.formState.isSubmitting}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    {form.formState.isSubmitting ? t('common.loading') : t('common.create')}
                                </ModalButton>
                            </DialogFooter>
                        </AnimatedFormSection>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
