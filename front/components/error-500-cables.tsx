'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import cablesImage from './assets/disconnected_cables_vector.png';

export const Error500Cables = () => {
    return (
        <div className="relative w-full">
            {/* Grid background */}
            <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid-500" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-300" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-500)" />
            </svg>

            {/* Disconnected cables image */}
            <motion.div
                className="relative mx-auto max-w-3xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <Image
                        src={cablesImage}
                        alt="Disconnected cables"
                        width={1200}
                        height={400}
                        className="w-full"
                        priority
                    />
                </motion.div>
            </motion.div>

            {/* 500 Text centered below */}
            <motion.div
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:-bottom-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
            >
                <div className="flex items-center gap-4 text-6xl font-bold text-gray-400 md:gap-6 md:text-8xl">
                    <span>5</span>
                    <span className="text-red-300">0</span>
                    <span>0</span>
                </div>
            </motion.div>
        </div>
    );
};
