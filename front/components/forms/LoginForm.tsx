'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@avenir/shared';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export const LoginForm = () => {
    const { t } = useTranslation('common');
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identityNumber: '',
            passcode: '',
        },
    });

    const handleSubmit = async (data: LoginInput) => {
        setError(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (response.status === 403 && errorData.isBanned) {
                    window.location.href = '/banned';
                    return;
                }

                throw new Error(errorData.message || 'Login failed');
            }

            window.location.href = '/dashboard';
        } catch (error) {
            setError(error instanceof Error ? error.message : t('auth.login.error'));
        }
    };

    return (
        <div className="space-y-8 font-sans">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center"
            >
                <Image
                    src="/avenir.png"
                    alt="AVENIR Bank"
                    width={200}
                    height={60}
                    className="h-auto w-auto"
                    priority
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-2 text-center"
            >
                <h1 className="text-3xl font-light tracking-tight text-gray-900 md:text-4xl">
                    {t('auth.login.title')}
                </h1>
                <p className="text-base font-light text-gray-600">
                    {t('auth.login.subtitle')}
                </p>
            </motion.div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </motion.div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <FormField
                            control={form.control}
                            name="identityNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold text-gray-900 mb-2">
                                    {t('auth.login.identityNumber')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder={t('auth.login.identityNumberPlaceholder')}
                                        className="h-12 font-light text-base rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#004d91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004d91]/30"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <FormField
                            control={form.control}
                            name="passcode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-semibold text-gray-900 mb-2">
                                    {t('auth.login.passcode')}
                                </FormLabel>
                                <FormControl>
                                    <PasswordInput
                                        placeholder={t('auth.login.passcodePlaceholder')}
                                        className="h-12 font-light text-base rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#004d91] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004d91]/30"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="submit"
                                className="w-full h-12 font-light text-base text-white hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: '#004d91' }}
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting
                                    ? t('common.loading')
                                    : t('auth.login.submit')}
                            </Button>
                        </motion.div>
                    </motion.div>
                </form>
            </Form>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center text-sm"
            >
                <span className="font-light text-gray-600">{t('auth.login.noAccount')} </span>
                <a
                    href="/register"
                    className="font-light text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    tabIndex={0}
                >
                    {t('auth.login.signUp')}
                </a>
            </motion.div>
        </div>
    );
};

