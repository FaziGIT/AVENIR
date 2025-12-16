'use client';

import { motion, useTransform } from 'framer-motion';
import { useCounterAnimation } from '@/hooks/use-counter-animation';

interface AnimatedNumberProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    delay?: number;
}

export const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 0, delay = 0 }: AnimatedNumberProps) => {
    const count = useCounterAnimation(value, 1.5);
    const rounded = useTransform(count, (latest) =>
        decimals > 0
            ? latest.toFixed(decimals)
            : Math.round(latest).toLocaleString('en-US')
    );

    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + delay }}
        >
            {prefix}
            <motion.span>{rounded}</motion.span>
            {suffix}
        </motion.span>
    );
};
