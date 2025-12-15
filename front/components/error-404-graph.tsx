'use client';

import { motion } from 'framer-motion';

export const Error404Graph = () => {
    return (
        <div className="relative w-full">
            {/* Grid background */}
            <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-300" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Graph curve */}
            <svg className="relative mx-auto w-full" viewBox="0 0 650 400" xmlns="http://www.w3.org/2000/svg">
                {/* Animated path */}
                <motion.path
                    d="M 25,200 Q 125,150 175,180 T 275,170 T 375,160 T 475,140 T 575,100 L 625,380"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                        duration: 2,
                        ease: 'easeInOut',
                    }}
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                </defs>

                {/* Animated dot following the path */}
                <motion.circle
                    r="6"
                    fill="#ef4444"
                    initial={{ offsetDistance: '0%', opacity: 0 }}
                    animate={{
                        offsetDistance: '100%',
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 2,
                        ease: 'easeInOut',
                        opacity: {
                            times: [0, 0.1, 0.9, 1]
                        }
                    }}
                    style={{
                        offsetPath: 'path("M 25,200 Q 125,150 175,180 T 275,170 T 375,160 T 475,140 T 575,100 L 625,380")',
                    }}
                />
            </svg>

            {/* 404 Text centered below chart */}
            <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 md:bottom-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
            >
                <div className="flex items-center gap-4 text-6xl font-bold text-gray-400 md:gap-6 md:text-8xl">
                    <span>4</span>
                    <span className="text-red-300">0</span>
                    <span>4</span>
                </div>
            </motion.div>
        </div>
    );
};
