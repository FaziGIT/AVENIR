'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Package, Grid, Users, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';

export const LandingHeader = () => {
    const { t } = useLanguage();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<string>('product');

    const navItems = [
        { id: 'product', label: t('landing.product'), href: '#', icon: Package },
        { id: 'solution', label: t('landing.solution'), href: '#', icon: Grid },
        { id: 'community', label: t('landing.community'), href: '#', icon: Users },
        { id: 'about', label: t('landing.about'), href: '#', icon: Info },
    ];

    return (
        <>
        <header className="relative z-50">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6">
                <Link
                    href="/"
                    className="flex items-center transition-opacity hover:opacity-80"
                    aria-label="AVENIR Home"
                >
                    <Image src="/avenir.png" alt="AVENIR" width={100} height={100} className="h-12 w-auto" priority />
                </Link>

                <nav className="relative hidden items-center gap-1 rounded-full bg-white p-1 shadow-sm md:flex" role="navigation">
                    {navItems.map((item) => {
                        const displayItem = hoveredItem || activeItem;
                        const shouldShowBackground = displayItem === item.id;

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setActiveItem(item.id)}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className={`relative z-10 flex cursor-pointer items-center rounded-full px-5 py-2 text-sm font-light transition-colors duration-200 ${
                                    shouldShowBackground ? 'text-white' : 'text-gray-600'
                                }`}
                            >
                                {shouldShowBackground && (
                                    <motion.div
                                        layoutId="navBackground"
                                        className="absolute inset-0 rounded-full bg-gray-900"
                                        style={{ zIndex: -1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 380,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/sign-in"
                        className="hidden text-sm font-light text-gray-700 transition-colors hover:text-gray-900 md:block"
                    >
                        {t('landing.signIn')}
                    </Link>
                    <motion.a
                        href="/sign-up"
                        className="cursor-pointer rounded-full bg-gray-900 px-6 py-2.5 text-sm font-light text-white transition-all hover:bg-gray-800"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {t('landing.openAccount')}
                    </motion.a>
                </div>
            </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm md:hidden" role="navigation">
            <div className="flex items-center justify-around gap-2 px-4 py-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setActiveItem(item.id)}
                            className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobileNavBackground"
                                    className="absolute inset-0 rounded-2xl bg-gray-900"
                                    style={{ zIndex: -1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 380,
                                        damping: 30,
                                    }}
                                />
                            )}
                            <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`} />
                            <span className={`text-xs font-light transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
        </>
    );
};
