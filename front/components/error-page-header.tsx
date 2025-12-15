'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';

export const ErrorPageHeader = () => {
    const { i18n, toggleLanguage } = useLanguage();

    return (
        <header className="border-b bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
                    <Image src="/avenir.png" alt="AVENIR" width={100} height={100} className="h-12 w-auto" priority />
                </Link>

                <button
                    onClick={toggleLanguage}
                    className="cursor-pointer rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-gray-800"
                >
                    {i18n.language.toUpperCase()}
                </button>
            </div>
        </header>
    );
};
