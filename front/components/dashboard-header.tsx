'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';

interface DashboardHeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const DashboardHeader = ({ activeTab, setActiveTab }: DashboardHeaderProps) => {
    const { t, i18n, toggleLanguage } = useLanguage();
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [activeIcon, setActiveIcon] = useState<string | null>(null);
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'overview', label: t('dashboard.overview'), href: '/dashboard' },
        { id: 'investment', label: t('dashboard.investment'), href: '/dashboard' },
        { id: 'card', label: t('dashboard.card'), href: '/dashboard' },
        { id: 'activity', label: t('dashboard.activity'), href: '/dashboard' },
        { id: 'saving', label: t('dashboard.saving'), href: '/dashboard' },
        { id: 'contact', label: t('dashboard.contact'), href: '/dashboard/contact' },
    ];

    const handleLanguageToggle = () => {
        setActiveIcon('lang');
        toggleLanguage();
    };

    return (
        <header className="border-b bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                    <Image src="/avenir.png" alt="AVENIR" width={100} height={100} className="h-12 w-auto" priority />
                </Link>

                <nav className="relative hidden items-center gap-1 rounded-full bg-white p-1 shadow-sm md:flex">
                    {navItems.map((item) => {
                        const displayTab = hoveredTab || activeTab;
                        const shouldShowBackground = displayTab === item.id;

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setActiveTab(item.id)}
                                onMouseEnter={() => setHoveredTab(item.id)}
                                onMouseLeave={() => setHoveredTab(null)}
                                className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${
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

                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-gray-100 md:hidden"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
                </button>

                <div className="relative hidden items-center gap-2 rounded-full bg-white p-1 shadow-sm md:flex">
                    <button
                        onMouseEnter={() => setHoveredIcon('search')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => setActiveIcon('search')}
                        className="relative z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200"
                    >
                        {(hoveredIcon === 'search' || activeIcon === 'search') && (
                            <motion.div
                                layoutId="iconBackground"
                                className="absolute inset-0 rounded-full bg-gray-900"
                                style={{ zIndex: -1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 30,
                                }}
                            />
                        )}
                        <Search
                            className={`h-5 w-5 ${hoveredIcon === 'search' || activeIcon === 'search' ? 'text-white' : 'text-gray-600'}`}
                        />
                    </button>
                    <button
                        onMouseEnter={() => setHoveredIcon('bell')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => setActiveIcon('bell')}
                        className="relative z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200"
                    >
                        {(hoveredIcon === 'bell' || activeIcon === 'bell') && (
                            <motion.div
                                layoutId="iconBackground"
                                className="absolute inset-0 rounded-full bg-gray-900"
                                style={{ zIndex: -1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 30,
                                }}
                            />
                        )}
                        <Bell
                            className={`h-5 w-5 ${hoveredIcon === 'bell' || activeIcon === 'bell' ? 'text-white' : 'text-gray-600'}`}
                        />
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                    </button>
                    <button
                        onMouseEnter={() => setHoveredIcon('user')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={() => setActiveIcon('user')}
                        className="relative z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200"
                    >
                        {(hoveredIcon === 'user' || activeIcon === 'user') && (
                            <motion.div
                                layoutId="iconBackground"
                                className="absolute inset-0 rounded-full bg-gray-900"
                                style={{ zIndex: -1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 30,
                                }}
                            />
                        )}
                        <User
                            className={`h-5 w-5 ${hoveredIcon === 'user' || activeIcon === 'user' ? 'text-white' : 'text-gray-600'}`}
                        />
                    </button>
                    <button
                        onMouseEnter={() => setHoveredIcon('lang')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={handleLanguageToggle}
                        className="relative z-10 flex h-10 min-w-[40px] cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold transition-colors duration-200"
                    >
                        {(hoveredIcon === 'lang' || activeIcon === 'lang') && (
                            <motion.div
                                layoutId="iconBackground"
                                className="absolute inset-0 rounded-full bg-gray-900"
                                style={{ zIndex: -1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 380,
                                    damping: 30,
                                }}
                            />
                        )}
                        <span className={`${hoveredIcon === 'lang' || activeIcon === 'lang' ? 'text-white' : 'text-gray-600'}`}>
                            {i18n.language.toUpperCase()}
                        </span>
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t bg-white md:hidden"
                >
                    <div className="mx-auto max-w-[1800px] px-6 py-4">
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                                            isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}

                            <div className="my-2 border-t border-gray-200"></div>

                            <div className="flex items-center justify-center gap-2 rounded-full bg-white p-1">
                                <button
                                    onClick={() => {
                                        setActiveIcon('search');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                                >
                                    <Search className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveIcon('bell');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                                >
                                    <Bell className="h-5 w-5 text-gray-600" />
                                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveIcon('user');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                                >
                                    <User className="h-5 w-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={() => {
                                        handleLanguageToggle();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex h-10 min-w-[40px] cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold transition-colors hover:bg-gray-100"
                                >
                                    {i18n.language.toUpperCase()}
                                </button>
                            </div>
                        </nav>
                    </div>
                </motion.div>
            )}
        </header>
    );
};
