'use client';

import { useEffect } from 'react';
import { useMotionValue, animate } from 'framer-motion';

export const useCounterAnimation = (target: number, duration: number = 2) => {
    const count = useMotionValue(0);

    useEffect(() => {
        const controls = animate(count, target, { duration });
        return () => controls.stop();
    }, [count, target, duration]);

    return count;
};
