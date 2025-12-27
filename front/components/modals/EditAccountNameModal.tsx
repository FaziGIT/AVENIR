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
import { useToast } from '@/hooks/use-toast';

type EditAccountNameModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accountId: string;
    currentName: string;
    onSuccess?: () => void;
};

const editAccountNameSchema = z.object({
    accountName: z.string().min(1, 'Le nom du compte est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
});

type EditAccountNameFormData = z.infer<typeof editAccountNameSchema>;

export const EditAccountNameModal = ({ open, onOpenChange, accountId, currentName, onSuccess }: EditAccountNameModalProps) => {
    const { t } = useLanguage();
    const { toast } = useToast();

    const form = useForm<EditAccountNameFormData>({
        resolver: zodResolver(editAccountNameSchema),
        defaultValues: {
            accountName: currentName,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({ accountName: currentName });
        }
    }, [open, currentName, form]);

    const handleSubmit = async (data: EditAccountNameFormData) => {
        try {
            await accountApi.updateAccountName(accountId, data.accountName || null);

            toast({
                title: 'Succès',
                description: 'Nom du compte mis à jour avec succès',
            });

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
        form.reset({ accountName: currentName });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('dashboard.editAccountNameModal.title')}</DialogTitle>
                    <DialogDescription>{t('dashboard.editAccountNameModal.description')}</DialogDescription>
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
                                            <FormLabel>{t('dashboard.editAccountNameModal.accountName')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t('dashboard.editAccountNameModal.accountNamePlaceholder')}
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
                                    {form.formState.isSubmitting ? t('common.loading') : t('common.save')}
                                </ModalButton>
                            </DialogFooter>
                        </AnimatedFormSection>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
