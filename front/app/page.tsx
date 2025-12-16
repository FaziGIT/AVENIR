'use client';

import '@/i18n/config';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Wifi } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { LandingHeader } from '@/components/landing-header';
import { DashboardPreview } from '@/components/dashboard-preview';

export default function Home() {
    const { t } = useLanguage();

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <LandingHeader />

            {/* Background decorative elements */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.05, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute -right-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-blue-600 blur-3xl"
                ></motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.05, scale: 1 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-purple-600 blur-3xl"
                ></motion.div>
            </div>

            <main className="relative z-[1] overflow-hidden bg-white">
                {/* Hero Section */}
                <section className="relative px-6 pb-32 pt-20 md:pb-20 md:pt-32">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="mx-auto max-w-4xl text-center">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="mb-6 text-4xl font-light leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
                            >
                                {t('landing.hero.title')}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 0.5, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="mb-16 text-base font-light text-gray-600 opacity-60 md:text-lg lg:text-xl"
                            >
                                {t('landing.hero.subtitle')}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <motion.a
                                    href="#"
                                    className="inline-flex cursor-pointer items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-light text-white shadow-lg transition-all hover:bg-blue-700 md:text-lg"
                                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={t('landing.hero.cta')}
                                >
                                    {t('landing.hero.cta')}
                                </motion.a>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Preview Section */}
                <section className="relative px-6 pb-20">
                    <DashboardPreview />
                </section>

                {/* Credit Cards Section */}
                <section className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-20 md:py-32">
                    <div className="mx-auto max-w-[1400px]">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <motion.h2
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.6 }}
                                    className="text-3xl font-light leading-tight text-gray-900 md:text-4xl lg:text-5xl"
                                >
                                    {t('landing.creditCards.title')}
                                </motion.h2>

                                <div className="space-y-4">
                                    {[
                                        t('landing.creditCards.features.investment'),
                                        t('landing.creditCards.features.noFees'),
                                        t('landing.creditCards.features.lowDeposit'),
                                    ].map((feature, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true, amount: 0.3 }}
                                            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="font-light text-gray-400">→</span>
                                            <span className="font-light text-gray-600">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="font-light text-gray-500"
                                >
                                    {t('landing.creditCards.description')}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                >
                                    <motion.button
                                        className="cursor-pointer rounded-full bg-gray-200 px-6 py-3 font-light text-gray-900 transition-colors hover:bg-gray-300"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {t('landing.creditCards.cta')}
                                    </motion.button>
                                </motion.div>
                            </div>

                            {/* Right Content - Credit Card Container */}
                            <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-blue-50 p-12 md:p-16">
                                {/* Decorative corner shapes */}
                                <div className="absolute left-4 top-4 h-16 w-16 rounded-2xl border-2 border-purple-200/40"></div>
                                <div className="absolute right-4 bottom-4 h-20 w-20 rounded-2xl border-2 border-purple-200/40"></div>
                                <div className="absolute bottom-8 left-8 h-12 w-12 rounded-xl border-2 border-blue-200/40"></div>
                                <div className="absolute right-8 top-8 h-14 w-14 rounded-xl border-2 border-blue-200/40"></div>

                                {/* Credit Card - Vertical */}
                                <motion.div
                                    initial={{ y: -150, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                    className="relative z-10 w-64 rotate-0"
                                >
                                    <div
                                        className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6 shadow-2xl"
                                        style={{ aspectRatio: '0.63' }}
                                    >
                                        <div className="flex h-full flex-col justify-between">
                                            <div className="flex items-center justify-end gap-2">
                                                <Image
                                                    src="/chip.png"
                                                    alt="Card chip"
                                                    width={50}
                                                    height={40}
                                                    className="h-10 w-auto"
                                                />
                                                <Wifi className="h-6 w-6 rotate-90 text-white/80" />
                                            </div>

                                            {/* Stars pattern in the middle */}
                                            <div className="grid grid-cols-8 gap-4 py-8">
                                                {Array.from({ length: 40 }).map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0 }}
                                                        whileInView={{ opacity: [0.2, 0.8, 0.2] }}
                                                        viewport={{ once: false }}
                                                        transition={{
                                                            duration: 2,
                                                            delay: i * 0.05,
                                                            repeat: Infinity,
                                                            repeatType: 'reverse',
                                                        }}
                                                        className="flex items-center justify-center text-white/30 text-xs"
                                                    >
                                                        +
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <div className="flex items-end justify-between">
                                                <Image
                                                    src="/avenir.png"
                                                    alt="AVENIR"
                                                    width={100}
                                                    height={40}
                                                    className="h-8 w-auto brightness-0 invert"
                                                />
                                                <div className="text-xl font-bold text-white/90">
                                                    VISA
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="sticky bottom-0 overflow-hidden bg-gray-900 px-6 py-16 pb-32 text-white md:pb-16">
                <div className="mx-auto max-w-[1400px]">
                    {/* Footer Top Section */}
                    <div className="mb-16">
                        <h2 className="mb-8 text-2xl font-light md:text-3xl lg:text-4xl">
                            {t('landing.footer.title')}
                        </h2>
                        <div className="space-y-2 text-sm">
                            <p className="font-light text-white">{t('landing.footer.company')}</p>
                            <div className="flex gap-4 text-gray-400">
                                <a href="#" className="font-light transition-colors hover:text-white">
                                    {t('landing.footer.privacyPolicy')}
                                </a>
                                <a href="#" className="font-light transition-colors hover:text-white">
                                    {t('landing.footer.termsOfService')}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom Section */}
                    <div className="flex items-center justify-between pt-8">
                        <Image
                            src="/avenir.png"
                            alt="AVENIR"
                            width={120}
                            height={40}
                            className="h-10 w-auto brightness-0 invert"
                        />
                        <nav className="hidden items-center gap-8 md:flex">
                            <a href="#" className="font-light text-gray-200 transition-colors hover:text-white">
                                {t('landing.product')}
                            </a>
                            <a href="#" className="font-light text-gray-200 transition-colors hover:text-white">
                                {t('landing.solution')}
                            </a>
                            <a href="#" className="font-light text-gray-200 transition-colors hover:text-white">
                                {t('landing.community')}
                            </a>
                            <a href="#" className="font-light text-gray-200 transition-colors hover:text-white">
                                {t('landing.about')}
                            </a>
                        </nav>
                    </div>
                </div>
            </footer>
        </div>
    );
}
