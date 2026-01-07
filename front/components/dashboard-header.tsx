'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, User, Menu, X, LogOut, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/enums';
import { NotificationButton } from '@/components/notifications/notification-button';

interface DashboardHeaderProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onDeleteAccount?: () => void;
}

export const DashboardHeader = ({ activeTab, setActiveTab, onDeleteAccount }: DashboardHeaderProps) => {
    const { t, i18n, toggleLanguage } = useLanguage();
    const { logout, user: currentUser } = useAuth();
    const router = useRouter();
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [activeIcon, setActiveIcon] = useState<string | null>(null);
    const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    let navItems;
    switch (currentUser?.role) {
        case UserRole.DIRECTOR:
            navItems = [
                { id: 'investment', label: t('dashboard.investmentHeader'), href: '/dashboard/investment' },
                { id: 'clients', label: t('dashboard.clients'), href: '/dashboard/clients' },
                { id: 'contact', label: t('dashboard.contact'), href: '/dashboard/contact' },
            ];
            break;
        case UserRole.ADVISOR:
            navItems = [
                { id: 'clients', label: t('dashboard.clients'), href: '/dashboard/clients' },
                { id: 'news', label: t('news.title'), href: '/dashboard/news' },
                { id: 'contact', label: t('dashboard.contact'), href: '/dashboard/contact' },
            ];
            break;
        default:
            navItems = [
                { id: 'overview', label: t('dashboard.overview'), href: '/dashboard' },
                { id: 'investment', label: t('dashboard.investmentHeader'), href: '/dashboard/investment' },
                { id: 'card', label: t('dashboard.card'), href: '/dashboard' },
                { id: 'activity', label: t('dashboard.activity'), href: '/dashboard' },
                { id: 'saving', label: t('dashboard.saving'), href: '/dashboard' },
                { id: 'loans', label: t('dashboard.loans'), href: '/dashboard/loans' },
                { id: 'contact', label: t('dashboard.contact'), href: '/dashboard/contact' },
            ];
            break;
    }

    const handleLanguageToggle = () => {
        setActiveIcon('lang');
        toggleLanguage();
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    return (
        <header className="relative z-40 border-b bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-450 items-center justify-between px-6 py-4">
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
                                className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${shouldShowBackground ? 'text-white' : 'text-gray-600'
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

                <div className="relative z-50 hidden items-center gap-2 rounded-full bg-white p-1 shadow-sm md:flex">
                    {/* Search */}
                    {currentUser?.role === UserRole.CLIENT && (
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
                    )}

                    {/* Notifications */}
                    {currentUser?.role === UserRole.CLIENT && (
                        <NotificationButton />
                    )}

                    {/* Menu */}
                    <div ref={userMenuRef} className="relative">
                        <button
                            onMouseEnter={() => setHoveredIcon('user')}
                            onMouseLeave={() => setHoveredIcon(null)}
                            onClick={() => {
                                setUserMenuOpen(!userMenuOpen);
                                setActiveIcon(userMenuOpen ? null : 'user');
                            }}
                            className="relative z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200"
                        >
                            {(hoveredIcon === 'user' || activeIcon === 'user' || userMenuOpen) && (
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
                            className={`h-5 w-5 ${hoveredIcon === 'user' || activeIcon === 'user' || userMenuOpen ? 'text-white' : 'text-gray-600'}`}
                        />
                    </button>

                    <AnimatePresence>
                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                            >
                                <div className="py-1">
                                    {/* Supprimer mon compte (uniquement pour les clients) */}
                                    {currentUser?.role === UserRole.CLIENT && onDeleteAccount && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setUserMenuOpen(false);
                                                    onDeleteAccount();
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                                <span className="font-medium">{t('account.deleteAccount.button')}</span>
                                            </button>
                                            <div className="border-t border-gray-100"></div>
                                        </>
                                    )}

                                    {/* Déconnexion */}
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="font-medium">{t('nav.logout')}</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    </div>

                    {/* Bouton langue */}
                    <button
                        onMouseEnter={() => setHoveredIcon('lang')}
                        onMouseLeave={() => setHoveredIcon(null)}
                        onClick={handleLanguageToggle}
                        className="relative z-10 flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold transition-colors duration-200"
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
                    <div className="mx-auto max-w-450 px-6 py-4">
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => {
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setMobileMenuOpen(false);
                                            router.push(item.href);
                                        }}
                                        className={`cursor-pointer rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}

                            <div className="my-2 border-t border-gray-200"></div>

                            {/* Déconnexion */}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    handleLogout();
                                }}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>{t('nav.logout')}</span>
                            </button>

                            <div className="my-2 border-t border-gray-200"></div>

                            {currentUser?.role === UserRole.CLIENT && (
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
                                    <NotificationButton />
                                    <button
                                        onClick={() => {
                                            handleLanguageToggle();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold transition-colors hover:bg-gray-100"
                                    >
                                        {i18n.language.toUpperCase()}
                                    </button>
                                </div>
                            )}

                            {/* Bouton langue */}
                            {(currentUser?.role === UserRole.ADVISOR || currentUser?.role === UserRole.DIRECTOR) && (
                                <div className="flex items-center justify-center gap-2 rounded-full bg-white p-1">
                                    <button
                                        onClick={() => {
                                            handleLanguageToggle();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full px-3 text-xs font-bold transition-colors hover:bg-gray-100"
                                    >
                                        {i18n.language.toUpperCase()}
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                </motion.div>
            )}
        </header>
    );
};
